import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import DonationMap from "../DonationMap";

const AdminDashboard = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const role = userInfo?.role;

  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);

  const [activeTab, setActiveTab] = useState(
    role === "admin" ? "users" : "donations",
  );

  useEffect(() => {
    if (role === "admin") {
      fetchUsers();
    }
    fetchDonations();
  }, [role]);

  const getAuthHeader = () => {
    return { headers: { Authorization: `Bearer ${userInfo.token}` } };
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/admin/users?t=${Date.now()}`,
        getAuthHeader(),
      );
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDonations = async () => {
    try {
      const url =
        role === "admin"
          ? `http://localhost:5000/api/admin/donations?t=${Date.now()}`
          : `http://localhost:5000/api/donations?t=${Date.now()}`;

      const { data } = await axios.get(url, getAuthHeader());
      setDonations(data);
    } catch (error) {
      console.error(error);
    }
  };

  // --- ADMIN ACTIONS ---
  const verifyUser = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/users/${id}/verify`,
        {},
        getAuthHeader(),
      );
      toast.success("NGO Verified Successfully!");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to verify NGO");
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm("Are you sure? This cannot be undone.")) {
      try {
        await axios.delete(
          `http://localhost:5000/api/admin/users/${id}`,
          getAuthHeader(),
        );
        toast.success("User Deleted");
        fetchUsers();
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  const deleteDonation = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await axios.delete(
          `http://localhost:5000/api/admin/donations/${id}`,
          getAuthHeader(),
        );
        toast.success("Donation Deleted");
        fetchDonations();
      } catch (error) {
        toast.error("Failed to delete donation");
      }
    }
  };

  // --- NGO ACTIONS ---
  const updateDonationStatus = async (id, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/donations/${id}`,
        { status: newStatus },
        getAuthHeader(),
      );
      toast.success(`Donation marked as ${newStatus}!`);
      fetchDonations();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  // Filter Users
  const ngoUsers = users.filter((u) => u.role === "ngo");
  const donorUsers = users.filter((u) => u.role === "donor");

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* TABS */}
      <div className="flex border-b border-gray-200 mb-8">
        {role === "admin" && (
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 font-medium text-lg focus:outline-none transition-colors ${
              activeTab === "users"
                ? "border-b-4 border-red-500 text-red-500"
                : "text-gray-500 hover:text-red-400"
            }`}
          >
            👥 Manage Users
          </button>
        )}
        <button
          onClick={() => setActiveTab("donations")}
          className={`px-6 py-3 font-medium text-lg focus:outline-none transition-colors ${
            activeTab === "donations"
              ? "border-b-4 border-red-500 text-red-500"
              : "text-gray-500 hover:text-red-400"
          }`}
        >
          {role === "admin" ? "📦 Manage Donations" : "📍 Available Pickups"}
        </button>
      </div>

      {/* === USERS TAB (ADMIN ONLY) === */}
      {role === "admin" && activeTab === "users" && (
        <div className="space-y-10">
          {/* 1. NGO TABLE */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              🏢 Registered NGOs{" "}
              <span className="text-sm font-normal text-gray-500">
                ({ngoUsers.length})
              </span>
            </h3>
            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr className="bg-blue-50 text-left text-blue-800 uppercase text-sm tracking-wider">
                      <th className="px-5 py-3 font-semibold">Name / Email</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ngoUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan="3"
                          className="px-5 py-5 text-center text-gray-500"
                        >
                          No NGOs found.
                        </td>
                      </tr>
                    ) : (
                      ngoUsers.map((user) => (
                        <tr
                          key={user._id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-5 py-4">
                            <p className="font-bold text-gray-900">
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            {user.isVerified ? (
                              <span className="px-3 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full">
                                ✔ Verified
                              </span>
                            ) : (
                              <span className="px-3 py-1 text-xs font-bold text-orange-700 bg-orange-100 rounded-full">
                                ⏳ Pending
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 flex gap-2">
                            {!user.isVerified && (
                              <button
                                onClick={() => verifyUser(user._id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition shadow-sm"
                              >
                                Verify
                              </button>
                            )}
                            <button
                              onClick={() => deleteUser(user._id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition shadow-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 2. DONOR TABLE (Brought back!) */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              ❤️ Registered Donors{" "}
              <span className="text-sm font-normal text-gray-500">
                ({donorUsers.length})
              </span>
            </h3>
            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr className="bg-gray-50 text-left text-gray-600 uppercase text-sm tracking-wider">
                      <th className="px-5 py-3 font-semibold">Name / Email</th>
                      <th className="px-5 py-3 font-semibold">Phone</th>
                      <th className="px-5 py-3 font-semibold">Address</th>
                      <th className="px-5 py-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donorUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-5 py-5 text-center text-gray-500"
                        >
                          No Donors found.
                        </td>
                      </tr>
                    ) : (
                      donorUsers.map((user) => (
                        <tr
                          key={user._id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-5 py-4">
                            <p className="font-bold text-gray-900">
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">
                            {user.phone || "N/A"}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">
                            {user.address || "N/A"}
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => deleteUser(user._id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition shadow-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === DONATIONS TAB (FOR BOTH ADMIN AND NGO) === */}
      {activeTab === "donations" && (
        <div className="space-y-8">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              📍 Donation Map
            </h2>
            <DonationMap donations={donations} />
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {role === "admin" ? "All System Donations" : "Items Near You"}
            </h3>
            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr className="bg-gray-50 text-left text-gray-600 uppercase text-sm tracking-wider">
                      <th className="px-5 py-3 border-b-2 border-gray-200">
                        Item
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200">
                        Donor Location
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200">
                        Status
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((d) => (
                      <tr
                        key={d._id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-5 py-5 text-sm font-medium">
                          {d.name}
                        </td>
                        <td className="px-5 py-5 text-sm text-gray-500">
                          {d.location || "Unknown"}
                        </td>
                        <td className="px-5 py-5 text-sm">
                          <span
                            className={`px-3 py-1 font-semibold rounded-full text-xs ${
                              d.status === "Pending"
                                ? "text-orange-900 bg-orange-200"
                                : d.status === "Accepted"
                                  ? "text-blue-900 bg-blue-200"
                                  : "text-green-900 bg-green-200"
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td className="px-5 py-5 text-sm">
                          {role === "admin" && (
                            <button
                              onClick={() => deleteDonation(d._id)}
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                            >
                              Delete
                            </button>
                          )}
                          {role === "ngo" && d.status === "Pending" && (
                            <button
                              onClick={() =>
                                updateDonationStatus(d._id, "Accepted")
                              }
                              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition font-bold shadow-sm"
                            >
                              Accept Pickup
                            </button>
                          )}
                          {role === "ngo" && d.status === "Accepted" && (
                            <button
                              onClick={() =>
                                updateDonationStatus(d._id, "Collected")
                              }
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition font-bold shadow-sm"
                            >
                              Mark Collected ✔️
                            </button>
                          )}
                          {role === "ngo" && d.status === "Collected" && (
                            <span className="text-gray-400 italic">
                              Completed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
