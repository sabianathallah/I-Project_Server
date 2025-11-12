const express = require("express");
const router = express.Router();
const ChatController = require("../controllers/chatController");
const authentication = require("../middlewares/authentication");

// POST /chat - Send message to AI chatbot (authenticated users only)
router.post("/", authentication, ChatController.chat);

module.exports = router;
