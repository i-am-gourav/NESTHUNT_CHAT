const mongoose = require("mongoose");
const data = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/NESTHUNT";

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});

    // Ensure a demo user exists for seeding
    let demoUser = await User.findOne({ username: "demouser" });
    if (!demoUser) {
        demoUser = new User({
            username: "demouser",
            email: "demo@nesthunt.com",
            password: "password123"
        });
        await demoUser.save();
    }

    const categoriesList = [
        "Trending", "Rooms", "Iconic Cities", "Mountains",
        "Castles", "Amazing Pools", "Camping", "Farms",
        "Arctic", "Domes", "Boats", "Beachfront"
    ];

    const listingsWithOwner = data.data.map((obj, index) => {
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
        else matchedCat = categoriesList[index % categoriesList.length];

        return {
            ...obj,
            owner: demoUser._id,
            category: obj.category || matchedCat,
            geometry: obj.geometry || {
                type: "Point",
                coordinates: [77.2090, 28.6139]
            }
        };
    });

    await Listing.insertMany(listingsWithOwner);
    console.log("data was initialized with owner");
};

if (require.main === module) {
    initDB().then(() => {
        mongoose.connection.close();
    });
}

module.exports = initDB;