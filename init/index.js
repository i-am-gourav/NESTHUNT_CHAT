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

    const listingsWithOwner = data.data.map((obj) => ({
        ...obj,
        owner: demoUser._id,
        geometry: obj.geometry || {
            type: "Point",
            coordinates: [77.2090, 28.6139]
        }
    }));

    await Listing.insertMany(listingsWithOwner);
    console.log("data was initialized with owner");
};

if (require.main === module) {
    initDB().then(() => {
        mongoose.connection.close();
    });
}

module.exports = initDB;