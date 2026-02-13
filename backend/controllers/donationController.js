const Donation = require("../models/Donation");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const axios = require("axios"); // 👈 Import axios

// @desc    Get all donations (Available/Pending)
// @route   GET /api/donations
// @access  Private
const getDonations = async (req, res) => {
  try {
    // 👇 The .populate() and .sort() are the crucial parts here!
    const donations = await Donation.find()
      .populate("user", "name profilePic")
      .sort({ createdAt: -1 }); // -1 sorts by newest first

    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
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
    const { name, description, category, condition, location, availableSlots } =
      req.body;
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: "ngo-donations" }),
      );
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map((result) => result.secure_url);
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }

    let parsedSlots = [];
    if (availableSlots) {
      try {
        parsedSlots = JSON.parse(availableSlots);
      } catch (e) {
        console.log("Error parsing slots");
      }
    }

    let coordinates = [77.209, 28.6139]; // Fallback (New Delhi)
    try {
      const geoRes = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`,
        {
          headers: { "User-Agent": "SmartNGODonationApp/1.0" }, // OpenStreetMap requires a User-Agent
        },
      );

      if (geoRes.data.length > 0) {
        coordinates = [
          parseFloat(geoRes.data[0].lon),
          parseFloat(geoRes.data[0].lat),
        ];
      }
    } catch (geoError) {
      console.error(
        "Geocoding failed, using default coordinates.",
        geoError.message,
      );
    }

    const donation = await Donation.create({
      user: req.user.id,
      name,
      description,
      category,
      condition,
      location,
      geometry: { type: "Point", coordinates }, // 👈 Save coordinates to DB
      availableSlots: parsedSlots,
      image: imageUrls[0] || "https://via.placeholder.com/150",
      images: imageUrls,
    });

    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 👇 NEW FUNCTION: Find donations within 10km radius
// @desc    Get nearby donations
// @route   GET /api/donations/nearby?lat=28.6&lng=77.2&radius=10
const getNearbyDonations = async (req, res) => {
  try {
    // Get coords from the query URL, default to Delhi and 10km
    const lng = parseFloat(req.query.lng) || 77.209;
    const lat = parseFloat(req.query.lat) || 28.6139;
    const radiusInKm = parseFloat(req.query.radius) || 10;

    const donations = await Donation.find({
      status: "Pending", // Only show available items
      geometry: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: radiusInKm * 1000, // MongoDB calculates distance in METERS (10km * 1000 = 10,000m)
        },
      },
    }).populate("user", "name phone");

    res.status(200).json(donations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update donation status (Accept/Collect)
// @route   PUT /api/donations/:id
// @access  Private (NGO Only)
// @desc    Update donation status (and allow pickup time updates)
const updateDonationStatus = async (req, res) => {
  try {
    const { status, pickupTime } = req.body;
    const donation = await Donation.findById(req.params.id);

    if (!donation) return res.status(404).json({ message: "Not found" });

    // 1. If a new status is provided, update it
    if (status) {
      donation.status = status;
      // If NGO is accepting, record who accepted it
      if (status === "Accepted") {
        donation.collectedBy = req.user.id;
      }
    }

    // 2. If a pickupTime is provided, save it!
    // (This allows the Donor to update the time from their dashboard later)
    if (pickupTime) {
      donation.pickupTime = pickupTime;
    }

    const updatedDonation = await donation.save();
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

module.exports = {
  getDonations,
  getMyDonations,
  createDonation,
  updateDonationStatus,
  deleteDonation,
  getNearbyDonations,
};
