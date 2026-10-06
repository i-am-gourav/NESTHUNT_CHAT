const jwt = require("jsonwebtoken");
const User = require("./models/user.js");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

// Extract user from JWT token and attach to req.user and res.locals.currentUser
const attachCurrentUser = async (req, res, next) => {
    const token = req.cookies ? req.cookies.token : null;

    if (!token) {
        req.user = null;
        res.locals.currentUser = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");

        if (user) {
            req.user = user;
            res.locals.currentUser = user;
        } else {
            req.user = null;
            res.locals.currentUser = null;
            res.clearCookie("token");
        }
    } catch (err) {
        req.user = null;
        res.locals.currentUser = null;
        res.clearCookie("token");
    }

    next();
};

// Authentication Middleware: Checks if user is logged in
const isLoggedIn = (req, res, next) => {
    if (!req.user) {
        const token = req.cookies ? req.cookies.token : null;
        let errorMessage = "Please login to continue.";

        if (token) {
            try {
                jwt.verify(token, process.env.JWT_SECRET);
            } catch (err) {
                if (err.name === "TokenExpiredError") {
                    errorMessage = "Your session has expired. Please login again.";
                } else {
                    errorMessage = "Invalid session. Please login again.";
                }
            }
        }

        if (req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"))) {
            return res.status(401).json({ error: errorMessage });
        }

        return res.redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
    }

    next();
};

// Listing Authorization Middleware: Checks if the logged-in user owns the listing
const isOwner = async (req, res, next) => {
    const { id } = req.params;

    if (!req.user) {
        return res.redirect(`/login?error=${encodeURIComponent("Please login to continue.")}`);
    }

    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    if (!listing.owner || !listing.owner.equals(req.user._id)) {
        throw new ExpressError(403, "You are not authorized to perform this action");
    }

    next();
};

// Review Authorization Middleware: Checks if the logged-in user wrote the review
const isReviewAuthor = async (req, res, next) => {
    const { reviewId } = req.params;

    if (!req.user) {
        return res.redirect(`/login?error=${encodeURIComponent("Please login to continue.")}`);
    }

    const review = await Review.findById(reviewId);

    if (!review) {
        throw new ExpressError(404, "Review not found");
    }

    if (!review.author || !review.author.equals(req.user._id)) {
        throw new ExpressError(403, "You are not authorized to perform this action");
    }

    next();
};

// Validate Listing Middleware
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);

    if (error) {
        const msg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, msg);
    }

    next();
};

// Validate Review Middleware
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        throw new ExpressError(400, error.details[0].message);
    }

    next();
};

module.exports = {
    attachCurrentUser,
    isLoggedIn,
    isOwner,
    isReviewAuthor,
    validateListing,
    validateReview
};
