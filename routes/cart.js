const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/WrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const cartController = require("../controllers/cart.js");

// Protect all cart routes with existing authentication middleware
router.use(isLoggedIn);

router
    .route("/")
    .get(wrapAsync(cartController.getCart))
    .post(wrapAsync(cartController.addToCart));

router
    .route("/:id")
    .put(wrapAsync(cartController.updateCartItem))
    .patch(wrapAsync(cartController.updateCartItem))
    .delete(wrapAsync(cartController.removeFromCart));

module.exports = router;
