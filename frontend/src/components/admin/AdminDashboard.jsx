import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [activeTab, setActiveTab] = useState("users"); // 'users' or 'donations'

  // Fetch Data on Load
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
        "http://localhost:5000/api/admin/users",
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
        "http://localhost:5000/api/admin/donations",
        getAuthHeader(),
      );
      setDonations(data);
    } catch (error) {
      console.error(error);
    }
  };

  // 👇 NEW: Verify User Function
  const verifyUser = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/users/${id}/verify`,
        {},
        getAuthHeader(),
      );
      toast.success("User Verified Successfully!");

      // Update local state instantly (Turn Orange to Green without refresh)
      setUsers(
        users.map((user) =>
          user._id === id ? { ...user, isVerified: true } : user,
        ),
      );
    } catch (error) {
      toast.error("Failed to verify user");
    }
  };

  // Delete User
  const deleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(
          `http://localhost:5000/api/admin/users/${id}`,
          getAuthHeader(),
        );
        toast.success("User Deleted");
        setUsers(users.filter((user) => user._id !== id));
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  // Delete Donation
  const deleteDonation = async (id) => {
    if (window.confirm("Are you sure you want to delete this donation?")) {
      try {
        await axios.delete(
          `http://localhost:5000/api/admin/donations/${id}`,
          getAuthHeader(),
        );
        toast.success("Donation Deleted");
        setDonations(donations.filter((d) => d._id !== id));
      } catch (error) {
        toast.error("Failed to delete donation");
      }
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      {/* TABS */}
      <div
        style={{
          display: "flex",
          marginBottom: "20px",
          borderBottom: "2px solid #ddd",
        }}
      >
        <button
          style={activeTab === "users" ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab("users")}
        >
          👥 Manage Users
        </button>
        <button
          style={activeTab === "donations" ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab("donations")}
        >
          📦 Manage Donations
        </button>
      </div>

      {/* USERS TABLE */}
      {activeTab === "users" && (
        <div>
          <h3>All Registered Users ({users.length})</h3>
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: "#f4f4f4" }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Status</th> {/* 👈 New Column */}
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={tdStyle}>
                    {user.name}
                    <br />
                    <span style={{ fontSize: "0.8em", color: "#888" }}>
                      {user.email}
                    </span>
                  </td>
                  <td style={tdStyle}>{user.role}</td>

                  {/* 👇 STATUS DISPLAY */}
                  <td style={tdStyle}>
                    {user.isVerified ? (
                      <span style={{ color: "green", fontWeight: "bold" }}>
                        ✔ Verified
                      </span>
                    ) : (
                      <span style={{ color: "orange", fontWeight: "bold" }}>
                        ⏳ Pending
                      </span>
                    )}
                  </td>

                  {/* 👇 ACTION BUTTONS */}
                  <td style={tdStyle}>
                    {/* Show VERIFY button only for Unverified NGOs */}
                    {!user.isVerified && user.role === "ngo" && (
                      <button
                        onClick={() => verifyUser(user._id)}
                        style={{
                          ...btnStyle,
                          background: "#28a745",
                          marginRight: "10px",
                        }}
                      >
                        Verify
                      </button>
                    )}

                    {user.role !== "admin" && (
                      <button
                        onClick={() => deleteUser(user._id)}
                        style={{ ...btnStyle, background: "#dc3545" }}
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
      )}

      {/* DONATIONS TABLE */}
      {activeTab === "donations" && (
        <div>
          <h3>All System Donations ({donations.length})</h3>
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: "#f4f4f4" }}>
                <th style={thStyle}>Item</th>
                <th style={thStyle}>Donor</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={tdStyle}>{d.name}</td>
                  <td style={tdStyle}>{d.user?.name || "Unknown"}</td>
                  <td style={tdStyle}>{d.status}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => deleteDonation(d._id)}
                      style={deleteBtnStyle}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// --- STYLES ---
const tabStyle = {
  padding: "10px 20px",
  cursor: "pointer",
  background: "none",
  border: "none",
  fontSize: "1.1rem",
  color: "#666",
};
const activeTabStyle = {
  ...tabStyle,
  borderBottom: "3px solid #ff5252",
  fontWeight: "bold",
  color: "#ff5252",
};
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "10px",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
};
const thStyle = {
  padding: "12px",
  textAlign: "left",
  borderBottom: "2px solid #ddd",
};
const tdStyle = { padding: "12px" };
const btnStyle = {
  color: "white",
  border: "none",
  padding: "5px 10px",
  borderRadius: "5px",
  cursor: "pointer",
};
const deleteBtnStyle = {
  background: "#dc3545",
  color: "white",
  border: "none",
  padding: "5px 10px",
  borderRadius: "5px",
  cursor: "pointer",
};

export default AdminDashboard;
