const { createClient } = require("redis");
const mongoose = require("mongoose");

let redisClient = null;
let isRedisReady = false;
let hasLoggedOfflineWarning = false;

// In-memory fallback cache when Redis server is unreachable (e.g., local dev without Redis daemon)
const inMemoryFallback = new Map();

/**
 * Calculates a jittered TTL to prevent Cache Avalanche (thundering herd on expiration).
 * Adds or subtracts up to 10% variance to the base TTL.
 *
 * @param {number} baseSeconds - Baseline TTL in seconds
 * @param {number} [jitterRatio=0.10] - Jitter percentage (0.10 = +/- 10%)
 * @returns {number}
 */
function getJitteredTTL(baseSeconds, jitterRatio = 0.10) {
    if (!baseSeconds || baseSeconds <= 0) return 300;
    const maxDelta = Math.floor(baseSeconds * jitterRatio);
    const delta = Math.floor(Math.random() * (maxDelta * 2 + 1)) - maxDelta;
    return Math.max(1, baseSeconds + delta);
}

/**
 * Initializes and connects the Redis client singleton.
 * Uses process.env.REDIS_URL or defaults to redis://127.0.0.1:6379.
 */
async function initRedis() {
    if (redisClient) return redisClient;

    const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

    try {
        redisClient = createClient({
            url: redisUrl,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 5 && !process.env.REDIS_URL) {
                        // In local dev without REDIS_URL, stop aggressive reconnect spamming
                        return 10000;
                    }
                    return Math.min(retries * 200, 3000);
                }
            }
        });

        redisClient.on("connect", () => {
            console.log(`[Cache] Redis connecting to ${redisUrl.replace(/:[^:]*@/, ":****@")}...`);
        });

        redisClient.on("ready", () => {
            isRedisReady = true;
            hasLoggedOfflineWarning = false;
            console.log("[Cache] Redis is connected and ready (Active Cache Provider: Redis).");
        });

        redisClient.on("error", (err) => {
            isRedisReady = false;
            if (!hasLoggedOfflineWarning) {
                console.warn(
                    `[Cache Notice] Redis unavailable (${err.code || err.message}). Operating in graceful fallback mode (Cache-Aside: in-memory / direct DB).`
                );
                hasLoggedOfflineWarning = true;
            }
        });

        redisClient.on("end", () => {
            isRedisReady = false;
        });

        await redisClient.connect().catch((err) => {
            // Error listener handles logging; catch prevents unhandled rejection
        });
    } catch (err) {
        console.warn("[Cache] Redis client creation error:", err.message);
    }

    return redisClient;
}

/**
 * Retrieves an item from the cache.
 * Falls back to in-memory store if Redis is unavailable.
 *
 * @param {string} key
 * @returns {Promise<any|null>} Parsed JSON object or null
 */
async function get(key) {
    if (!key) return null;

    if (isRedisReady && redisClient) {
        try {
            const data = await redisClient.get(key);
            if (!data) return null;
            return JSON.parse(data);
        } catch (err) {
            console.warn(`[Cache Error] Redis get error on key "${key}":`, err.message);
        }
    }

    // In-memory fallback
    const item = inMemoryFallback.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
        inMemoryFallback.delete(key);
        return null;
    }
    return JSON.parse(item.value);
}

/**
 * Stores an item in the cache with a specified TTL (in seconds).
 * Applies TTL jitter automatically to avoid cache avalanche.
 *
 * @param {string} key
 * @param {any} value
 * @param {number} [ttlSeconds=300]
 * @returns {Promise<boolean>}
 */
async function set(key, value, ttlSeconds = 300) {
    if (!key || value === undefined) return false;

    const jitteredTTL = getJitteredTTL(ttlSeconds);
    const serialized = JSON.stringify(value);

    if (isRedisReady && redisClient) {
        try {
            await redisClient.set(key, serialized, { EX: jitteredTTL });
            return true;
        } catch (err) {
            console.warn(`[Cache Error] Redis set error on key "${key}":`, err.message);
        }
    }

    // In-memory fallback
    inMemoryFallback.set(key, {
        value: serialized,
        expiry: Date.now() + (jitteredTTL * 1000)
    });

    // Cleanup oversized memory fallback if it exceeds 1000 entries
    if (inMemoryFallback.size > 1000) {
        const oldestKey = inMemoryFallback.keys().next().value;
        inMemoryFallback.delete(oldestKey);
    }

    return true;
}

