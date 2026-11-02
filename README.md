# 🏠 NestHunt

A modern full-stack vacation-rental and property discovery platform inspired by Airbnb.

NestHunt enables users to explore stays across the globe, filter properties by category, search by destination or title, view dynamic tax-inclusive pricing, upload property images with Cloudinary, explore locations on interactive Mapbox maps, and leave ratings and reviews.

---

## ✨ Key Features & Recent Updates

### 🔍 1. Destination Search & Filtering
- **Navbar Search Bar**: Integrated search input for real-time querying by destination, city, country, or listing title.
- **Category Filter Bar**: Airbnb-style horizontal filter bar with categories:
  - *Trending, Rooms, Iconic Cities, Mountains, Castles, Amazing Pools, Camping, Farms, Arctic, Domes, Boats, Beachfront*.
  - Active category indicators and one-click filter resets.
  - Multi-condition backend query processing (`category` and `search` query parameters).

### 🏷️ 2. Interactive Tax Switch Toggle
- **"Display total after taxes"** switch:
  - Real-time client-side calculation showing prices with **+18% GST**.
  - Toggles between base price per night and tax-inclusive total.
  - State persistence across pages using browser `localStorage`.

### 🔐 3. JWT Authentication & Authorization
- **Token-based Authentication**: Stateless JSON Web Tokens (JWT) stored securely in `httpOnly` cookies.
- **Password Security**: Salted password hashing with `bcrypt`.
- **Protected Middleware**:
  - `isLoggedIn`: Guards creation, review submission, and modification endpoints.
  - `isOwner` & `isReviewAuthor`: Restricts edit and delete privileges to resource creators.
  - `validateListing` & `validateReview`: Schema validation using Joi.

### 📸 4. Cloudinary Image Management
- Direct multi-part image uploads handled via `multer` and `multer-storage-cloudinary`.
- Cloudinary automatic transformations (such as thumbnail previews in the edit listing flow).

### 🗺️ 5. Mapbox Geocoding & Interactive Maps
- Automatic forward geocoding with `@mapbox/mapbox-sdk` to derive coordinates upon listing creation and update.
- Client-side Mapbox GL JS rendering with custom location pins and detail popups on listing show pages.

### 🛒 6. Cart & Booking Engine
- **Date Range Calculation**: Server-side duration validation, UTC midnight normalization, and past-date prevention.
- **Cart Management**: Add stays to cart, view total cost, update stay dates, or remove items.
- **Booking Lifecycle**: Tracks states (`in_cart` ➡️ `pending` ➡️ `confirmed` ➡️ `cancelled`).

### 🤖 7. AI Concierge & RAG Chatbot
- **Local In-App Vector Embeddings**: Uses `@xenova/transformers` (`all-MiniLM-L6-v2`) to generate 384-dimensional dense vectors directly in Node.js (100% free, zero external API keys needed).
- **Cosine Similarity Vector Search**: Fast in-memory similarity ranking to retrieve the top matching properties from MongoDB.
- **Groq-Powered Intelligence**: Blazing fast natural language synthesis using Meta's **Llama 3.3 70B** hosted on Groq LPUs.
- **Conversational Memory**: Retains multi-turn dialogue history for natural follow-up queries (e.g. *"Which of these has a pool?"*).
- **Interactive UI Cards**: Sleek floating concierge widget across all pages with quick-prompt chips, typing indicators, and clickable listing cards.
- **Auto-Embedding Lifecycle**: Automatically computes and stores embeddings whenever a host creates or edits a listing.

### ⚡ 8. High-Performance Redis Caching (Cache-Aside Pattern)
- **Cache-Aside (Lazy Loading)**: Read requests check Redis first; cache misses query MongoDB and lazily populate Redis with TTLs.
- **Delete-on-Write Invalidation**: Writes (creating/updating/deleting listings or reviews) purge stale keys instead of updating them, completely eliminating concurrent race conditions.
- **RAG Vector Search Acceleration**: Caches the entire catalog of dense embedding vectors in Redis (`ai:listing_embeddings`), avoiding heavy multi-field DB queries during AI chats.
- **Session Lookup Offloading**: Caches authenticated user profiles in `attachCurrentUser` to cut one repetitive database round-trip per request.
- **Non-Blocking Invalidation**: Pattern-based invalidations use Redis iterative `SCAN` instead of single-threaded blocking `KEYS *`.
- **Cache Avalanche Protection**: Automatically applies a $\pm 10\%$ TTL jitter to prevent simultaneous bulk key expirations.
- **Graceful Fallback**: If Redis is offline or not configured, the service falls back automatically without throwing unhandled exceptions or crashing the app.

---

## 🛠️ Technology Stack

| Domain | Technology |
|---|---|
| **Frontend** | EJS (Embedded JavaScript), HTML5, CSS3, Bootstrap 5, FontAwesome 6 |
| **Backend** | Node.js, Express.js (MVC Architecture, Express Router) |
| **AI & RAG Engine** | Groq SDK (`groq-sdk`, Llama 3.3), Function Calling & MongoDB Retrieval |
| **Caching & In-Memory** | Redis (`redis` v4), Cache-Aside Strategy, TTL Jitter |
| **Database** | MongoDB, Mongoose ODM |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcrypt`, `cookie-parser` |
| **Media Storage** | Cloudinary v2, `multer`, `multer-storage-cloudinary` |
| **Mapping & Geocoding** | Mapbox GL JS, `@mapbox/mapbox-sdk` |
| **Validation** | Joi |

---

## 🏗️ Project Structure
 
 ```text
