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

### ⭐ 6. Reviews & Rating System
- Review submissions with author attribution and delete permissions.
- Animated Starability slot-machine rating inputs and badges.

---

## 🛠️ Technology Stack

| Domain | Technology |
|---|---|
| **Frontend** | EJS (Embedded JavaScript), HTML5, CSS3, Bootstrap 5, FontAwesome 6 |
| **Backend** | Node.js, Express.js (MVC Architecture, Express Router) |
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
│   └── users.js          # JWT login, signup, logout
├── models/               # Mongoose data models
│   ├── listing.js        # Listing schema (geometry, category, owner, reviews)
│   ├── review.js         # Review schema (rating, comment, author)
│   └── user.js           # User schema (email, username, bcrypt hash)
├── routes/               # Express modular route definitions
│   ├── listings.js       # /listings endpoints
│   ├── reviews.js        # /listings/:id/reviews endpoints
│   └── users.js          # /signup, /login, /logout endpoints
├── views/                # EJS server-rendered templates
│   ├── includes/         # Navbar (search), Footer
│   ├── layouts/          # Boilerplate layout
│   ├── listings/         # Home index, show, new, edit
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
```

### 4. Seed Database (Optional)
```bash
node init/index.js
```

### 5. Start Development Server
```bash
npm start
# or using nodemon
npx nodemon app.js
```
The application will be accessible at `http://localhost:8080`.

---

## 📄 License
ISC License. Built for educational and portfolio demonstration.