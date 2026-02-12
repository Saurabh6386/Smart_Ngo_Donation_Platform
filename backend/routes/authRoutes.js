const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const multer = require("multer");

// Configure Multer (Temporary storage for uploads)
const upload = multer({ dest: "uploads/" });

// Routes
router.post("/register", upload.single("verificationDoc"), registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);

module.exports = router;