NESTHUNT/
├── controllers/          # Business logic handlers
│   ├── listings.js       # Listing CRUD, search & filter logic
│   ├── reviews.js        # Review creation & deletion
│   ├── cart.js           # Cart & booking calculations
│   ├── chat.js           # AI concierge endpoint
│   └── users.js          # JWT login, signup, logout
├── models/               # Mongoose data models
│   ├── booking.js        # Booking schema (user, listing, dates, total, status)
│   ├── listing.js        # Listing schema (geometry, category, owner, reviews)
│   ├── review.js         # Review schema (rating, comment, author)
│   └── user.js           # User schema (email, username, bcrypt hash)
├── routes/               # Express modular route definitions
│   ├── listings.js       # /listings endpoints
│   ├── reviews.js        # /listings/:id/reviews endpoints
│   ├── cart.js           # /cart endpoints
│   ├── chat.js           # /chat endpoints
│   └── users.js          # /signup, /login, /logout endpoints
├── services/             # Core business & background services
│   ├── aiService.js      # Groq AI concierge & RAG orchestration
│   ├── cacheService.js   # Redis client, Cache-Aside helpers, TTL jitter & rehydration
│   └── embeddingService.js # Local Transformers embedding pipeline & hybrid search
├── views/                # EJS server-rendered templates
│   ├── includes/         # Navbar (search), Footer
│   ├── layouts/          # Boilerplate layout
│   ├── listings/         # Home index, show, new, edit
│   ├── cart/             # Cart review and date editing
│   └── users/            # Login, signup
├── public/               # Static assets
│   ├── css/              # style.css (custom design system, filters, tax switch)
│   └── Js/               # map.js (Mapbox), script.js (tax toggle & validation)
├── init/                 # Database initialization & sample seed data
├── cloudConfig.js        # Cloudinary storage configuration
├── middleware.js         # JWT auth, owner verification, Joi validation
├── schema.js             # Joi validation schemas
├── app.js                # Express app entrypoint
└── .env.example          # Environment variables template
```

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/i-am-gourav/NESTHUNT_CHAT.git
cd NESTHUNT_CHAT
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory based on `.env.example`:
```env
PORT=8080
MONGO_URL=mongodb://127.0.0.1:27017/NESTHUNT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
MAP_TOKEN=your_mapbox_public_token
GROQ_API_KEY=your_groq_api_key_here
REDIS_URL=redis://127.0.0.1:6379
```

### 4. Seed Database (Optional)
```bash
# Seed listings
node init/index.js
```

### 5. Start Development Server
```bash
# Ensure Redis server is running (optional, graceful fallback enabled if offline)
redis-server

# Start the Node.js application
npm start
# or using nodemon
npx nodemon app.js
```
The application will be accessible at `http://localhost:8080`.

---

## ⚡ Caching Architecture & System Design (Interview Deep-Dive)

NestHunt employs a multi-tiered **Cache-Aside (Lazy Loading) with Explicit Invalidation (Delete-on-Write)** strategy powered by Redis.

### 1. Key Caching Tiers & Invalidation Rules

| Cache Tier | Key Pattern | TTL | Invalidation Trigger | Purpose |
|---|---|---|---|---|
| **Listing Show Page** | `listing:<id>` | ~1 hour ($\pm 10\%$) | Listing edited/deleted, review added/deleted | Eliminates repeated deep population queries (`reviews -> author`, `owner`). |
| **Listings Feed & Search** | `listings_feed:<category>:<search>` | ~5 mins ($\pm 10\%$) | Any listing created, updated, or deleted | Protects MongoDB against heavy `$or` regex filter scans on homepage. |
| **AI RAG Vector Embeddings** | `ai:listing_embeddings` | ~24 hours ($\pm 10\%$) | Any listing created, updated, or deleted | Prevents querying high-dimensional 384-float vectors across the wire on every chat. |
| **User Session / Auth** | `user:<userId>` | ~10 mins ($\pm 10\%$) | User logout, password change | Eliminates a redundant `User.findById` query on every incoming HTTP request. |
| **HTTP Static Assets** | Browser / CDN Cache | 7 days (prod) | Deployments / file hash change | `maxAge: "7d"` and `etag` on `/public` saves server bandwidth. |

### 2. Theoretical Design Decisions & Production Defenses

* **Why Delete-on-Write instead of Update-on-Write?**
  * *Concurrency & Race Condition Prevention:* In distributed systems, if two writes update the cache concurrently, network jitter could cause an earlier write to overwrite a later write in Redis. Invalidating (`DEL`) ensures the next read lazily re-fetches the authoritative, committed database state.
* **Cache Avalanche Mitigation (TTL Jitter):**
  * When thousands of listings are cached at startup with identical TTLs, they all expire simultaneously, producing an avalanche spike on MongoDB. NestHunt applies random jitter ($\text{TTL} = \text{base} \pm 10\%$) to spread expirations evenly across time.
* **Non-Blocking Invalidation (`SCAN` over `KEYS *`):**
  * Redis is single-threaded. Running `KEYS listings_feed:*` in a production database containing millions of keys blocks the event loop for seconds. NestHunt uses cursor-based iterative `SCAN` with batching (`COUNT 100`) to safely delete keys without blocking incoming traffic.
* **Graceful Degradation:**
  * If Redis experiences a network partition, runs out of memory, or fails to connect locally, `services/cacheService.js` automatically falls back to an internal in-memory store and direct database queries without throwing unhandled exceptions.
* **Mongoose Document Rehydration:**
  * EJS templates depend on Mongoose ObjectId methods like `listing.owner._id.equals(currentUser._id)`. When objects are serialized into Redis as JSON strings, ObjectIds become plain strings. NestHunt's `cacheService.rehydrateListing` restores ObjectIds so views work without errors.

---

## 📄 License
ISC License. Built for educational and portfolio demonstration.