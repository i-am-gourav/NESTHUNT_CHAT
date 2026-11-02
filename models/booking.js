const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"]
    },
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
        required: [true, "Listing is required"]
    },
    checkIn: {
        type: Date,
        required: [true, "Check-in date is required"]
    },
    checkOut: {
        type: Date,
        required: [true, "Check-out date is required"]
    },
    numberOfDays: {
        type: Number,
        required: [true, "Number of days is required"],
        min: [1, "Number of days must be at least 1"]
    },
    pricePerDay: {
        type: Number,
        required: [true, "Price per day is required"],
        min: [0, "Price per day cannot be negative"]
    },
    totalAmount: {
        type: Number,
        required: [true, "Total amount is required"],
        min: [0, "Total amount cannot be negative"]
    },
    status: {
        type: String,
        enum: ["in_cart", "pending", "confirmed", "cancelled"],
        default: "in_cart"
    },
    payment: {
        orderId: {
            type: String,
            default: null,
            index: true
        },
        paymentId: {
            type: String,
            default: null,
            index: true
        },
        signature: {
            type: String,
            default: null
        },
        status: {
            type: String,
            enum: ["unpaid", "pending", "paid", "failed"],
            default: "unpaid"
        },
        method: {
            type: String,
            default: "razorpay"
        },
        paidAt: {
            type: Date,
            default: null
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ listing: 1, status: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
