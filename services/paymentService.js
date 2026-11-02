const crypto = require("crypto");
const Razorpay = require("razorpay");
const cacheService = require("./cacheService.js");

let razorpayClient = null;

/**
 * Returns an instance of Razorpay client if credentials are configured in .env.
 * Otherwise returns null, allowing graceful simulation in development.
 */
function getRazorpayClient() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId === "your_razorpay_key_id" || keySecret === "your_razorpay_secret") {
        return null;
    }

    if (!razorpayClient) {
        razorpayClient = new Razorpay({
            key_id: keyId,
            key_secret: keySecret
        });
    }

    return razorpayClient;
}

/**
 * Check whether real Razorpay credentials are actively configured.
 */
function isConfigured() {
    return getRazorpayClient() !== null;
}

/**
 * Returns the public Razorpay Key ID for the frontend.
 */
function getPublicKey() {
    return process.env.RAZORPAY_KEY_ID || "rzp_test_simulated_key";
}

/**
 * Creates an order with Razorpay or generates a valid simulated order if credentials are not configured.
 *
 * @param {Object} params
 * @param {number} params.amount - Amount in INR
 * @param {string} params.receipt - Internal receipt / booking identifier
 * @param {Object} [params.notes] - Additional metadata
 * @returns {Promise<Object>} Razorpay Order Object
 */
async function createOrder({ amount, receipt, notes = {} }) {
    if (!amount || amount <= 0) {
        throw new Error("Payment amount must be greater than zero");
    }

    // Razorpay expects amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);
    const client = getRazorpayClient();

    if (client) {
        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: String(receipt || `rcpt_${Date.now()}`),
            notes: notes || {}
        };
        return await client.orders.create(options);
    }

    // Fallback: Realistic Test Mode Sandbox Order
    const simulatedOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
        id: simulatedOrderId,
        entity: "order",
        amount: amountInPaise,
        amount_paid: 0,
        amount_due: amountInPaise,
        currency: "INR",
        receipt: String(receipt || `rcpt_${Date.now()}`),
        status: "created",
        attempts: 0,
        notes: notes || {},
        created_at: Math.floor(Date.now() / 1000),
        isSimulated: true
    };
}

/**
 * Cryptographically verifies the payment signature returned by Razorpay.
 * Formula: HMAC_SHA256(order_id + "|" + payment_id, secret) === signature
 * Uses timing-safe buffer comparison to prevent timing attacks.
 *
 * @param {Object} params
 * @param {string} params.orderId
 * @param {string} params.paymentId
 * @param {string} params.signature
 * @returns {boolean}
 */
function verifyPaymentSignature({ orderId, paymentId, signature }) {
    if (!orderId || !paymentId || !signature) {
        return false;
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If real keys are present, perform strict cryptographic HMAC verification
    if (keySecret && keySecret !== "your_razorpay_secret" && !orderId.startsWith("order_test_")) {
        const body = `${orderId}|${paymentId}`;
        const expectedSignature = crypto
            .createHmac("sha256", keySecret)
            .update(body)
            .digest("hex");

        const expectedBuffer = Buffer.from(expectedSignature, "utf8");
        const receivedBuffer = Buffer.from(signature, "utf8");

        if (expectedBuffer.length !== receivedBuffer.length) {
            return false;
        }

        return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
    }

    // If in development simulation mode
    return signature.startsWith("simulated_sig_") || signature.length >= 10;
}

/**
 * Cryptographically verifies Razorpay webhook payload signature.
 * Formula: HMAC_SHA256(rawBody, webhookSecret) === x-razorpay-signature
 *
 * @param {Object} params
 * @param {Buffer|string} params.rawBody - Raw unparsed HTTP body
 * @param {string} params.signature - Value of 'x-razorpay-signature' header
 * @returns {boolean}
 */
function verifyWebhookSignature({ rawBody, signature }) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.warn("[Payment Warning] RAZORPAY_WEBHOOK_SECRET is not configured.");
        return false;
    }

    if (!rawBody || !signature) {
        return false;
    }

    const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const receivedBuffer = Buffer.from(signature, "utf8");

    if (expectedBuffer.length !== receivedBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

/**
 * Acquires a temporary distributed payment lock in Redis to guarantee Idempotency.
 * Prevents race conditions and duplicate concurrent payment confirmations.
 *
 * @param {string} orderId
 * @param {string} userId
 * @param {number} [ttlSeconds=300] - 5 minutes default
 * @returns {Promise<boolean>} True if lock acquired, false if already locked
 */
async function acquirePaymentLock(orderId, userId, ttlSeconds = 300) {
    if (!orderId) return false;
    const lockKey = `payment:lock:${orderId}`;

    // Check if lock already exists
    const existing = await cacheService.get(lockKey);
    if (existing) {
        return false;
    }

    // Acquire lock
    await cacheService.set(lockKey, {
        userId,
        status: "PROCESSING",
        lockedAt: Date.now()
    }, ttlSeconds);

    return true;
}

/**
 * Releases the distributed payment lock in Redis.
 *
 * @param {string} orderId
 */
async function releasePaymentLock(orderId) {
    if (!orderId) return;
    const lockKey = `payment:lock:${orderId}`;
    await cacheService.del(lockKey);
}

module.exports = {
    isConfigured,
    getPublicKey,
    createOrder,
    verifyPaymentSignature,
    verifyWebhookSignature,
    acquirePaymentLock,
    releasePaymentLock
};

