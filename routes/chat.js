const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.js");

// POST /chat/message
router.post("/message", chatController.chatMessage);

module.exports = router;
