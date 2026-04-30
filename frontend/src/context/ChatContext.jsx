import { createContext, useState, useCallback, useRef, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingStatus, setTypingStatus] = useState(null);
  const socketRef = useRef(null);

  // Initialize Socket.io connection
  const initializeSocket = useCallback((userId) => {
    const newSocket = io("http://localhost:5000", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      newSocket.emit("user_connected", userId);
    });

    // Listen for incoming messages from other users
    newSocket.on("receive_message", (data) => {
      console.log("Received message:", data);
      // Add message to the messages array in real-time
      const newMessage = {
        _id: `temp_${Date.now()}`,
        sender: {
          _id: data.senderId,
          name: data.senderName,
          profilePic: data.senderProfilePic,
        },
        receiver: {
          _id: userId,
        },
        text: data.message,
        createdAt: data.timestamp || new Date(),
        isRead: false,
      };
      setMessages((prev) => [...prev, newMessage]);
    });

    newSocket.on("user_typing", (data) => {
      setTypingStatus(data.senderName);
    });

    newSocket.on("user_stop_typing", () => {
      setTypingStatus(null);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
    // Store socket in window for easy access
    window.socketInstance = newSocket;
    
    return newSocket;
  }, []);

  // Fetch all conversations
  const fetchConversations = useCallback(async (token) => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/chat/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(data.conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  }, []);

  // Fetch messages in a conversation
  const fetchMessages = useCallback(async (conversationId, token) => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/chat/conversations/${conversationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(
    async (receiverId, text, token) => {
      try {
        const { data } = await axios.post(
          "http://localhost:5000/api/chat/send",
          { receiverId, text },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Add sent message immediately to state
        setMessages((prev) => [...prev, data.message]);
        
        // Update conversations list with new last message
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === data.conversation._id
              ? {
                  ...conv,
                  lastMessage: data.message,
                  lastMessageTime: data.message.createdAt,
                }
              : conv
          )
        );
        
        return data;
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    []
  );

  // Get unread count
  const fetchUnreadCount = useCallback(async (token) => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/chat/unread-count",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, []);

  // Delete a message
  const deleteMessage = useCallback(async (messageId, token) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/chat/messages/${messageId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  }, []);

  // Emit typing status
  const emitTyping = useCallback(
    (receiverId, senderName) => {
      if (socketRef.current) {
        socketRef.current.emit("typing", { receiverId, senderName });
      }
    },
    []
  );

  // Emit stop typing
  const emitStopTyping = useCallback(
    (receiverId) => {
      if (socketRef.current) {
        socketRef.current.emit("stop_typing", { receiverId });
      }
    },
    []
  );

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        socket,
        unreadCount,
        typingStatus,
        setActiveConversation,
        initializeSocket,
        fetchConversations,
        fetchMessages,
        sendMessage,
        fetchUnreadCount,
        deleteMessage,
        emitTyping,
        emitStopTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
