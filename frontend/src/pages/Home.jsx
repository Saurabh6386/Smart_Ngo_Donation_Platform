import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";

const Home = () => {
  const { user } = useContext(AuthContext);

  // States for data
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalNGOs: 0,
    fulfilledDonations: 0,
  });
  const [donations, setDonations] = useState([]); // 👈 Holds all live donations

  // States for toggling "Show More"
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [showAllDonors, setShowAllDonors] = useState(false);

  useEffect(() => {
    fetchLiveAnalytics();
  }, []);

 const fetchLiveAnalytics = async () => {
    try {
      // 1. Fetch the big numbers
      const statsRes = await axios.get("http://localhost:5000/api/analytics/stats");
      setStats(statsRes.data);

      // 2. Fetch ALL live donations
      const { data } = await axios.get("http://localhost:5000/api/donations");
      
      // 👇 THE FIX: Filter the list to ONLY show items that are "Collected"
      const completedDonations = data.filter((donation) => donation.status === "Collected");
      
      // Save only the completed ones to the state
      setDonations(completedDonations); 
      
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  // ==========================================
  // CALCULATE RECENT DONATIONS
  // ==========================================
  // Backend returns them newest first. Slice to 3 unless "Show More" is clicked.
  const displayedRecent = showAllRecent ? donations : donations.slice(0, 3);

  // ==========================================
  // CALCULATE TOP DONORS LEADERBOARD
  // ==========================================
  const donorMap = {};
  donations.forEach((d) => {
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

  // Convert map to array, sort by highest count, and slice
  const topDonors = Object.values(donorMap).sort((a, b) => b.count - a.count);
  const displayedLeaderboard = showAllDonors
    ? topDonors
    : topDonors.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* --- HERO SECTION --- */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
            Donate for a <span className="text-red-500">Better World</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8">
            Connect directly with verified NGOs. Your unused items can bring a
            smile to someone's face today.
          </p>

          <div className="flex gap-4">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="bg-red-500 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-red-600 transition transform hover:-translate-y-1"
            >
              {user ? "Go to Dashboard" : "Start Donating"}
            </Link>

            {!user && (
              <Link
                to="/login"
                className="bg-white text-gray-800 border border-gray-300 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* --- LEVEL 2: IMPACT STATS --- */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-4">
            <h4 className="text-5xl font-bold text-red-500">
              {stats.totalNGOs}
            </h4>
            <p className="text-gray-400 mt-2 uppercase tracking-wide">
              Verified NGOs
            </p>
          </div>
          <div className="p-4 border-l border-gray-700">
            <h4 className="text-5xl font-bold text-blue-500">
              {stats.totalDonations}
            </h4>
            <p className="text-gray-400 mt-2 uppercase tracking-wide">
              Donations Listed
            </p>
          </div>
          <div className="p-4 border-l border-gray-700">
            <h4 className="text-5xl font-bold text-green-500">
              {stats.fulfilledDonations}
            </h4>
            <p className="text-gray-400 mt-2 uppercase tracking-wide">
              Lives Impacted
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
        {/* --- LEVEL 1: RECENT ACTIVITY --- */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col h-full">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            ⚡ Recent Donations
            <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full animate-pulse">
              LIVE
            </span>
          </h3>

          <div className="space-y-4 flex-grow">
            {displayedRecent.length === 0 ? (
              <p className="text-gray-500">No recent activity.</p>
            ) : (
              displayedRecent.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition border border-transparent hover:border-gray-100"
                >
                  <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-2xl shadow-sm">
                    {item.category === "Food"
                      ? "🍔"
                      : item.category === "Clothing"
                        ? "👕"
                        : "🎁"}
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">
                      <span className="font-bold text-gray-900">
                        {item.user?.name || "Anonymous"}
                      </span>{" "}
                      donated{" "}
                      <span className="text-blue-600 font-semibold">
                        {item.name}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 👇 Show More Button for Donations 👇 */}
          {donations.length > 3 && (
            <button
              onClick={() => setShowAllRecent(!showAllRecent)}
              className="mt-6 w-full py-3 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition border border-gray-200"
            >
              {showAllRecent
                ? "Show Less ⬆️"
                : `Show All ${donations.length} Donations ⬇️`}
            </button>
          )}
        </div>

        {/* --- LEVEL 3: LEADERBOARD --- */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col h-full">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            🏆 Top Donors of the Month
          </h3>

          <div className="space-y-4 flex-grow">
            {displayedLeaderboard.length === 0 ? (
              <p className="text-gray-500">Be the first to donate!</p>
            ) : (
              displayedLeaderboard.map((donor, index) => (
                <div
                  key={donor.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-10 w-10 flex items-center justify-center rounded-full font-bold text-white shadow-md
                      ${index === 0 ? "bg-yellow-400" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-orange-400" : "bg-blue-300"}`}
                    >
                      {index + 1}
                    </div>

                    <img
                      src={donor.profilePic}
                      alt={donor.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />

                    <div>
                      <p className="font-bold text-gray-800 text-lg">
                        {donor.name}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        {index < 3 ? "🌟 Super Donor" : "Generous Donor"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-green-500">
                      {donor.count}
                    </span>
                    <p className="text-xs text-gray-400 font-medium mt-1">
                      Donations
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 👇 Show More Button for Leaderboard 👇 */}
          {topDonors.length > 3 && (
            <button
              onClick={() => setShowAllDonors(!showAllDonors)}
              className="mt-6 w-full py-3 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition border border-gray-200"
            >
              {showAllDonors
                ? "Show Less ⬆️"
                : `Show All ${topDonors.length} Donors ⬇️`}
            </button>
          )}
        </div>
      </div>

      {/* --- HOW IT WORKS --- */}
      <div className="bg-gray-50 py-12 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="font-bold text-lg text-gray-800">
                1. List Your Item
              </h3>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="font-bold text-lg text-gray-800">
                2. NGO Accepts
              </h3>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="font-bold text-lg text-gray-800">
                3. Pickup & Joy
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
