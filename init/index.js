const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const data = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const Review = require("../models/review.js");

const MONGO_URL = process.env.ATLASDB_URL || process.env.MONGO_URL || "mongodb://127.0.0.1:27017/NESTHUNT";

main()
    .then(() => {
        console.log("Connected to MongoDB for seeding");
    })
    .catch((err) => {
        console.log("MongoDB connection error:", err.message);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const sampleReviews = [
    {
        comment: "Absolutely breathtaking stay! The views at sunrise were unforgettable, and the space was sparkling clean with every amenity you could possibly need. Will definitely return!",
        rating: 5
    },
    {
        comment: "Wonderful aesthetic and cozy atmosphere. Centrally located yet peaceful. The host was incredibly responsive and offered great local dining tips.",
        rating: 5
    },
    {
        comment: "Exceeded all our expectations! The bed was super comfortable, check-in was seamless, and the kitchen was fully equipped for cooking.",
        rating: 5
    },
    {
        comment: "Charming stay with authentic character. Loved having morning coffee out on the terrace. Very clean and well kept.",
        rating: 4
    },
    {
        comment: "One of the best vacations we've had! Beautiful decor, high-speed Wi-Fi, and a tranquil neighborhood. Highly recommended to everyone.",
        rating: 5
    },
    {
        comment: "Great value for money. Spacious rooms and a very attentive host who made sure our arrival was effortless.",
        rating: 4
    }
];

const initDB = async () => {
    await Review.deleteMany({});
    await Listing.deleteMany({});

    // Ensure demo host exists
    let demoUser = await User.findOne({ username: "demouser" });
    if (!demoUser) {
        demoUser = new User({
            username: "demouser",
            email: "demo@nesthunt.com",
            password: "password123"
        });
        await demoUser.save();
    }

    // Ensure sample reviewers exist
    const reviewerNames = [
        { username: "aarav_traveler", email: "aarav@example.com" },
        { username: "sophia_explorer", email: "sophia@example.com" },
        { username: "rohan_wanderer", email: "rohan@example.com" },
        { username: "elena_nomad", email: "elena@example.com" }
    ];

    const reviewers = [];
    for (const r of reviewerNames) {
        let u = await User.findOne({ username: r.username });
        if (!u) {
            u = new User({
                username: r.username,
                email: r.email,
                password: "password123"
            });
            await u.save();
        }
        reviewers.push(u);
    }

    const categoriesList = [
        "Trending", "Rooms", "Iconic Cities", "Mountains",
        "Castles", "Amazing Pools", "Camping", "Farms",
        "Arctic", "Domes", "Boats", "Beachfront"
    ];

    let reviewIndex = 0;

    for (let i = 0; i < data.data.length; i++) {
        const obj = data.data[i];
        let matchedCat = "Trending";
        const t = (obj.title + " " + obj.description).toLowerCase();
        if (t.includes("beach") || t.includes("ocean") || t.includes("sea")) matchedCat = "Beachfront";
        else if (t.includes("mountain") || t.includes("cabin") || t.includes("ski")) matchedCat = "Mountains";
        else if (t.includes("city") || t.includes("downtown") || t.includes("loft")) matchedCat = "Iconic Cities";
        else if (t.includes("pool") || t.includes("villa")) matchedCat = "Amazing Pools";
        else if (t.includes("castle") || t.includes("historic")) matchedCat = "Castles";
        else if (t.includes("camp") || t.includes("tent") || t.includes("treehouse")) matchedCat = "Camping";
        else if (t.includes("farm") || t.includes("ranch")) matchedCat = "Farms";
        else if (t.includes("arctic") || t.includes("snow") || t.includes("lake")) matchedCat = "Arctic";
        else if (t.includes("boat") || t.includes("ship")) matchedCat = "Boats";
        else matchedCat = categoriesList[i % categoriesList.length];

        const newListing = new Listing({
            ...obj,
            owner: demoUser._id,
            category: obj.category || matchedCat,
            geometry: obj.geometry || {
                type: "Point",
                coordinates: [77.2090, 28.6139]
            },
            reviews: []
        });

        await newListing.save();

        // Attach 2 good reviews per listing from different reviewers
        const rev1Template = sampleReviews[reviewIndex % sampleReviews.length];
        const rev2Template = sampleReviews[(reviewIndex + 1) % sampleReviews.length];
        const reviewer1 = reviewers[reviewIndex % reviewers.length];
        const reviewer2 = reviewers[(reviewIndex + 1) % reviewers.length];
        reviewIndex += 2;

        const rev1 = new Review({
            comment: rev1Template.comment,
            rating: rev1Template.rating,
            author: reviewer1._id,
            listing: newListing._id
        });
        const rev2 = new Review({
            comment: rev2Template.comment,
            rating: rev2Template.rating,
            author: reviewer2._id,
            listing: newListing._id
        });

        await rev1.save();
        await rev2.save();

        newListing.reviews.push(rev1._id, rev2._id);
        await newListing.save();
    }

    console.log(`Database seeded with ${data.data.length} listings and authentic reviews!`);
};

if (require.main === module) {
    initDB().then(() => {
        mongoose.connection.close();
    });
}

module.exports = initDB;