const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");

// Helper function to validate and calculate duration & total
const calculateBookingDetails = (checkInStr, checkOutStr, listingPrice) => {
    if (!checkInStr || !checkOutStr) {
        throw new ExpressError(400, "Check-in and Check-out dates are required");
    }

    const checkInDate = new Date(checkInStr);
    const checkOutDate = new Date(checkOutStr);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        throw new ExpressError(400, "Invalid check-in or check-out date format");
    }

    // Normalize to date components at midnight UTC
    const start = new Date(Date.UTC(checkInDate.getUTCFullYear(), checkInDate.getUTCMonth(), checkInDate.getUTCDate()));
    const end = new Date(Date.UTC(checkOutDate.getUTCFullYear(), checkOutDate.getUTCMonth(), checkOutDate.getUTCDate()));

    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    if (start < todayUTC) {
        throw new ExpressError(400, "Check-in date cannot be in the past");
    }

    const diffMs = end.getTime() - start.getTime();
    const numberOfDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (numberOfDays < 1) {
        throw new ExpressError(400, "Check-out date must be at least 1 night after check-in date");
    }

    const pricePerDay = Number(listingPrice);
    const totalAmount = pricePerDay * numberOfDays;

    return {
        checkIn: start,
        checkOut: end,
        numberOfDays,
        pricePerDay,
        totalAmount
    };
};

// GET /cart - Retrieve current user's cart items
module.exports.getCart = async (req, res) => {
    const cartItems = await Booking.find({
        user: req.user._id,
        status: "in_cart"
    })
        .populate("listing")
        .sort({ createdAt: -1 });

    // Filter out any cart items where the listing might have been removed
    const validCartItems = cartItems.filter(item => item.listing !== null);

    const cartTotal = validCartItems.reduce((sum, item) => sum + item.totalAmount, 0);

    res.render("cart/index.ejs", {
        cartItems: validCartItems,
        cartTotal,
        successMessage: req.query.success || null,
        errorMessage: req.query.error || null
    });
};

// POST /cart - Add a new booking to user's cart
module.exports.addToCart = async (req, res) => {
    const { listingId, checkIn, checkOut } = req.body.booking || req.body;

    if (!listingId) {
        throw new ExpressError(400, "Listing ID is required");
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    const calculation = calculateBookingDetails(checkIn, checkOut, listing.price);

    const newBooking = new Booking({
        user: req.user._id,
        listing: listing._id,
        checkIn: calculation.checkIn,
        checkOut: calculation.checkOut,
        numberOfDays: calculation.numberOfDays,
        pricePerDay: calculation.pricePerDay,
        totalAmount: calculation.totalAmount,
        status: "in_cart"
    });

    await newBooking.save();

    if (req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"))) {
        return res.status(201).json({
            success: true,
            message: "Booking added to cart successfully!",
            booking: newBooking
        });
    }

    res.redirect("/cart?success=" + encodeURIComponent("Booking added to cart!"));
};

// PUT / PATCH /cart/:id - Modify booking dates
module.exports.updateCartItem = async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut } = req.body.booking || req.body;

    const booking = await Booking.findById(id).populate("listing");

    if (!booking) {
        throw new ExpressError(404, "Cart item not found");
    }

    if (!booking.user.equals(req.user._id)) {
        throw new ExpressError(403, "You are not authorized to modify this cart item");
    }

    if (!booking.listing) {
        throw new ExpressError(404, "Associated listing not found");
    }

    const calculation = calculateBookingDetails(checkIn, checkOut, booking.listing.price);

    booking.checkIn = calculation.checkIn;
    booking.checkOut = calculation.checkOut;
    booking.numberOfDays = calculation.numberOfDays;
    booking.pricePerDay = calculation.pricePerDay;
    booking.totalAmount = calculation.totalAmount;

    await booking.save();

    if (req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"))) {
        return res.json({
            success: true,
            message: "Cart item updated successfully!",
            booking
        });
    }

    res.redirect("/cart?success=" + encodeURIComponent("Booking dates updated successfully!"));
};

// DELETE /cart/:id - Remove item from cart
module.exports.removeFromCart = async (req, res) => {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
        throw new ExpressError(404, "Cart item not found");
    }

    if (!booking.user.equals(req.user._id)) {
        throw new ExpressError(403, "You are not authorized to delete this cart item");
    }

    await Booking.findByIdAndDelete(id);

    if (req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"))) {
        return res.json({
            success: true,
            message: "Item removed from cart"
        });
    }

    res.redirect("/cart?success=" + encodeURIComponent("Item removed from cart"));
};
