const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, phone, role, address } = req.body;

  // 1. Validation
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  // 2. Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // --- SECURITY LOGIC ---
  
  // A. Force 'admin' role to 'donor' (Blocks public admin registration)
  let safeRole = role;
  if (role === 'admin') {
    safeRole = 'donor'; 
  }
  // Default to donor if empty
  if (!safeRole) safeRole = 'donor';

  // B. Set Verification Status
  // Donors = Auto-verified (True)
  // NGOs = Pending Admin Approval (False)
  const isVerified = (safeRole === 'donor') ? true : false;

  // --- END SECURITY LOGIC ---

  // 3. Create User
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: safeRole,
    address,
    isVerified, // Save status
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
    res.status(400).json({ message: 'Invalid user data' });
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
      isVerified: user.isVerified, // Frontend needs this to show "Pending" message
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
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