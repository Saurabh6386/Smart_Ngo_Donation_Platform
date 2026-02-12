import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ImageSlider from "../common/ImageSlider"; // Assuming you have this or standard img tag

const NgoDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [myCollected, setMyCollected] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        setCurrentUser(userInfo);

        // Check verification status
        try {
          const userRes = await axios.get("http://localhost:5000/api/auth/me", {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          });
          setIsVerified(userRes.data.isVerified);
          const updatedUser = {
            ...userInfo,
            isVerified: userRes.data.isVerified,
          };
          localStorage.setItem("userInfo", JSON.stringify(updatedUser));
        } catch (e) {
          setIsVerified(userInfo.isVerified);
        }

        const { data } = await axios.get(
          "http://localhost:5000/api/donations",
          { headers: { Authorization: `Bearer ${userInfo.token}` } },
        );
        setDonations(data.filter((d) => d.status === "Pending"));
        setMyClaims(
          data.filter(
            (d) => d.status === "Accepted" && d.collectedBy === userInfo._id,
          ),
        );
        setMyCollected(
          data.filter(
            (d) => d.status === "Collected" && d.collectedBy === userInfo._id,
          ),
        );
      } catch (error) {
        toast.error("Error fetching donations");
      }
    };
    fetchData();
  }, []);

  const updateStatus = async (id, newStatus) => {
    if (newStatus === "Accepted" && !isVerified)
      return toast.error("Verification Pending! Cannot accept.");
    try {
      await axios.put(
        `http://localhost:5000/api/donations/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${currentUser.token}` } },
      );
      toast.success(`Marked as ${newStatus}!`);

      // Manual State Update
      if (newStatus === "Accepted") {
        const item = donations.find((d) => d._id === id);
        setDonations(donations.filter((d) => d._id !== id));
        setMyClaims([
          ...myClaims,
          { ...item, status: "Accepted", collectedBy: currentUser._id },
        ]);
      } else if (newStatus === "Collected") {
        const item = myClaims.find((d) => d._id === id);
        setMyClaims(myClaims.filter((d) => d._id !== id));
        setMyCollected([...myCollected, { ...item, status: "Collected" }]);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const openMaps = (loc) =>
    window.open(
      `http://maps.google.com/?q=${encodeURIComponent(loc)}`,
      "_blank",
    );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Verification Banner */}
      {!isVerified ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded shadow-sm">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                ⚠️ Account Verification Pending
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                You cannot accept donations until an Admin verifies your NGO
                account.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-8 rounded shadow-sm">
          <p className="text-sm font-medium text-green-800">
            ✅ <strong>Verified Account</strong> - You can accept donations.
          </p>
        </div>
      )}

      {/* Accepted Section */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 mb-10 shadow-sm">
        <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
          ✅ Ready for Pickup (Accepted)
        </h3>
        {myClaims.length === 0 ? (
          <p className="text-blue-700">You have no pending pickups.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myClaims.map((d) => (
              <div
                key={d._id}
                className="bg-white rounded-lg shadow p-4 flex flex-col justify-between"
              >
                <div>
                  <ImageSlider
                    images={d.images.length ? d.images : [d.image]}
                  />
                  <h4 className="font-bold text-lg mt-3">{d.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">📍 {d.location}</p>
                  <p className="text-sm text-gray-600">
                    📞 {d.user?.phone || "N/A"}
                  </p>
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={() => openMaps(d.location)}
                    className="bg-orange-500 hover:bg-orange-600 text-white py-2 rounded font-medium transition"
                  >
                    📍 Navigate
                  </button>
                  <button
                    onClick={() => updateStatus(d._id, "Collected")}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium transition"
                  >
                    📦 Mark Collected
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Section */}
      <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
        📢 New Available Donations
      </h3>
      {donations.length === 0 ? (
        <p className="text-gray-500">No new donations available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((d) => (
            <div
              key={d._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 overflow-hidden border border-gray-100"
            >
              <div className="p-4">
                <ImageSlider images={d.images.length ? d.images : [d.image]} />
                <h4 className="font-bold text-xl mt-3 text-gray-800">
                  {d.name}
                </h4>
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-semibold">Category:</span>{" "}
                    {d.category}
                  </p>
                  <p>
                    <span className="font-semibold">Location:</span>{" "}
                    {d.location}
                  </p>
                </div>
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => updateStatus(d._id, "Accepted")}
                    disabled={!isVerified}
                    className={`flex-1 py-2 rounded font-bold text-white transition ${isVerified ? "bg-blue-600 hover:bg-blue-700 cursor-pointer" : "bg-gray-400 cursor-not-allowed"}`}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => openMaps(d.location)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded font-medium transition"
                  >
                    Map
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History Toggle */}
      <div className="mt-12 text-center">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-gray-500 hover:text-gray-800 underline text-sm font-medium"
        >
          {showHistory
            ? "Hide Collected History ▲"
            : "Show Collected History ▼"}
        </button>
      </div>

      {showHistory && (
        <div className="mt-6 bg-gray-50 p-6 rounded-lg shadow-inner">
          <h3 className="text-lg font-bold text-gray-700 mb-4">
            🎉 Collected Items History
          </h3>
          {myCollected.length === 0 ? (
            <p className="text-gray-500">No history yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                      Item
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                      Donor
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {myCollected.map((item) => (
                    <tr key={item._id}>
                      <td className="px-4 py-3 text-sm">{item.name}</td>
                      <td className="px-4 py-3 text-sm">{item.user?.phone}</td>
                      <td className="px-4 py-3 text-sm font-bold text-green-600">
                        Collected
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NgoDashboard;
