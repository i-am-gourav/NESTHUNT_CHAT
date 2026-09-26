const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    comment: String,

    rating: {
        type: Number,
        min: 1,
        max: 5
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing"
    }
});

module.exports = mongoose.model("Review", reviewSchema);