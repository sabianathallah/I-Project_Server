const express = require("express");
const router = express.Router();
const ChatController = require("../controllers/chatController");

// POST /chat - Send message to AI chatbot (authenticated users only)
// Authentication is already applied in routes/index.js
router.post("/", ChatController.chat);

module.exports = router;
