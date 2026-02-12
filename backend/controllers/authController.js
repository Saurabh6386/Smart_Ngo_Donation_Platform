const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// 👇 FIX 1: Use a reliable default image generator (Initials)
const DEFAULT_PIC = "https://ui-avatars.com/api/?name=User&background=random";

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

    // Default Profile Pic: Use their name initials
    let profilePicUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

    if (req.file) {
      try {
        // A. Try Uploading to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: role === "ngo" ? "ngo-docs" : "user-profiles",
          resource_type: "auto", // Auto-detect (Image or PDF)
        });

        if (role === "ngo") {
          verificationDocUrl = result.secure_url;
        }
        // If Donor -> Save as Profile Pic
        else {
          profilePicUrl = result.secure_url;
        }

        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        console.error("Cloudinary Failed. Using Local File instead.");
        console.error("Error Detail:", uploadError.message);

        // Fallback for local dev
        if (role === "ngo") {
          verificationDocUrl = req.file.path.replace(/\\/g, "/");
        }
      }
    }

    // 4. Role & Verification Logic
    let safeRole = role === "admin" ? "donor" : role || "donor";
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
      verificationDocument: verificationDocUrl,
      profilePic: profilePicUrl, // 👈 Saves Cloudinary URL or UI-Avatar default
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profilePic: user.profilePic,
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
      profilePic: user.profilePic, // 👈 Ensure frontend gets this on login
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
