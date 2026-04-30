const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");

// @desc    Get all conversations for a user
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "name email profilePic role")
      .populate({
        path: "lastMessage",
        select: "text sender createdAt",
      })
      .sort({ lastMessageTime: -1 });

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/chat/conversations/:conversationId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant = conversation.participants.includes(userId);
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this conversation",
      });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "name profilePic")
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: userId,
        isRead: false,
      },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Send a message
// @route   POST /api/chat/send
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.user._id;

    // Validation
    if (!receiverId || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Receiver and message text are required",
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    // Prevent self-messaging
    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot send message to yourself",
      });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    // Create message
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      conversation: conversation._id,
      text: text.trim(),
    });

    // Update conversation last message
    conversation.lastMessage = message._id;
    conversation.lastMessageTime = new Date();
    await conversation.save();

    // Populate sender info
    const populatedMessage = await message.populate("sender", "name profilePic");

    // Emit real-time message to receiver via Socket.io
    if (req.io && req.userSocketMap) {
      const receiverSocketId = req.userSocketMap[receiverId];
      if (receiverSocketId) {
        req.io.to(receiverSocketId).emit("receive_message", {
          senderId: senderId.toString(),
          senderName: req.user.name,
          senderProfilePic: req.user.profilePic,
          message: text.trim(),
          conversationId: conversation._id,
          timestamp: new Date(),
        });
      }
    }

    res.status(201).json({
      success: true,
      message: populatedMessage,
      conversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/chat/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Message.countDocuments({
      receiver: userId,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete a message
// @route   DELETE /api/chat/messages/:messageId
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Verify ownership
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this message",
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
  deleteMessage,
};
