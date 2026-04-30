const express = require("express");
const {
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
  deleteMessage,
} = require("../controllers/chatController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all conversations for authenticated user
router.get("/conversations", getConversations);

// Get messages in a specific conversation
router.get("/conversations/:conversationId", getMessages);

// Send a message
router.post("/send", sendMessage);

// Get unread message count
router.get("/unread-count", getUnreadCount);

// Delete a message
router.delete("/messages/:messageId", deleteMessage);

module.exports = router;
