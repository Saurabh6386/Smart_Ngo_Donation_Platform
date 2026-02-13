const express = require("express");
const router = express.Router();
const {
  createDonation,
  getDonations,
  updateDonationStatus, // <--- Make sure this is imported
  getMyDonations,
  deleteDonation,
  getNearbyDonations,
} = require("../controllers/donationController");

const { protect } = require("../middlewares/authMiddleware"); // <--- CRITICAL IMPORT
const upload = require("../middlewares/uploadMiddleware");

// 1. Get All & Create (With Image Upload)
router
  .route("/")
  .get(getDonations) // Public or Protected? Usually Protected
  .post(protect, upload.array("images", 5), createDonation);

// 2. Get My Donations
router.route("/my").get(protect, getMyDonations);

// 3. Update Status (Accept/Collect) -> THIS WAS LIKELY MISSING 'protect'
router.route("/:id").put(protect, updateDonationStatus); // <--- ENSURE 'protect' IS HERE
router.get("/nearby", protect, getNearbyDonations);
router.delete("/:id", protect, deleteDonation);

module.exports = router;
