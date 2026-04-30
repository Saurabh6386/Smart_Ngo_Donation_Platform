const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http"); // New: Needed for Socket.io
const { Server } = require("socket.io"); // New: Socket.io library
const connectDB = require("./config/db");
const { errorHandler } = require("./middlewares/errorMiddleware"); // Custom error handler
const path = require("path");

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app); // Wrap express app with HTTP server

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // This will be your Frontend URL (Vite default)
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Make io available to controllers
app.use((req, res, next) => {
  req.io = io;
  req.userSocketMap = userSocketMap;
  next();
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/donations", require("./routes/donationRoutes"));
app.use("/api/admin", require("./routes/adminRoutes")); // Admin routes added
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/chat", require("./routes/chatRoutes")); // Chat routes

// Socket.io Connection
const userSocketMap = {}; // Map to store user:socketId

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Store socket ID with user ID when they connect
  socket.on("user_connected", (userId) => {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} connected with socket ${socket.id}`);
    io.emit("user_online", { userId, online: true });
  });

  // Example: Listen for a new donation event
  socket.on("new_donation", (data) => {
    // Broadcast to all connected clients (like NGOs)
    io.emit("donation_alert", data);
  });

  // Chat: Send message event
  socket.on("send_message", (data) => {
    const { receiverId, message } = data;
    // Send message only to the receiver
    if (userSocketMap[receiverId]) {
      io.to(userSocketMap[receiverId]).emit("receive_message", {
        senderId: data.senderId,
        senderName: data.senderName,
        message,
        timestamp: new Date(),
      });
    }
  });

  // Chat: Typing indicator
  socket.on("typing", (data) => {
    const { receiverId, senderName } = data;
    if (userSocketMap[receiverId]) {
      io.to(userSocketMap[receiverId]).emit("user_typing", {
        senderName,
      });
    }
  });

  // Chat: Stop typing
  socket.on("stop_typing", (data) => {
    const { receiverId } = data;
    if (userSocketMap[receiverId]) {
      io.to(userSocketMap[receiverId]).emit("user_stop_typing", {});
    }
  });

  socket.on("disconnect", () => {
    // Remove user from online map
    for (let userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        io.emit("user_online", { userId, online: false });
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
    console.log("User disconnected");
  });
});

// Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// IMPORTANT: Use server.listen instead of app.listen for Socket.io to work
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
