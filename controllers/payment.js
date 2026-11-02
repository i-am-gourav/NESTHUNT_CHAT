const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const paymentService = require("../services/paymentService.js");
const ExpressError = require("../utils/ExpressError.js");

/**
 * POST /payment/create-order
 * Initiates Razorpay checkout order for all active items in the user's cart.
 */
module.exports.createOrder = async (req, res) => {
    // 1. Fetch user's cart items
    const cartItems = await Booking.find({
        user: req.user._id,
        status: "in_cart"
    }).populate("listing");

    const validItems = cartItems.filter(item => item.listing !== null);

    if (validItems.length === 0) {
        throw new ExpressError(400, "Your booking cart is empty. Add a property first.");
    }

    // 2. Calculate total amount in INR
    const totalAmount = validItems.reduce((sum, item) => sum + item.totalAmount, 0);

    if (totalAmount <= 0) {
        throw new ExpressError(400, "Invalid total amount for checkout");
    }

    // 3. Create Razorpay order
    const receiptId = `rcpt_${req.user._id.toString().substring(0, 6)}_${Date.now()}`;
    const order = await paymentService.createOrder({
        amount: totalAmount,
        receipt: receiptId,
        notes: {
            userId: req.user._id.toString(),
            username: req.user.username,
            itemsCount: String(validItems.length)
        }
    });

    // 4. Associate the generated Razorpay order ID with the cart bookings
    const bookingIds = validItems.map(item => item._id);
    await Booking.updateMany(
        { _id: { $in: bookingIds } },
        {
            $set: {
                "payment.orderId": order.id,
                "payment.status": "pending"
            }
        }
    );

    res.status(201).json({
        success: true,
        orderId: order.id,
        amount: order.amount, // in paise
        amountInRupees: totalAmount,
        currency: order.currency || "INR",
        keyId: paymentService.getPublicKey(),
        isSimulated: order.isSimulated || false,
        user: {
            name: req.user.username || "Guest User",
            email: req.user.email || ""
        }
    });
};

/**
 * POST /payment/instant-checkout
 * Initiates Razorpay checkout directly for a single listing from the show page.
 */
module.exports.instantCheckout = async (req, res) => {
    const { listingId, checkIn, checkOut } = req.body;

    if (!listingId || !checkIn || !checkOut) {
        throw new ExpressError(400, "Listing ID, Check-in, and Check-out dates are required");
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        throw new ExpressError(400, "Invalid check-in or check-out date format");
    }

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

    const pricePerDay = Number(listing.price);
    const totalAmount = pricePerDay * numberOfDays;

    const receiptId = `rcpt_${req.user._id.toString().substring(0, 6)}_${Date.now()}`;
    const order = await paymentService.createOrder({
        amount: totalAmount,
        receipt: receiptId,
        notes: {
            userId: req.user._id.toString(),
            listingId: listing._id.toString(),
            nights: String(numberOfDays)
        }
    });

    const newBooking = new Booking({
        user: req.user._id,
        listing: listing._id,
        checkIn: start,
        checkOut: end,
        numberOfDays,
        pricePerDay,
        totalAmount,
        status: "pending",
        payment: {
            orderId: order.id,
            status: "pending"
        }
    });

    await newBooking.save();

    res.status(201).json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        amountInRupees: totalAmount,
        currency: order.currency || "INR",
        keyId: paymentService.getPublicKey(),
        isSimulated: order.isSimulated || false,
        listingTitle: listing.title,
        user: {
            name: req.user.username || "Guest User",
            email: req.user.email || ""
        }
    });
};

/**
 * POST /payment/verify
 * Cryptographically verifies the payment signature returned by the Razorpay frontend modal.
 */
