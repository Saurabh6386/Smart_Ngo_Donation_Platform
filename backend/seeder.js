const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Donation = require("./models/Donation");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const importData = async () => {
  try {
    // 1. Clear ALL existing data
    await Donation.deleteMany();
    await User.deleteMany();

    console.log("🔥 Old Data Destroyed...");

    // 2. Hash Password ('123456')
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    // 3. Create Users Data
    const users = await User.insertMany([
      // --- INDEX 0: NGO 1 ---
      {
        name: "Helping Hands Foundation",
        email: "contact@helpinghands.org",
        password: hashedPassword,
        phone: "9876543210",
        role: "ngo",
        address: "Sector 62, Noida, UP",
        isVerified: true,
        verificationDocument:
          "https://res.cloudinary.com/demo/image/upload/sample.pdf",
        profilePic:
          "https://ui-avatars.com/api/?name=Helping+Hands&background=ff5252&color=fff",
      },
      // --- INDEX 1: NGO 2 ---
      {
        name: "Goonj Welfare Society",
        email: "info@goonj.org",
        password: hashedPassword,
        phone: "9812345678",
        role: "ngo",
        address: "Connaught Place, New Delhi",
        isVerified: true,
        verificationDocument:
          "https://res.cloudinary.com/demo/image/upload/sample.pdf",
        profilePic:
          "https://ui-avatars.com/api/?name=Goonj+Welfare&background=ff5252&color=fff",
      },
      // --- INDEX 2: NGO 3 (Pending) ---
      {
        name: "Umeed Foundation",
        email: "support@umeed.org",
        password: hashedPassword,
        phone: "9988776655",
        role: "ngo",
        address: "Kavi Nagar, Ghaziabad",
        isVerified: false,
        verificationDocument:
          "https://res.cloudinary.com/demo/image/upload/sample.pdf",
        profilePic:
          "https://ui-avatars.com/api/?name=Umeed+Foundation&background=ff5252&color=fff",
      },
      // --- INDEX 3: DONOR 1 (Rahul) ---
      {
        name: "Rahul Sharma",
        email: "rahul@gmail.com",
        password: hashedPassword,
        phone: "9998887777",
        role: "donor",
        address: "Raj Nagar Extension, Ghaziabad",
        isVerified: true,
        profilePic: "https://randomuser.me/api/portraits/men/32.jpg",
      },
      // --- INDEX 4: DONOR 2 (Priya) ---
      {
        name: "Priya Singh",
        email: "priya@gmail.com",
        password: hashedPassword,
        phone: "8887776666",
        role: "donor",
        address: "Indirapuram, Ghaziabad",
        isVerified: true,
        profilePic: "https://randomuser.me/api/portraits/women/44.jpg",
      },
      // --- INDEX 5: DONOR 3 (Amit) ---
      {
        name: "Amit Verma",
        email: "amit@gmail.com",
        password: hashedPassword,
        phone: "7776665555",
        role: "donor",
        address: "Vasundhara, Ghaziabad",
        isVerified: true,
        profilePic: "https://randomuser.me/api/portraits/men/65.jpg",
      },
      // --- INDEX 6: ADMIN ---
      {
        name: "Super Admin",
        email: "admin@gmail.com",
        password: hashedPassword,
        phone: "1234567890",
        role: "admin",
        address: "Admin HQ",
        isVerified: true,
        profilePic:
          "https://ui-avatars.com/api/?name=Admin&background=000&color=fff",
      },
    ]);

    console.log("👥 Users Imported!");

    // 4. Create Donations (Linked to above Users)
    // 👇 Notice the new 'geometry' field for MongoDB 2dsphere indexing! (Longitude, Latitude)
    const donations = [
      // --- PENDING ITEMS ---
      {
        user: users[3]._id,
        name: "Winter Jacket (XL)",
        description: "Hardly used winter jacket, very warm.",
        category: "Clothing",
        condition: "Used - Good",
        location: "Raj Nagar Ext, Ghaziabad",
        geometry: { type: "Point", coordinates: [77.4273, 28.7112] }, // Raj Nagar Ext coords
        status: "Pending",
        image:
          "https://images.unsplash.com/photo-1551488852-080175b6741d?w=400",
      },
      {
        user: users[4]._id,
        name: "NCERT Science Books",
        description: "Class 10th and 12th science textbooks set.",
        category: "Books",
        condition: "Used - Good",
        location: "Indirapuram, Ghaziabad",
        geometry: { type: "Point", coordinates: [77.3714, 28.6415] }, // Indirapuram coords
        status: "Pending",
        image:
          "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400",
      },

      // --- ACCEPTED ITEMS (NGO is picking up) ---
      {
        user: users[5]._id,
        name: "Rice & Pulses (10kg)",
        description: "Fresh sealed packets of rice and dal.",
        category: "Food",
        condition: "New",
        location: "Vasundhara, Ghaziabad",
        geometry: { type: "Point", coordinates: [77.3802, 28.6622] }, // Vasundhara coords
        status: "Accepted",
        collectedBy: users[0]._id,
        image:
          "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
      },

      // --- COLLECTED ITEMS (Already Done - Shows in Stats) ---
      {
        user: users[3]._id,
        name: "Old Lenovo Laptop",
        description: "Working condition, just needs a charger.",
        category: "Electronics",
        condition: "Used - Fair",
        location: "Raj Nagar Ext, Ghaziabad",
        geometry: { type: "Point", coordinates: [77.4273, 28.7112] },
        status: "Collected",
        collectedBy: users[1]._id,
        image:
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
      },
      {
        user: users[4]._id,
        name: "Woolen Blankets",
        description: "5 warm blankets for winter relief.",
        category: "Clothing",
        condition: "New",
        location: "Indirapuram, Ghaziabad",
        geometry: { type: "Point", coordinates: [77.3714, 28.6415] },
        status: "Collected",
        collectedBy: users[0]._id,
        image:
          "https://images.unsplash.com/photo-1580301762395-9c6423187655?w=400",
      },
    ];

    await Donation.insertMany(donations);

    console.log("📦 Donations Imported!");
    console.log("✅ DATABASE SEEDED SUCCESSFULLY!");
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
