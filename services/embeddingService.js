let pipelineInstance = null;

/**
 * Returns a cached singleton of the feature-extraction pipeline.
 * Uses all-MiniLM-L6-v2 which runs locally, fast (~20ms), with 384-dimensional embeddings.
 */
async function getExtractor() {
    if (!pipelineInstance) {
        const { pipeline } = await import("@xenova/transformers");
        pipelineInstance = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    }
    return pipelineInstance;
}

/**
 * Generates a normalized 384-dimensional embedding vector for given text.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
async function generateEmbedding(text) {
    if (!text || typeof text !== "string") return [];
    const extractor = await getExtractor();
    const output = await extractor(text.trim(), { pooling: "mean", normalize: true });
    return Array.from(output.data);
}

/**
 * Constructs a rich descriptive representation of a listing for semantic indexing.
 * @param {Object} listing
 * @returns {string}
 */
function buildListingDocument(listing) {
    const parts = [];
    if (listing.title) parts.push(`Title: ${listing.title}`);
    if (listing.category) parts.push(`Category: ${listing.category}`);
    if (listing.location || listing.country) {
        parts.push(`Location: ${[listing.location, listing.country].filter(Boolean).join(", ")}`);
    }
    if (listing.price) parts.push(`Price: ₹${listing.price} per night`);
    if (listing.description) parts.push(`Description: ${listing.description}`);
    return parts.join(". ");
}

/**
 * Computes cosine similarity between two normalized vectors (dot product).
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number}
 */
function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dot = 0;
    for (let i = 0; i < vecA.length; i++) {
        dot += vecA[i] * vecB[i];
    }
    return dot;
}

/**
 * Checks if the user message is just a general conversational greeting or inquiry.
 * @param {string} text
 * @returns {boolean}
 */
function isConversationalOnly(text) {
    if (!text) return true;
    const clean = text.trim().toLowerCase().replace(/[^\w\s]/g, "");
    const greetings = [
        "hi", "hello", "hey", "heya", "hola", "sup",
        "good morning", "good evening", "good afternoon",
        "who are you", "what can you do", "help", "how are you",
        "tell me about yourself", "what is nesthunt", "thanks", "thank you"
    ];
    return greetings.includes(clean);
}

/**
 * Extracts a price ceiling (maxPrice) from natural language query if present.
 * e.g., "under 2000", "below 1500", "less than ₹3000", "< 2500"
 * @param {string} text
 * @returns {number|null}
 */
function extractMaxPrice(text) {
    if (!text) return null;
    const match = text.match(/(?:under|below|less than|budget|max|<)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
    if (match && match[1]) {
        return parseInt(match[1], 10);
    }
    return null;
}

/**
 * Hybrid search that blends vector cosine similarity with exact entity & keyword matching:
 * - Direct Country Match (e.g. "India" matches country: "India") gets a strong boost (+0.45)
 * - Direct Location/City Match gets a strong boost (+0.40)
 * - Price constraint filtering (penalizes stays over user budget)
 * - Category matching boost (+0.25)
 *
 * @param {string} queryText
 * @param {number[]} queryVec
 * @param {Array} listings
 * @param {number} topK
 * @returns {Array} Array of listings with `similarityScore` attached
 */
function rankListingsBySimilarity(queryText, queryVec, listings, topK = 4) {
    if (!listings || listings.length === 0) return [];

    const lowerQuery = (queryText || "").toLowerCase();
    const maxPrice = extractMaxPrice(lowerQuery);

    const scored = [];
    for (const listing of listings) {
        if (!listing.embedding || listing.embedding.length === 0) continue;

        // Base vector similarity (0 to 1)
        let vectorScore = 0;
        if (queryVec && queryVec.length > 0) {
            vectorScore = cosineSimilarity(queryVec, listing.embedding);
        }

        let boost = 0;

        // 1. Exact Country Match (word-bounded so "India" matches country "India" but not random words)
        if (listing.country) {
            const countryRegex = new RegExp(`\\b${listing.country.trim()}\\b`, "i");
            if (countryRegex.test(lowerQuery)) {
                boost += 0.50; // Strong guarantee for requested country
            }
        }

        // 2. Exact Location/City Match
        if (listing.location) {
            const locRegex = new RegExp(`\\b${listing.location.trim()}\\b`, "i");
            if (locRegex.test(lowerQuery)) {
                boost += 0.40;
            }
        }

        // 3. Category Match
        if (listing.category && lowerQuery.includes(listing.category.toLowerCase())) {
            boost += 0.25;
        }

        // 4. Title Keyword Match
        if (listing.title) {
            const titleWords = listing.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
            for (const word of titleWords) {
                if (lowerQuery.includes(word)) {
                    boost += 0.15;
                    break;
                }
            }
        }

        // 5. Price Constraint Filtering
        if (maxPrice && listing.price) {
            if (listing.price <= maxPrice) {
                boost += 0.20; // Within budget bonus
            } else {
                boost -= 0.60; // Over budget penalty
            }
        }

        const finalScore = vectorScore + boost;
        scored.push({ listing, finalScore, vectorScore });
    }

    scored.sort((a, b) => b.finalScore - a.finalScore);

    return scored.slice(0, topK).map(item => ({
        ...item.listing.toObject ? item.listing.toObject() : item.listing,
        similarityScore: item.finalScore
    }));
}

module.exports = {
    generateEmbedding,
    buildListingDocument,
    cosineSimilarity,
    isConversationalOnly,
    extractMaxPrice,
    rankListingsBySimilarity
};
