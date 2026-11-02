# ⚡ Redis Caching Architecture & System Design Guide — NestHunt

This document provides a comprehensive technical breakdown of the distributed Redis caching layer implemented in **NestHunt** (an Airbnb-inspired vacation-rental platform built with Node.js, Express, MongoDB Atlas, and Groq/Llama-3.3 AI).

It covers the architectural patterns, caching tiers, edge-case defenses, and design decisions suitable for production documentation and technical system design interviews.

---

## 📌 Table of Contents
1. [Architectural Overview](#1-architectural-overview)
2. [Why Cache-Aside (Lazy Loading)?](#2-why-cache-aside-lazy-loading)
3. [Caching Tiers & Granular Invalidation Rules](#3-caching-tiers--granular-invalidation-rules)
4. [Production Defenses & Design Decisions](#4-production-defenses--design-decisions)
   - [Delete-on-Write vs. Update-on-Write](#a-delete-on-write-vs-update-on-write-race-condition-prevention)
   - [Cache Avalanche Mitigation (TTL Jitter)](#b-cache-avalanche-mitigation-ttl-jitter)
   - [Non-Blocking Invalidation (SCAN vs. KEYS *)](#c-non-blocking-invalidation-scan-vs-keys-)
   - [Graceful Degradation & In-Memory Fallback](#d-graceful-degradation--in-memory-fallback)
   - [Mongoose Document Rehydration](#e-mongoose-document-rehydration-objectid-equals)
5. [Redis Eviction Policies (LRU vs. LFU)](#5-redis-eviction-policies-lru-vs-lfu)
6. [Component Reference & Code Architecture](#6-component-reference--code-architecture)
7. [Environment Configuration & Deployment](#7-environment-configuration--deployment)
8. [Interview Cheat Sheet & FAQs](#8-interview-cheat-sheet--faqs)

---

## 1. Architectural Overview

NestHunt employs a multi-tiered **Cache-Aside (Lazy Loading) with Write-Invalidation** pattern backed by **Redis** (v4 client).

```
               +-----------------------------+
               |   Client / Browser Request   |
               +-----------------------------+
                              |
                              v
                   +---------------------+
                   | Express Application |
                   +---------------------+
                              |
                     [ 1. Query Cache ]
                              |
                              v
                  /-----------------------\
                 |   Is Key in Redis?     |
                  \-----------------------/
                    /                   \
            YES (Cache Hit)       NO (Cache Miss)
                  /                       \
                 v                         v
     +-----------------------+   +-----------------------+
     | Return Deserialized / |   | Fetch from MongoDB    |
     | Rehydrated Object     |   | Atlas Cluster         |
     +-----------------------+   +-----------------------+
                 |                         |
                 |               [ 2. Populate Redis     ]
                 |               [    with Jittered TTL  ]
                 |                         |
                 |                         v
                 + <-----------------------+
                 |
                 v
     +-----------------------+
     | Render EJS / Return   |
     | JSON Response         |
     +-----------------------+
```

---

## 2. Why Cache-Aside (Lazy Loading)?

In system design, there are several caching strategies: **Cache-Aside**, **Write-Through**, **Write-Behind (Write-Back)**, and **Read-Through**. 

NestHunt selects **Cache-Aside** for three reasons:

1. **Read-to-Write Ratio (99:1 Skew):**
   Vacation rental platforms experience high read volume (browsing, category filtering, detail views) compared to infrequent writes (creating listings, writing reviews). Cache-Aside guarantees that only frequently requested, trending listings occupy expensive RAM.
2. **Resilience & Fault Tolerance:**
   The cache is a performance accelerator, not a single point of failure. If Redis experiences a network partition, memory pressure, or downtime, the application transparently falls back to MongoDB Atlas without crashing the user request.
3. **Zero Cache Pollution:**
   Unlike Write-Through (which writes every newly created item to cache immediately), Cache-Aside only stores listings that users actually visit. Cold or unvisited properties never consume memory.

---

## 3. Caching Tiers & Granular Invalidation Rules

| Tier | Cache Key Pattern | Base TTL | Invalidation Trigger | Problem Solved |
|---|---|---|---|---|
| **Listing Show Page** | `listing:<id>` | 1 Hour ($3600\text{s}$) | Listing updated/deleted, review created/deleted | Bypasses repeated multi-level MongoDB populations (`reviews -> author`, `owner`). |
| **Listings Feed & Search** | `listings_feed:<category>:<search>` | 5 Minutes ($300\text{s}$) | Any listing created, updated, or deleted | Eliminates expensive regex `$or` queries across title, location, and description on the home feed. |
| **AI RAG Vector Embeddings** | `ai:listing_embeddings` | 24 Hours ($86400\text{s}$) | Any listing created, updated, or deleted | Prevents pulling all 384-dimensional dense vector arrays over MongoDB wire on every single chat turn. |
| **User Authentication** | `user:<userId>` | 10 Minutes ($600\text{s}$) | User logs out or updates profile | Removes 1 repetitive `User.findById` query per incoming HTTP request in `attachCurrentUser`. |
| **Static Assets** | Browser / CDN Cache | 7 Days | New deployments / asset hash changes | Express static middleware sets `maxAge: "7d"` and `etag: true` to prevent browser re-requests. |

---

## 4. Production Defenses & Design Decisions

### A. Delete-on-Write vs. Update-on-Write (Race Condition Prevention)
* **The Pitfall:** If two concurrent requests update the same listing (e.g., rapid price adjustments or review additions), updating the cache directly creates a race condition where an older write can overwrite a newer write in Redis, leaving the cache permanently stale.
* **The Solution:** On any write operation (Create, Update, Delete), NestHunt **deletes** the cache key (`DEL listing:<id>`). The subsequent read cleanly queries the committed MongoDB document and repopulates Redis.

### B. Cache Avalanche Mitigation (TTL Jitter)
* **The Problem:** If multiple keys are cached at the same time with identical TTLs (e.g., 50 listings cached at 12:00 PM with 1-hour TTLs), they all expire simultaneously at 1:00 PM. This causes a sudden, massive spike of concurrent cache misses hitting the database at once.
* **The Solution:** `cacheService.getJitteredTTL` automatically injects random variance ($\pm 10\%$) into every TTL:
  $$\text{TTL}_{\text{effective}} = \text{TTL}_{\text{base}} + \text{random}(-\Delta, +\Delta), \quad \text{where } \Delta = \text{base} \times 0.10$$
  This spreads key expirations evenly across a time window.

### C. Non-Blocking Invalidation (`SCAN` vs. `KEYS *`)
* **The Problem:** Redis is single-threaded. Running `KEYS listings_feed:*` inspects every key in the database at once. In a production cluster with millions of keys, `KEYS` blocks the entire Redis server for hundreds of milliseconds or seconds, stalling all other user requests.
* **The Solution:** `cacheService.delPattern` uses cursor-based iterative **`SCAN`** with `COUNT 100`:
  ```javascript
  let cursor = "0";
  do {
      const reply = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 100 });
      cursor = reply.cursor.toString();
      if (reply.keys.length > 0) {
          await redisClient.del(reply.keys);
      }
  } while (cursor !== "0");
  ```
  This processes invalidation in small, non-blocking batches.

### D. Graceful Degradation & In-Memory Fallback
* **The Architecture:** In local development without a local Redis daemon running, or during transient network interruptions between Render and Redis:
  1. `redisClient` catches connection errors via `.on("error")` without throwing uncaught process exceptions.
  2. `cacheService` activates an internal **In-Memory Fallback Store** (`Map` with expiration timestamps).
  3. All application features continue operating seamlessly.

### E. Mongoose Document Rehydration (`ObjectId.equals`)
* **The Problem:** EJS templates contain ownership checks like:
  ```ejs
  <% if (currentUser && listing.owner && listing.owner._id.equals(currentUser._id)) { %>
  ```
  When Mongoose documents are cached in Redis via `JSON.stringify()`, `_id` fields are converted into primitive strings. When parsed with `JSON.parse()`, calling `listing.owner._id.equals(...)` throws:
  `TypeError: listing.owner._id.equals is not a function`.
* **The Solution:** `cacheService.rehydrateListing` and `rehydrateUser` recursively convert string IDs into `new mongoose.Types.ObjectId(id)`, ensuring template compatibility without modifying any view file.

---

## 5. Redis Eviction Policies (LRU vs. LFU)

When Redis memory reaches its configured ceiling (`maxmemory`), it enforces an eviction policy:

| Policy | Mechanism | Best Workload | Recommendation for NestHunt |
|---|---|---|---|
| **`allkeys-lru`** | Evicts least recently accessed keys | Temporal recency, seasonal travel spikes | ⭐ **Recommended (Primary Choice)** |
| **`allkeys-lfu`** | Evicts least frequently accessed keys | Stable power-law distributions (same top 5% items always) | Suitable if vacation destinations rarely shift |
| **`volatile-lru`** | Evicts least recently accessed keys among those with a TTL | Mixed cache + persistent store | Alternative if some keys have no TTL |
| **`noeviction`** | Rejects writes with OOM error when full | Critical persistence where data cannot be dropped | Never use for transient caches |

> **Interview Insight:** Redis does not maintain an exact doubly-linked list for LRU because of memory pointer overhead. Instead, it uses **Approximated LRU**: sampling $N$ random keys (default: 5) and evicting the best candidate among that sample.

---

## 6. Component Reference & Code Architecture

### 1. `services/cacheService.js` (Core Engine)
Exports:
* `initRedis()`: Initializes connection singleton and event listeners.
* `get(key)`: Retrieves and parses JSON object; falls back to in-memory store if Redis is unavailable.
* `set(key, value, ttlSeconds)`: Serializes object to JSON with jittered expiration.
* `del(key)`: Invalidates single key.
* `delPattern(pattern)`: Non-blocking scan and delete matching keys.
* `rehydrateListing(doc)`: Restores `mongoose.Types.ObjectId` on listing, owner, and review authors.
* `rehydrateUser(doc)`: Restores `mongoose.Types.ObjectId` on user.
* `getCacheStatus()`: Returns active provider (`"redis"` vs `"in-memory-fallback"`).

### 2. Integration Points
* **`app.js`**: Initializes Redis client at startup; applies 7-day HTTP caching to static files.
* **`middleware.js`**: Caches authenticated user lookups in `attachCurrentUser`.
* **`controllers/listings.js`**:
  - `index`: Caches listing feed by category/search (`listings_feed:...`).
  - `showListing`: Caches populated listing details (`listing:<id>`).
  - `createListing`, `updateListing`, `destroyListing`: Purges listing details, feeds, and AI embeddings.
* **`controllers/reviews.js`**: Purges `listing:<id>` on review creation and deletion.
* **`controllers/users.js`**: Purges `user:<userId>` on logout.
* **`services/aiService.js`**: Caches the 384-dimensional listing vector embeddings (`ai:listing_embeddings`).

---

## 7. Environment Configuration & Deployment

### Local Development
In your `.env` file:
```env
# Optional: if omitted or server is down, in-memory fallback engages automatically
REDIS_URL=redis://127.0.0.1:6379
```

### Production (Render / Cloud)
1. Provision a free Redis instance on **Upstash Redis** or **Redis Cloud**.
2. Copy the connection string: `rediss://default:<password>@<host>:<port>`
3. In Render Dashboard -> **Environment Variables**, add:
   ```env
   REDIS_URL=rediss://default:your_password@your_host.upstash.io:6379
   ```

---

## 8. Interview Cheat Sheet & FAQs

#### Q1: "Why not use Write-Through caching?"
> *"Write-Through adds latency to every write operation and populates the cache with items that may never be read. For a 99% read-heavy app like vacation rentals, Cache-Aside ensures only actively browsed listings enter memory."*

#### Q2: "What happens if Redis crashes?"
> *"The system utilizes Cache-Aside with Graceful Degradation. A Redis failure does not crash user requests; the app safely falls back to MongoDB Atlas while logging a warning."*

#### Q3: "How do you handle Cache Stampede (Thundering Herd)?"
> *"Cache Stampede occurs when an ultra-popular key expires and hundreds of requests hit MongoDB simultaneously. We address this using TTL Jitter to prevent mass synchronized expiration, and can employ Redis Mutex Locking (`SET key NX EX`) to allow only one worker to recompute the cache."*

#### Q4: "How do you handle Cache Penetration?"
> *"If malicious users request non-existent listing IDs (`/listings/invalid-id-999`), every request hits MongoDB. We defend against this by caching empty / null responses with a short 60-second TTL or using an upstream Bloom Filter."*

