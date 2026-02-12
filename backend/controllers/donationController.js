const Donation = require("../models/Donation");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// @desc    Get all donations (Available/Pending)
// @route   GET /api/donations
// @access  Private
const getDonations = async (req, res) => {
  const donations = await Donation.find({})
    .populate("user", "name email phone")
    .sort({ createdAt: -1 });

  res.status(200).json(donations);
};

const getMyDonations = async (req, res) => {
  const donations = await Donation.find({ user: req.user.id }).sort({
    createdAt: -1,
  });
  res.status(200).json(donations);
};

// @desc    Create a donation
// @route   POST /api/donations
// @access  Private
const createDonation = async (req, res) => {
  try {
    const { name, description, category, condition, location } = req.body;
    let imageUrls = [];

    // Parallel Image Upload (Faster)
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: "ngo-donations" }),
      );

      const results = await Promise.all(uploadPromises);
      imageUrls = results.map((result) => result.secure_url);

      // Clean up local files
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }

    if (!name || !description || !location) {
      return res.status(400).json({ message: "Please add all fields" });
    }

    const donation = await Donation.create({
      user: req.user.id,
      name,
      description,
      category,
      condition,
      location,
      image: imageUrls[0] || "https://via.placeholder.com/150", // Main image
      images: imageUrls, // All images
    });

    res.status(201).json(donation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update donation status (Accept/Collect)
// @route   PUT /api/donations/:id
// @access  Private (NGO Only)
const updateDonationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // 👇 SECURITY CHECK: Block Unverified NGOs from accepting items
    if (req.user.role === "ngo" && !req.user.isVerified) {
      return res
        .status(403)
        .json({ message: "Your account is pending verification by Admin." });
    }

    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      res.status(404);
      throw new Error("Donation not found");
    }

    // Update fields
    donation.status = status;

    // Track who collected it
    if (status === "Accepted" || status === "Collected") {
      donation.collectedBy = req.user.id;
    }

    const updatedDonation = await donation.save(); // Save to DB

    res.status(200).json(updatedDonation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Authorization Check
    // 1. Admin can delete anything
    // 2. Owner can delete ONLY if status is 'Pending'
    if (req.user.role !== "admin") {
      // Check if the user owns this donation
      if (donation.user.toString() !== req.user.id) {
        return res.status(401).json({ message: "Not authorized" });
      }

      // Strict Rule: Cannot delete if NGO has already Accepted/Collected
      if (donation.status !== "Pending") {
        return res.status(400).json({
          message: "Cannot delete donation once it is Accepted or Collected.",
        });
      }
    }

    await donation.deleteOne();
    res.json({ message: "Donation removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 👇 Don't forget to export it!
module.exports = {
  getDonations,
  getMyDonations,
  createDonation,
  updateDonationStatus,
  deleteDonation, // <--- Add this
};
