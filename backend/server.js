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

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/donations", require("./routes/donationRoutes"));
app.use("/api/admin", require("./routes/adminRoutes")); // Admin routes added

// Socket.io Connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Example: Listen for a new donation event
  socket.on("new_donation", (data) => {
    // Broadcast to all connected clients (like NGOs)
    io.emit("donation_alert", data);
  });

  socket.on("disconnect", () => {
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
