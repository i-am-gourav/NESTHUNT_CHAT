const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const { generateEmbedding, buildListingDocument } = require("../services/embeddingService.js");

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/NESTHUNT";

async function run() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB for embedding generation.");

        // Find listings without embeddings or where embedding length is 0
        const listings = await Listing.find({
            $or: [
                { embedding: { $exists: false } },
                { embedding: { $size: 0 } }
            ]
        });

        console.log(`Found ${listings.length} listings to index with embeddings.`);

        let processed = 0;
        for (const listing of listings) {
            const docText = buildListingDocument(listing);
            const vector = await generateEmbedding(docText);
            await Listing.updateOne(
                { _id: listing._id },
                { $set: { embedding: vector } }
            );
            processed++;
            console.log(`[${processed}/${listings.length}] Indexed: "${listing.title}"`);
        }

        console.log("✅ All listings have been successfully embedded and indexed!");
    } catch (err) {
        console.error("Error generating embeddings:", err);
    } finally {
        await mongoose.connection.close();
        console.log("Database connection closed.");
    }
}

run();
