# 🏠 NestHunt

A full-stack rental and property booking platform inspired by modern vacation-rental applications.

NestHunt allows users to discover properties, view detailed listings, upload property images, explore locations on an interactive map, create and manage listings, and interact with other users through reviews.

---

## 🚀 Features

### 👤 Authentication & Authorization
- User registration and login
- Session-based authentication
- Protected routes
- Authorization for listing owners
- Secure password handling

### 🏡 Property Listings
- Create new property listings
- Edit and delete listings
- View detailed property information
- Property image uploads using Cloudinary
- Location visualization using Mapbox
- Price and property details

### 🔎 Property Discovery
- Browse available properties
- Search and filter listings
- Location-based property discovery
- Interactive maps

### ⭐ Reviews & Ratings
- Users can add ratings and reviews
- Display average property ratings
- Delete authorized reviews

### 🤖 AI Property Assistant
- Natural-language interaction for property discovery
- AI-powered assistance using Groq API
- Converts user queries into meaningful property-search requirements

### 🛡️ Backend
- RESTful API architecture
- MVC architecture
- MongoDB database
- Mongoose ODM
- Express.js middleware
- Centralized error handling

---

## 🛠️ Tech Stack

### Frontend
- HTML
- CSS
- JavaScript
- EJS
- Bootstrap

### Backend
- Node.js
- Express.js
- REST APIs
- Mongoose

### Database
- MongoDB

### APIs & Services
- Cloudinary — Image storage
- Mapbox — Location and map services
- Groq API — AI-powered property assistance

### Authentication
- Passport.js
- Express Session

### Deployment
- Render

---

## 🏗️ Project Architecture

NestHunt follows the MVC (Model-View-Controller) architecture.

```text
                    NestHunt
                       │
        ┌──────────────┼──────────────┐
        │              │              │
       Model        Controller       View
        │              │              │
     MongoDB       Express.js        EJS
        │              │              │
        └──────────────┼──────────────┘
                       │
                    REST APIs
                       │
        ┌──────────────┼──────────────┐
        │              │              │
    Cloudinary       Mapbox        Groq AI