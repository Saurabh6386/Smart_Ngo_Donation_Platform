const mongoose = require("mongoose");

const donationSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Connects donation to the Donor who created it
    },
    name: {
      type: String, // Item name (e.g., "Old Winter Jacket")
      required: [true, "Please add item name"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    category: {
      type: String, // Clothes, Books, Electronics, etc.
      required: [true, "Please select a category"],
    },
    condition: {
      type: String, // New, Used - Good, Used - Fair
      required: true,
    },
    image: {
      type: String, // URL of the image (we will handle upload later)
      default: "https://via.placeholder.com/150",
    },
    images: [String],
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Collected"],
      default: "Pending",
    },
    location: {
      type: String, // Where is the item located?
      required: true,
    },
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // Array of [longitude, latitude]
        default: [77.209, 28.6139], // Default to New Delhi if geocoding fails
      },
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // The NGO that collects it
    },
  },
  {
    timestamps: true,
  },
);

donationSchema.index({ geometry: '2dsphere' });

module.exports = mongoose.model("Donation", donationSchema);
