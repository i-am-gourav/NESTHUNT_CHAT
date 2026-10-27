const Groq = require("groq-sdk");
const Listing = require("../models/listing.js");
const { 
    generateEmbedding, 
    rankListingsBySimilarity, 
    isConversationalOnly 
} = require("./embeddingService.js");

let groqClient = null;

function getGroqClient() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === "your_groq_api_key_here") {
        return null;
    }
    if (!groqClient) {
        groqClient = new Groq({ apiKey });
    }
    return groqClient;
}

// Active models on Groq in priority order
const GROQ_MODELS = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3.8-27b"
];

/**
 * Handles RAG chat generation:
 * 1. Checks if the query is a simple greeting
 * 2. If property search: embeds query and performs hybrid vector + metadata retrieval
 * 3. Builds augmented context
 * 4. Calls Groq for conversational response
 *
 * @param {Object} options
 * @param {string} options.message - User message
 * @param {Array} [options.history] - Chat history
 * @returns {Promise<{ reply: string, listings: Array }>}
 */
async function generateChatResponse({ message, history = [] }) {
    if (!message || typeof message !== "string" || !message.trim()) {
        return {
            reply: "Hello! I am your NestHunt Concierge. Tell me where you want to travel, your budget, or your preferred vibe, and I will find the best stays for you!",
            listings: []
        };
    }

    const trimmedMsg = message.trim();
    const isGreeting = isConversationalOnly(trimmedMsg);

    let topListings = [];

    // Only search listings if the user is actually looking for properties / places
    if (!isGreeting) {
        // 1. Generate query embedding
        let queryVec = [];
        try {
            queryVec = await generateEmbedding(trimmedMsg);
        } catch (embErr) {
            console.error("Query embedding generation error:", embErr.message);
        }

        // 2. Retrieve listings with embeddings and apply Hybrid Search
        try {
            const allEmbeddings = await Listing.find({
                embedding: { $exists: true, $ne: [] }
            }).select("title description category price location country image embedding");

            topListings = rankListingsBySimilarity(trimmedMsg, queryVec, allEmbeddings, 4);

            // If we have strong matches (e.g. >= 0.65 from country/location boost), only keep strong matches
            const hasStrongMatch = topListings.length > 0 && topListings[0].similarityScore >= 0.65;
            if (hasStrongMatch) {
                topListings = topListings.filter(l => l.similarityScore >= 0.50);
            } else {
                topListings = topListings.filter(l => l.similarityScore >= 0.30);
            }
        } catch (dbErr) {
            console.error("Vector retrieval error:", dbErr.message);
        }
    }

    // 3. Check for Groq API key
    const groq = getGroqClient();
    if (!groq) {
        return {
            reply: topListings.length > 0
                ? "Here are the stays matching your search! (Please set a valid `GROQ_API_KEY` in `.env` to unlock full AI conversational chat)."
                : "Hello! How can I help you find your dream vacation stay today? (Please set `GROQ_API_KEY` in `.env` for AI conversation).",
            listings: formatListingCards(topListings)
        };
    }

    // 4. Build Context for LLM
    const contextListingsText = topListings.length > 0
        ? topListings.map((l, idx) => {
            return `[Listing #${idx + 1}]
Title: ${l.title}
Category: ${l.category || "General"}
Location: ${l.location || ""}, ${l.country || ""}
Price: ₹${l.price} / night
Description: ${l.description || "No description available."}`;
        }).join("\n\n")
        : "No specific property matches for this turn.";

    const systemPrompt = `You are "NestHunt Concierge", an expert, warm, and articulate travel assistant for NestHunt (an Airbnb-style vacation rental platform).

Guidelines:
1. If the user is just saying hello, asking who you are, or making small talk:
   - Greet them warmly and politely.
   - Explain that you can help them find stays by destination, price, or vibe (e.g., beachfront villas, mountain cabins, castles, pools).
   - Do not recite fake property names.

2. If listings are provided in the RETRIEVED LISTINGS CONTEXT:
   - Present recommendations to the user based on those listings.
   - Mention each listing title in bold (**Listing Title**), its location, price in ₹, and explain why it fits what they asked for.
   - Be helpful, conversational, and concise (use bullet points if comparing multiple places).
   - Do NOT invent or hallucinate properties that are not in the context.

3. If the user asked for a destination or stay that does not exist in the context:
   - Politely inform them that we don't currently have stays in that specific location, but offer to suggest other popular destinations.

RETRIEVED LISTINGS CONTEXT:
${contextListingsText}
`;

    // 5. Build Messages array with recent history
    const messages = [
        { role: "system", content: systemPrompt }
    ];

    const recentHistory = Array.isArray(history) ? history.slice(-6) : [];
    for (const h of recentHistory) {
        if (h && (h.role === "user" || h.role === "assistant") && typeof h.content === "string") {
            messages.push({ role: h.role, content: h.content });
        }
    }

    messages.push({ role: "user", content: trimmedMsg });

    // 6. Call Groq with active models
    for (const model of GROQ_MODELS) {
        try {
            const completion = await groq.chat.completions.create({
                model,
                messages,
                temperature: 0.6,
                max_tokens: 600
            });

            const reply = completion.choices[0]?.message?.content;
            if (reply) {
                return {
                    reply,
                    listings: formatListingCards(topListings)
                };
            }
        } catch (modelErr) {
            console.warn(`Groq model ${model} failed:`, modelErr.message);
            // Try next model in GROQ_MODELS array
        }
    }

    // Ultimate fallback if all models failed
    return {
        reply: topListings.length > 0
            ? "Here are the top stays matching your search from our catalog:"
            : "Hello! How can I assist you in finding your next stay?",
        listings: formatListingCards(topListings)
    };
}

/**
 * Strips internal vector data and formats clean objects for frontend cards
 */
function formatListingCards(listings) {
    return listings.map(l => ({
        id: l._id,
        title: l.title,
        price: l.price,
        location: l.location,
        country: l.country,
        category: l.category,
        image: l.image && l.image.url ? l.image.url : "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=60",
        similarityScore: l.similarityScore ? Number(l.similarityScore.toFixed(3)) : 0
    }));
}

module.exports = {
    generateChatResponse
};
