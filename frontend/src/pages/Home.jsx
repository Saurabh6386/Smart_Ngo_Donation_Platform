import { useEffect, useState, useContext } from "react"; // 👈 Import useContext
import { Link } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext"; // 👈 Import AuthContext

const Home = () => {
  const { user } = useContext(AuthContext); // 👈 Get current user status

  const [stats, setStats] = useState({
    totalDonations: 0,
    totalNGOs: 0,
    fulfilledDonations: 0,
  });
  const [recent, setRecent] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const statsRes = await axios.get(
        "http://localhost:5000/api/analytics/stats",
      );
      setStats(statsRes.data);

      const recentRes = await axios.get(
        "http://localhost:5000/api/analytics/recent",
      );
      setRecent(recentRes.data);

      const leaderRes = await axios.get(
        "http://localhost:5000/api/analytics/leaderboard",
      );
      setLeaderboard(leaderRes.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

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
            {/* 👇 UPDATED LOGIC: If logged in -> Dashboard, else -> Register */}
            <Link
              to={user ? "/dashboard" : "/register"}
              className="bg-red-500 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-red-600 transition transform hover:-translate-y-1"
            >
              {user ? "Go to Dashboard" : "Start Donating"}
            </Link>

            {/* 👇 Only show Login button if user is NOT logged in */}
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

      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* --- LEVEL 1: RECENT ACTIVITY --- */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            ⚡ Recent Donations
            <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full animate-pulse">
              LIVE
            </span>
          </h3>
          <div className="space-y-4">
            {recent.length === 0 ? (
              <p className="text-gray-500">No recent activity.</p>
            ) : (
              recent.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition"
                >
                  <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
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
                      donated <span className="text-blue-600">{item.name}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- LEVEL 3: LEADERBOARD --- */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            🏆 Top Donors of the Month
          </h3>
          <div className="space-y-4">
            {leaderboard.length === 0 ? (
              <p className="text-gray-500">Be the first to donate!</p>
            ) : (
              leaderboard.map((donor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-10 w-10 flex items-center justify-center rounded-full font-bold text-white shadow-md
                    ${index === 0 ? "bg-yellow-400" : index === 1 ? "bg-gray-400" : "bg-orange-400"}`}
                    >
                      {index + 1}
                    </div>

                    <img
                      src={
                        donor.profilePic ||
                        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                      }
                      alt={donor.name}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    />

                    <div>
                      <p className="font-bold text-gray-800 text-lg">
                        {donor.name}
                      </p>
                      <p className="text-xs text-gray-500">Super Donor</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-green-600">
                      {donor.count}
                    </span>
                    <p className="text-xs text-gray-500">Donations</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* --- HOW IT WORKS --- */}
      <div className="bg-gray-50 py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="font-bold text-lg">1. List Your Item</h3>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="font-bold text-lg">2. NGO Accepts</h3>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="font-bold text-lg">3. Pickup & Joy</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
