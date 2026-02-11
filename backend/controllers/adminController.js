const User = require('../models/User');
const Donation = require('../models/Donation');

// @desc    Get all users
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne(); // 👈 Modern Mongoose syntax
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Verify an NGO
// @route   PUT /api/admin/users/:id/verify
// @desc    Verify an NGO
// @route   PUT /api/admin/users/:id/verify
const verifyUser = async (req, res) => {
  try {
    // 👇 Use findByIdAndUpdate instead of .save()
    // This is safer because it bypasses strict validation checks on other fields
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true } // Returns the updated document
    );

    if (user) {
      res.json({ message: 'User verified successfully', user });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error("Verify Error:", error); // 👇 Log error to terminal so we can see it
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all donations
// @route   GET /api/admin/donations
const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a donation
// @route   DELETE /api/admin/donations/:id
const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (donation) {
      await donation.deleteOne(); // 👈 Modern Mongoose syntax
      res.json({ message: 'Donation removed' });
    } else {
      res.status(404).json({ message: 'Donation not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getAllUsers, deleteUser, verifyUser, getAllDonations, deleteDonation };