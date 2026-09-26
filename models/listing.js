const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },

    description: String,

    image: {
        filename: String,
        url: String
    },

    price: Number,

    location: String,

    country: String,

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
});


// Delete all reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async function (listing) {

    if (listing) {
        await mongoose.model("Review").deleteMany({
            listing: listing._id
        });
    }

});


const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;