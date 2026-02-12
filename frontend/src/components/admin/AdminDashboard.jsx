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
      toast.success("User Verified Successfully!");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to verify user");
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm("Are you sure?")) {
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

  console.log("Users Data:", users);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-6 py-3 font-medium text-lg focus:outline-none transition-colors ${activeTab === "users" ? "border-b-4 border-red-500 text-red-500" : "text-gray-500 hover:text-red-400"}`}
        >
          👥 Manage Users
        </button>
        <button
          onClick={() => setActiveTab("donations")}
          className={`px-6 py-3 font-medium text-lg focus:outline-none transition-colors ${activeTab === "donations" ? "border-b-4 border-red-500 text-red-500" : "text-gray-500 hover:text-red-400"}`}
        >
          📦 Manage Donations
        </button>
      </div>

      {/* Users Table */}
      {activeTab === "users" && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm tracking-wider">
                  <th className="px-5 py-3 border-b-2 border-gray-200">Name</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200">Role</th>

                  {/* 👇 NEW HEADER FOR DOCUMENT */}
                  <th className="px-5 py-3 border-b-2 border-gray-200">
                    Document
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
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-5 py-5 text-sm">
                      <p className="text-gray-900 font-semibold">{user.name}</p>
                      <p className="text-gray-500 text-xs">{user.email}</p>
                    </td>
                    <td className="px-5 py-5 text-sm capitalize">
                      {user.role}
                    </td>

                    {/* 👇 NEW COLUMN: Verification Document Link */}
                    <td className="px-5 py-5 text-sm">
                      {user.role === "ngo" && user.verificationDocument ? (
                        <a
                          href={
                            user.verificationDocument.startsWith("http")
                              ? user.verificationDocument // 👈 Use the original clean URL
                              : `http://localhost:5000/${user.verificationDocument.replace(/\\/g, "/")}`
                          }
                          target="_blank" // 👈 Opens in a new tab (View Mode)
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline font-medium"
                        >
                          View Certificate 👁️
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs italic">
                          N/A
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-5 text-sm">
                      {user.isVerified ? (
                        <span className="px-3 py-1 font-semibold text-green-900 bg-green-200 rounded-full text-xs">
                          Verified
                        </span>
                      ) : (
                        <span className="px-3 py-1 font-semibold text-orange-900 bg-orange-200 rounded-full text-xs">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-5 text-sm flex gap-2">
                      {!user.isVerified && user.role === "ngo" && (
                        <button
                          onClick={() => verifyUser(user._id)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                        >
                          Verify
                        </button>
                      )}
                      {user.role !== "admin" && (
                        <button
                          onClick={() => deleteUser(user._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Donations Table */}
      {activeTab === "donations" && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm tracking-wider">
                  <th className="px-5 py-3 border-b-2 border-gray-200">Item</th>
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
                    <td className="px-5 py-5 text-sm font-medium">{d.name}</td>
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
      )}
    </div>
  );
};

export default AdminDashboard;
