const express = require("express");

const app = express();

const mongoose = require("mongoose");

const path = require("path");

const methodOverride = require("method-override");

const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError.js");

const wrapAsync = require("./utils/WrapAsync.js");

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

app.engine("ejs", ejsMate);

app.use(express.static(path.join(__dirname, "/public")));

const { listingSchema, reviewSchema } = require("./schema.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/NESTHUNT";


// Connect to MongoDB
async function main() {
    await mongoose.connect(MONGO_URL);
}

main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });


const validateListing = (req, res, next) => {

    const { error } = listingSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(", ");

        throw new ExpressError(400, msg);
    }

    next();
};

// ROOT ROUTE
app.get("/", (req, res) => {
    res.send("Hi, I am root");
});


// INDEX ROUTE
app.get("/listings", wrapAsync(async (req, res) => {

    const allListings = await Listing.find({});

    res.render("listings/index.ejs", { allListings });

}));


// NEW ROUTE
app.get("/listings/new", (req, res) => {

    res.render("listings/new.ejs");

});


// CREATE ROUTE
app.post(
    "/listings",
    validateListing,
    wrapAsync(async (req, res) => {

        const newListing = new Listing(req.body.listing);

        await newListing.save();

        res.redirect("/listings");

    })
);


// EDIT ROUTE
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {

    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    res.render("listings/edit.ejs", { listing });

}));


// UPDATE ROUTE
app.put(
    "/listings/:id",
    validateListing,
    wrapAsync(async (req, res) => {

        const { id } = req.params;

        const listing = await Listing.findByIdAndUpdate(
            id,
            req.body.listing,
            {
                runValidators: true,
                new: true
            }
        );

        if (!listing) {
            throw new ExpressError(404, "Listing not found");
        }

        res.redirect(`/listings/${id}`);

    })
);


// DELETE ROUTE
app.delete("/listings/:id", wrapAsync(async (req, res) => {

    const { id } = req.params;

    const listing = await Listing.findByIdAndDelete(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    res.redirect("/listings");

}));

// SHOW ROUTE
app.get("/listings/:id", wrapAsync(async (req, res) => {

    const { id } = req.params;

    const listing = await Listing.findById(id).populate("reviews");

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    res.render("listings/show.ejs", { listing });

}));

// EDIT ROUTE
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {

    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    res.render("listings/edit.ejs", { listing });

}));

// CUSTOM ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {

    const {
        statusCode = 500,
        message = "Something went wrong"
    } = err;

    res.status(statusCode).render("error.ejs", {
        message
    });

});

// Show review Route and It's validation also done here.

app.post("/listings/:id/reviews", wrapAsync(async (req, res) => {

    const { error } = reviewSchema.validate(req.body);

    if (error) {
        throw new ExpressError(400, error.details[0].message);
    }

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    const newReview = new Review(req.body.review);

    // Connect the review to the listing
    newReview.listing = listing._id;

    // Add review ID to the listing
    listing.reviews.push(newReview);

    // Save both documents
    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);

}));

// PORT LISTENING
app.listen(8080, () => {

    console.log("Server is listening to port 8080");

});