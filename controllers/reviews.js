const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js");
const cacheService = require("../services/cacheService.js");

module.exports.createReview = async (req, res) => {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    const newReview = new Review(req.body.review);
    newReview.listing = listing._id;
    newReview.author = req.user._id;

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    // Invalidate cached listing so fresh reviews show immediately
    await cacheService.del(`listing:${listing._id}`);

    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    // Invalidate cached listing after review removal
    await cacheService.del(`listing:${id}`);

    res.redirect(`/listings/${id}`);
};
