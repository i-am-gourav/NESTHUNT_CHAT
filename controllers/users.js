const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

module.exports.renderSignup = (req, res) => {
    if (req.user) {
        return res.redirect("/listings");
    }
    res.render("users/signup.ejs", { error: null });
};

module.exports.signup = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).render("users/signup.ejs", {
            error: "All fields are required."
        });
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(trimmedEmail)) {
        return res.status(400).render("users/signup.ejs", {
            error: "Please enter a valid email address."
        });
    }

    if (password.length < 6) {
        return res.status(400).render("users/signup.ejs", {
            error: "Password must be at least 6 characters long."
        });
    }

    const existingUser = await User.findOne({
        $or: [
            { email: trimmedEmail },
            { username: trimmedUsername }
        ]
    });

    if (existingUser) {
        if (existingUser.username.toLowerCase() === trimmedUsername.toLowerCase()) {
            return res.status(400).render("users/signup.ejs", {
                error: "Username is already taken."
            });
        }
        if (existingUser.email.toLowerCase() === trimmedEmail) {
            return res.status(400).render("users/signup.ejs", {
                error: "Email is already registered."
            });
        }
    }

    const newUser = new User({
        username: trimmedUsername,
        email: trimmedEmail,
        password
    });

    await newUser.save();

    const token = jwt.sign(
        { userId: newUser._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.redirect("/listings");
};

module.exports.renderLogin = (req, res) => {
    if (req.user) {
        return res.redirect("/listings");
    }
    res.render("users/login.ejs", { error: req.query.error || null });
};

module.exports.login = async (req, res) => {
    const identifier = req.body.identifier || req.body.username || req.body.email;
    const password = req.body.password;

    if (!identifier || !password) {
        return res.status(400).render("users/login.ejs", {
            error: "Please enter your username/email and password."
        });
    }

    const trimmedId = identifier.trim();

    const user = await User.findOne({
        $or: [
            { email: trimmedId.toLowerCase() },
            { username: trimmedId }
        ]
    });

    if (!user) {
        return res.status(401).render("users/login.ejs", {
            error: "Invalid credentials"
        });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        return res.status(401).render("users/login.ejs", {
            error: "Invalid credentials"
        });
    }

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.redirect("/listings");
};

module.exports.logout = (req, res) => {
    res.clearCookie("token");
    res.redirect("/listings");
};
