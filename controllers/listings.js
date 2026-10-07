const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const getGeocoder = () => {
    const token = process.env.MAP_TOKEN;
    if (!token) return null;
    return mbxGeocoding({ accessToken: token });
};

module.exports.index = async (req, res) => {
    const { category, search } = req.query;
    let queryConditions = [];

    if (category && category.trim() !== "") {
        const catRegex = new RegExp(category.trim(), "i");
        queryConditions.push({
            $or: [
                { category: catRegex },
                { title: catRegex },
                { description: catRegex },
                { location: catRegex },
                { country: catRegex }
            ]
        });
    }

    if (search && search.trim() !== "") {
        const searchRegex = new RegExp(search.trim(), "i");
        queryConditions.push({
            $or: [
                { title: searchRegex },
                { location: searchRegex },
                { country: searchRegex },
                { description: searchRegex },
                { category: searchRegex }
            ]
        });
    }

    let filter = {};
    if (queryConditions.length === 1) {
        filter = queryConditions[0];
    } else if (queryConditions.length > 1) {
        filter = { $and: queryConditions };
    }

    const allListings = await Listing.find(filter);
    res.render("listings/index.ejs", { 
        allListings, 
        currentCategory: category || "", 
        searchQuery: search || "" 
    });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.createListing = async (req, res) => {
    const geocoder = getGeocoder();
    let geometry = null;

    if (geocoder) {
        try {
            const response = await geocoder.forwardGeocode({
                query: `${req.body.listing.location}, ${req.body.listing.country}`,
                limit: 1
            }).send();

            if (response.body.features && response.body.features.length) {
                geometry = response.body.features[0].geometry;
            }
        } catch (err) {
            console.error("Mapbox geocoding error during create:", err.message);
        }
    }

    if (!geometry) {
        geometry = {
            type: "Point",
            coordinates: [77.2090, 28.6139]
        };
    }

    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = geometry;

    await newListing.save();
    res.redirect("/listings");
};

module.exports.showListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner");

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    res.render("listings/show.ejs", { listing, mapToken: process.env.MAP_TOKEN });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    let originalImageUrl = listing.image && listing.image.url ? listing.image.url : "";
    if (originalImageUrl.includes("/upload")) {
        originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    } else if (originalImageUrl.includes("w=800")) {
        originalImageUrl = originalImageUrl.replace("w=800", "w=250");
    }

    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findByIdAndUpdate(
        id,
        req.body.listing,
        {
            runValidators: true,
            returnDocument: "after"
        }
    );

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    const geocoder = getGeocoder();
    if (geocoder && req.body.listing && req.body.listing.location) {
        try {
            const response = await geocoder.forwardGeocode({
                query: `${req.body.listing.location}, ${req.body.listing.country || listing.country}`,
                limit: 1
            }).send();

            if (response.body.features && response.body.features.length) {
                listing.geometry = response.body.features[0].geometry;
                await listing.save();
            }
        } catch (err) {
            console.error("Mapbox geocoding error during update:", err.message);
        }
    }

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findByIdAndDelete(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    res.redirect("/listings");
};
