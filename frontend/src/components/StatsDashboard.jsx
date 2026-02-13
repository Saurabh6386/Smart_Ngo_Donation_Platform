import { useState, useEffect } from "react";
import axios from "axios";

// Helper to assign emojis based on category
const getCategoryIcon = (category) => {
  const cat = category?.toLowerCase() || "";
  if (cat.includes("cloth") || cat.includes("shirt")) return "👕";
  if (cat.includes("book") || cat.includes("education")) return "📚";
  if (cat.includes("food") || cat.includes("rice")) return "🍔";
  if (cat.includes("electronic") || cat.includes("laptop")) return "💻";
  return "🎁"; // Default gift icon
};

const StatsDashboard = () => {
  const [donations, setDonations] = useState([]);

  // Toggle states for Show More / Show Less
  const [showAllDonations, setShowAllDonations] = useState(false);
  const [showAllDonors, setShowAllDonors] = useState(false);

  useEffect(() => {
    // Fetch live data from backend
    const fetchDonations = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/donations");
        setDonations(data);
      } catch (error) {
        console.error("Failed to load stats", error);
      }
    };
    fetchDonations();
  }, []);

  // ==========================================
  // 1. CALCULATE RECENT DONATIONS
  // ==========================================
  // The backend already sorted them by newest, so we just slice the array
  const displayedDonations = showAllDonations
    ? donations
    : donations.slice(0, 3);

  // ==========================================
  // 2. CALCULATE TOP DONORS
  // ==========================================
  const donorMap = {};
  donations.forEach((d) => {
    // Check if donation has a user attached
    if (d.user && d.user._id) {
      if (!donorMap[d.user._id]) {
        donorMap[d.user._id] = {
          id: d.user._id,
          name: d.user.name,
          profilePic:
            d.user.profilePic ||
            `https://ui-avatars.com/api/?name=${d.user.name.replace(" ", "+")}`,
          count: 0,
        };
      }
      donorMap[d.user._id].count += 1;
    }
  });

  // Convert map to array and sort by highest count
  const topDonors = Object.values(donorMap).sort((a, b) => b.count - a.count);
  const displayedDonors = showAllDonors ? topDonors : topDonors.slice(0, 3);

  // Helper for rank badge colors
  const getRankStyle = (index) => {
    if (index === 0) return "bg-yellow-400 text-white shadow-md"; // 1st Gold
    if (index === 1) return "bg-gray-400 text-white shadow-md"; // 2nd Silver
    if (index === 2) return "bg-orange-500 text-white shadow-md"; // 3rd Bronze
    return "bg-blue-100 text-blue-800"; // 4th+ Place
  };

  return (
    <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      {/* ================= LEFT COLUMN: RECENT DONATIONS ================= */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          ⚡ Recent Donations
          <span className="text-xs bg-red-100 text-red-500 px-2 py-1 rounded-full font-bold uppercase tracking-wide">
            Live
          </span>
        </h2>

        <div className="space-y-6">
          {displayedDonations.length === 0 ? (
            <p className="text-gray-500">No donations yet.</p>
          ) : (
            displayedDonations.map((item) => (
              <div key={item._id} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-2xl">
                  {getCategoryIcon(item.category)}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">
                    <span className="font-bold">
                      {item.user?.name || "Anonymous"}
                    </span>{" "}
                    donated <span className="text-blue-600">{item.name}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(item.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Show More Button (Only show if there are more than 3 items) */}
        {donations.length > 3 && (
          <button
            onClick={() => setShowAllDonations(!showAllDonations)}
            className="w-full mt-6 py-2 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
          >
            {showAllDonations ? "Show Less ⬆️" : "Show More ⬇️"}
          </button>
        )}
      </div>

      {/* ================= RIGHT COLUMN: TOP DONORS ================= */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          🏆 Top Donors of the Month
        </h2>

        <div className="space-y-4">
          {displayedDonors.length === 0 ? (
            <p className="text-gray-500">No donors yet. Be the first!</p>
          ) : (
            displayedDonors.map((donor, index) => (
              <div
                key={donor.id}
                className="flex items-center gap-4 p-3 rounded-xl border border-gray-50 hover:shadow-md transition bg-gray-50"
              >
                {/* Rank Badge */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankStyle(index)}`}
                >
                  {index + 1}
                </div>

                {/* Avatar */}
                <img
                  src={donor.profilePic}
                  alt={donor.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />

                {/* Name & Title */}
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{donor.name}</p>
                  <p className="text-xs text-gray-500">
                    {index < 3 ? "🌟 Super Donor" : "Generous Donor"}
                  </p>
                </div>

                {/* Total Count */}
                <div className="text-right">
                  <p className="text-xl font-black text-green-500">
                    {donor.count}
                  </p>
                  <p className="text-xs text-gray-400">Donations</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Show More Button (Only show if there are more than 3 donors) */}
        {topDonors.length > 3 && (
          <button
            onClick={() => setShowAllDonors(!showAllDonors)}
            className="w-full mt-6 py-2 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
          >
            {showAllDonors ? "Show Less ⬆️" : "Show More ⬇️"}
          </button>
        )}
      </div>
    </div>
  );
};

export default StatsDashboard;
