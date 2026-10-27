require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const cookieParser = require("cookie-parser");

const ExpressError = require("./utils/ExpressError.js");
const { attachCurrentUser } = require("./middleware.js");

// Import Routers
const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/users.js");
const cartRouter = require("./routes/cart.js");
const chatRouter = require("./routes/chat.js");

const dbUrl = process.env.ATLASDB_URL || process.env.MONGO_URL || "mongodb://127.0.0.1:27017/NESTHUNT";

// Connect to MongoDB
async function main() {
    await mongoose.connect(dbUrl);
    console.log(`Connected to MongoDB (${process.env.ATLASDB_URL ? "Atlas" : "Local"})`);
}

main().catch((err) => {
    console.error("MongoDB connection error:", err.message);
});

// View Engine & Static Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Core Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "/public")));

// Attach user to req.user and res.locals.currentUser on every request
app.use(attachCurrentUser);

// Expose Mapbox token to templates
app.use((req, res, next) => {
    res.locals.mapToken = process.env.MAP_TOKEN;
    next();
});

// ==========================================
// ROUTES
// ==========================================

// Root Route
app.get("/", (req, res) => {
    res.redirect("/listings");
});

// Mount Resource Routers
app.use("/", userRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/cart", cartRouter);
app.use("/chat", chatRouter);

// ==========================================
// ERROR HANDLING
// ==========================================

// 404 Not Found Handler
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Custom Error Handling Middleware
app.use((err, req, res, next) => {
    const {
        statusCode = 500,
        message = "Something went wrong"
    } = err;

    res.status(statusCode).render("error.ejs", {
        message
    });
});

// ==========================================
// PORT LISTENING
// ==========================================
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is listening to port ${PORT}`);
});