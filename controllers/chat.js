const { generateChatResponse } = require("../services/aiService.js");

module.exports.chatMessage = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message || typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                success: false,
                error: "Message is required"
            });
        }

        const result = await generateChatResponse({
            message,
            history: Array.isArray(history) ? history : []
        });

        res.json({
            success: true,
            reply: result.reply,
            listings: result.listings
        });
    } catch (err) {
        console.error("Chat controller error:", err);
        res.status(500).json({
            success: false,
            error: "An error occurred while processing your request.",
            reply: "Sorry, I ran into an issue finding stays for you right now. Please try again in a moment.",
            listings: []
        });
    }
};
