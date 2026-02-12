const User = require("../models/User");
const Donation = require("../models/Donation");

// @desc    Get Homepage Stats (Level 2)
// @route   GET /api/analytics/stats
const getStats = async (req, res) => {
  try {
    // 1. Total Donations (All time)
    const totalDonations = await Donation.countDocuments();

    // 2. Verified NGOs
    const totalNGOs = await User.countDocuments({
      role: "ngo",
      isVerified: true,
    });

    // 3. Lives Impacted (Only Collected donations count!)
    const fulfilledDonations = await Donation.countDocuments({
      status: "Collected",
    });

    res.json({ totalDonations, totalNGOs, fulfilledDonations });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get Recent Activity (Level 1)
// @route   GET /api/analytics/recent
const getRecentActivity = async (req, res) => {
  try {
    // 👇 FIX: Only show donations that are actually COLLECTED
    const recent = await Donation.find({ status: "Collected" })
      .sort({ updatedAt: -1 }) // Sort by when it was collected, not created
      .limit(5)
      .populate("user", "name");

    res.json(recent);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get Top 3 Donors (Level 3 - Leaderboard)
// @route   GET /api/analytics/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Donation.aggregate([
      // 👇 FIX: Filter FIRST so only valid donations count
      { $match: { status: "Collected" } },

      { $group: { _id: "$user", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          name: "$userDetails.name",
          profilePic: "$userDetails.profilePic", // Include Profile Pic
          count: 1,
        },
      },
    ]);

    res.json(leaderboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getStats, getRecentActivity, getLeaderboard };
