const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
    phone: {
      type: String,
      required: [true, "Please add a phone number"],
    },
    role: {
      type: String,
      enum: ["donor", "ngo", "admin"],
      default: "donor",
    },
    address: {
      type: String,
    },
    // 👇 NEW FIELD: Tracks if NGO is approved by Admin
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationDocument: {
      type: String,
      default: null,
    },
    profilePic: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg", // Default Placeholder
    },
  },
  {
    timestamps: true,
  },
);

// Encrypt password using bcrypt before saving
userSchema.pre("save", async function () {
  // If the password wasn't changed (like when updating a profile pic), skip this!
  if (!this.isModified("password")) {
    return; // 👈 Just standard 'return' to stop the function
  }

  // Generate salt and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  // No need for 'next()' or try/catch here, async handles errors automatically!
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