/**
 * Invalidates (deletes) a specific cache key.
 *
 * @param {string} key
 * @returns {Promise<boolean>}
 */
async function del(key) {
    if (!key) return false;

    let success = true;

    if (isRedisReady && redisClient) {
        try {
            await redisClient.del(key);
        } catch (err) {
            console.warn(`[Cache Error] Redis del error on key "${key}":`, err.message);
            success = false;
        }
    }

    inMemoryFallback.delete(key);
    return success;
}

/**
 * Invalidates all keys matching a glob-style pattern (e.g. "listings_feed:*").
 * In Redis, uses non-blocking iterative SCAN instead of KEYS * to preserve performance.
 *
 * @param {string} pattern
 * @returns {Promise<boolean>}
 */
async function delPattern(pattern) {
    if (!pattern) return false;

    // Clear matching entries from in-memory fallback
    const regexPattern = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    for (const key of inMemoryFallback.keys()) {
        if (regexPattern.test(key)) {
            inMemoryFallback.delete(key);
        }
    }

    if (!isRedisReady || !redisClient) return true;

    try {
        let cursor = "0";
        do {
            const reply = await redisClient.scan(cursor, {
                MATCH: pattern,
                COUNT: 100
            });
            cursor = reply.cursor.toString();
            const keys = reply.keys;
            if (keys && keys.length > 0) {
                await redisClient.del(keys);
            }
        } while (cursor !== "0");
        return true;
    } catch (err) {
        console.warn(`[Cache Error] Redis delPattern error on pattern "${pattern}":`, err.message);
        return false;
    }
}

/**
 * Re-hydrates ObjectIds on cached listing documents so template checks
 * like `listing.owner._id.equals(currentUser._id)` and `review.author._id.equals(...)`
 * function seamlessly without type errors.
 *
 * @param {Object} data
 * @returns {Object}
 */
function rehydrateListing(data) {
    if (!data) return null;
    const listing = { ...data };

    if (listing._id && typeof listing._id === "string") {
        listing._id = new mongoose.Types.ObjectId(listing._id);
    }

    if (listing.owner) {
        if (typeof listing.owner === "string") {
            listing.owner = new mongoose.Types.ObjectId(listing.owner);
        } else if (listing.owner._id && typeof listing.owner._id === "string") {
            listing.owner = {
                ...listing.owner,
                _id: new mongoose.Types.ObjectId(listing.owner._id)
            };
        }
    }

    if (Array.isArray(listing.reviews)) {
        listing.reviews = listing.reviews.map((rev) => {
            const review = { ...rev };
            if (review._id && typeof review._id === "string") {
                review._id = new mongoose.Types.ObjectId(review._id);
            }
            if (review.author) {
                if (typeof review.author === "string") {
                    review.author = new mongoose.Types.ObjectId(review.author);
                } else if (review.author._id && typeof review.author._id === "string") {
                    review.author = {
                        ...review.author,
                        _id: new mongoose.Types.ObjectId(review.author._id)
                    };
                }
            }
            return review;
        });
    }

    return listing;
}

/**
 * Re-hydrates a cached user's _id so `req.user._id.equals(...)` continues to work.
 *
 * @param {Object} data
 * @returns {Object}
 */
function rehydrateUser(data) {
    if (!data) return null;
    const user = { ...data };
    if (user._id && typeof user._id === "string") {
        user._id = new mongoose.Types.ObjectId(user._id);
    }
    return user;
}

/**
 * Returns cache health/connection metrics for diagnosis.
 */
function getCacheStatus() {
    return {
        provider: isRedisReady ? "redis" : "in-memory-fallback",
        isRedisReady,
        inMemoryKeysCount: inMemoryFallback.size
    };
}

module.exports = {
    initRedis,
    get,
    set,
    del,
    delPattern,
    getJitteredTTL,
    rehydrateListing,
    rehydrateUser,
    getCacheStatus
};

