const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, address } = req.body;

    // 1. Validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "Please add all fields" });
    }

    // 2. Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 3. Handle File Upload (Robust Logic)
    let verificationDocUrl = null;

    if (req.file) {
      console.log("File received:", req.file.path); // Debug log

      try {
        // A. Try Uploading to Cloudinary
        console.log("Attempting Cloudinary Upload...");
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "ngo-docs",
          resource_type: "auto", // Auto-detect (Image or PDF)
        });

        console.log("Cloudinary Success:", result.secure_url);
        verificationDocUrl = result.secure_url;

        // If successful, delete local file to save space
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        // B. FALLBACK: If Cloudinary fails, use the Local File
        console.error("Cloudinary Failed. Using Local File instead.");
        console.error("Error Detail:", uploadError.message);

        // Replace Windows backslashes (\) with forward slashes (/) for the URL
        // Example: 'uploads\file.pdf' -> 'uploads/file.pdf'
        verificationDocUrl = req.file.path.replace(/\\/g, "/");
      }
    }

    // 4. Role & Verification Logic
    // If role is admin, force it to donor (security).
    let safeRole = role === "admin" ? "donor" : role || "donor";

    // Donors are auto-verified. NGOs need Admin approval.
    const isVerified = safeRole === "donor";

    // 5. Create User
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: safeRole,
      address,
      isVerified,
      // 👇 This will now be the Cloudinary URL OR the Local Path (never null if file exists)
      verificationDocument: verificationDocUrl,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server Error during registration" });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
