const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/WrapAsync.js");
const userController = require("../controllers/users.js");

router
    .route("/signup")
    .get(userController.renderSignup)
    .post(wrapAsync(userController.signup));

router
    .route("/login")
    .get(userController.renderLogin)
    .post(wrapAsync(userController.login));

router.get("/logout", userController.logout);

module.exports = router;