module.exports.verifyPayment = async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new ExpressError(400, "Incomplete payment verification payload");
    }

    // 1. Idempotency Lock: Prevent simultaneous race conditions or double processing
    const lockAcquired = await paymentService.acquirePaymentLock(razorpay_order_id, req.user._id.toString());
    if (!lockAcquired) {
        return res.status(409).json({
            success: false,
            message: "Payment confirmation is currently being processed. Please wait."
        });
    }

    try {
        // 2. Cryptographic signature check: HMAC-SHA256(order_id + "|" + payment_id, secret)
        const isValid = paymentService.verifyPaymentSignature({
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature
        });

        if (!isValid) {
            await Booking.updateMany(
                { "payment.orderId": razorpay_order_id, user: req.user._id },
                { $set: { "payment.status": "failed" } }
            );
            throw new ExpressError(400, "Payment verification failed: Invalid cryptographic signature");
        }

        // 3. Mark bookings as confirmed and paid
        const updateResult = await Booking.updateMany(
            {
                "payment.orderId": razorpay_order_id,
                user: req.user._id
            },
            {
                $set: {
                    status: "confirmed",
                    "payment.status": "paid",
                    "payment.paymentId": razorpay_payment_id,
                    "payment.signature": razorpay_signature,
                    "payment.paidAt": new Date()
                }
            }
        );

        res.json({
            success: true,
            message: "Payment verified successfully! Your booking is confirmed.",
            redirectUrl: `/payment/success/${razorpay_order_id}`,
            confirmedCount: updateResult.modifiedCount
        });
    } finally {
        // Release the distributed payment lock
        await paymentService.releasePaymentLock(razorpay_order_id);
    }
};

/**
 * GET /payment/success/:orderId
 * Displays the verified booking confirmation receipt.
 */
module.exports.paymentSuccess = async (req, res) => {
    const { orderId } = req.params;

    const confirmedBookings = await Booking.find({
        "payment.orderId": orderId,
        user: req.user._id
    }).populate("listing");

    if (!confirmedBookings || confirmedBookings.length === 0) {
        throw new ExpressError(404, "No bookings found for this payment order.");
    }

    const totalPaid = confirmedBookings.reduce((sum, item) => sum + item.totalAmount, 0);
    const paymentDetails = confirmedBookings[0].payment;

    res.render("payment/success.ejs", {
        bookings: confirmedBookings,
        orderId,
        paymentDetails,
        totalPaid
    });
};

/**
 * GET /bookings
 * Lists all confirmed and active bookings for the logged-in user.
 */
module.exports.myBookings = async (req, res) => {
    const bookings = await Booking.find({
        user: req.user._id,
        status: { $in: ["confirmed", "pending"] }
    })
        .populate("listing")
        .sort({ createdAt: -1 });

    res.render("payment/bookings.ejs", {
        bookings
    });
};

/**
 * POST /payment/webhook
 * Server-to-server webhook callback from Razorpay to handle disconnected users or dropped network.
 */
module.exports.handleWebhook = async (req, res) => {
    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    // Verify webhook signature if webhook secret is configured
    if (process.env.RAZORPAY_WEBHOOK_SECRET) {
        const isValid = paymentService.verifyWebhookSignature({
            rawBody,
            signature
        });

        if (!isValid) {
            console.warn("[Webhook Error] Invalid Razorpay webhook signature");
            return res.status(400).json({ error: "Invalid webhook signature" });
        }
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log(`[Razorpay Webhook] Received event: ${event}`);

    if (event === "payment.captured" || event === "order.paid") {
        const orderId = payload.payment ? payload.payment.entity.order_id : payload.order.entity.id;
        const paymentId = payload.payment ? payload.payment.entity.id : null;

        if (orderId) {
            await Booking.updateMany(
                {
                    "payment.orderId": orderId,
                    status: { $ne: "confirmed" }
                },
                {
                    $set: {
                        status: "confirmed",
                        "payment.status": "paid",
                        "payment.paymentId": paymentId,
                        "payment.paidAt": new Date()
                    }
                }
            );
            console.log(`[Razorpay Webhook] Asynchronously confirmed bookings for Order ID: ${orderId}`);
        }
    }

    res.status(200).json({ status: "ok" });
};

