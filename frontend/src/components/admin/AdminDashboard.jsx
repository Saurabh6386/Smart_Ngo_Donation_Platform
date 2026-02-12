import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    fetchUsers();
    fetchDonations();
  }, []);

  const getAuthHeader = () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
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
      const { data } = await axios.get(
        `http://localhost:5000/api/admin/donations?t=${Date.now()}`,
        getAuthHeader(),
      );
      setDonations(data);
    } catch (error) {
      console.error(error);
    }
  };

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

  // Filter Users
  const ngoUsers = users.filter((u) => u.role === "ngo");
  const donorUsers = users.filter((u) => u.role === "donor");

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* TABS */}
      <div className="flex border-b border-gray-200 mb-8">
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
        <button
          onClick={() => setActiveTab("donations")}
          className={`px-6 py-3 font-medium text-lg focus:outline-none transition-colors ${
            activeTab === "donations"
              ? "border-b-4 border-red-500 text-red-500"
              : "text-gray-500 hover:text-red-400"
          }`}
        >
          📦 Manage Donations
        </button>
      </div>

      {/* === USERS TAB === */}
      {activeTab === "users" && (
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
                      <th className="px-5 py-3 font-semibold">Document</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ngoUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
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
                            <p className="text-xs text-gray-400 mt-1">
                              📞 {user.phone}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            {user.verificationDocument ? (
                              <a
                                href={
                                  user.verificationDocument.startsWith("http")
                                    ? user.verificationDocument
                                    : `http://localhost:5000/${user.verificationDocument.replace(/\\/g, "/")}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline font-medium text-sm flex items-center gap-1"
                              >
                                View Cert 👁️
                              </a>
                            ) : (
                              <span className="text-red-400 text-xs italic">
                                Not Uploaded
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {user.isVerified ? (
                              <span className="px-3 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full border border-green-200">
                                ✔ Verified
                              </span>
                            ) : (
                              <span className="px-3 py-1 text-xs font-bold text-orange-700 bg-orange-100 rounded-full border border-orange-200 animate-pulse">
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

          {/* 2. DONOR TABLE */}
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
                            {user.phone}
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

      {/* === DONATIONS TAB === */}
      {activeTab === "donations" && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            All System Donations
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
                      Donor
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
                        {d.user?.name || "Unknown"}
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
                        <button
                          onClick={() => deleteDonation(d._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
