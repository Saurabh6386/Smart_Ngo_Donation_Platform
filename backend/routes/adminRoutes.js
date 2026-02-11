const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  deleteUser, 
  verifyUser, 
  getAllDonations, 
  deleteDonation 
} = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware'); // Make sure you are using protect

// Users
router.get('/users', protect, getAllUsers);
router.delete('/users/:id', protect, deleteUser);
router.put('/users/:id/verify', protect, verifyUser); // 👈 This was likely missing!

// Donations
router.get('/donations', protect, getAllDonations);
router.delete('/donations/:id', protect, deleteDonation);

module.exports = router;