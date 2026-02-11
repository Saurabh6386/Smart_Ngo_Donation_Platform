const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
} = require("../controllers/authController");

// Define the paths
router.post("/register", registerUser);
router.post("/login", loginUser);
// router.get('/me', protect, getMe); // We will uncomment 'protect' later

module.exports = router;
