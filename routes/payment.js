const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/WrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const paymentController = require("../controllers/payment.js");

// Public Webhook Endpoint (Called server-to-server by Razorpay; no auth session)
router.post("/webhook", wrapAsync(paymentController.handleWebhook));

// Authenticated Endpoints
router.post("/create-order", isLoggedIn, wrapAsync(paymentController.createOrder));
router.post("/instant-checkout", isLoggedIn, wrapAsync(paymentController.instantCheckout));
router.post("/verify", isLoggedIn, wrapAsync(paymentController.verifyPayment));
router.get("/success/:orderId", isLoggedIn, wrapAsync(paymentController.paymentSuccess));
router.get("/my-bookings", isLoggedIn, wrapAsync(paymentController.myBookings));

module.exports = router;

