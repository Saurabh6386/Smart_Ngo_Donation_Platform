import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ImageSlider from "../common/ImageSlider";

const NgoDashboard = () => {
  const [donations, setDonations] = useState([]); // Pending items
  const [myClaims, setMyClaims] = useState([]); // Accepted items (To be collected)
  const [myCollected, setMyCollected] = useState([]); // Collected items (History)
  const [showHistory, setShowHistory] = useState(false); // Toggle for history section
  const [currentUser, setCurrentUser] = useState(null);
  const [isVerified, setIsVerified] = useState(false); // New State for verification

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        setCurrentUser(userInfo);
        setIsVerified(userInfo?.isVerified || false); // Get verification status

        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await axios.get(
          "http://localhost:5000/api/donations",
          config
        );

        // 1. Pending (Available for everyone)
        setDonations(data.filter((d) => d.status === "Pending"));

        // 2. Accepted (My active pickups)
        setMyClaims(
          data.filter(
            (d) => d.status === "Accepted" && d.collectedBy === userInfo._id
          )
        );

        // 3. Collected (My history)
        setMyCollected(
          data.filter(
            (d) => d.status === "Collected" && d.collectedBy === userInfo._id
          )
        );
      } catch (error) {
        toast.error("Error fetching donations");
      }
    };

    fetchData();
  }, []);

  // Function to Accept a Donation
  const updateStatus = async (id, newStatus) => {
    // 🛑 Block Unverified NGOs from accepting
    if (newStatus === "Accepted" && !isVerified) {
      return toast.error("Account pending verification! You cannot accept items yet.");
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      };

      await axios.put(
        `http://localhost:5000/api/donations/${id}`,
        { status: newStatus },
        config
      );

      toast.success(`Donation marked as ${newStatus}!`);

      // REFRESH STATE LOGIC (Optimistic Update)
      if (newStatus === "Accepted") {
        const item = donations.find((d) => d._id === id);
        setDonations(donations.filter((d) => d._id !== id)); // Remove from Pending
        setMyClaims([
          ...myClaims,
          { ...item, status: "Accepted", collectedBy: currentUser._id },
        ]); // Add to Accepted
      } else if (newStatus === "Collected") {
        const item = myClaims.find((d) => d._id === id);
        setMyClaims(myClaims.filter((d) => d._id !== id)); // Remove from Accepted
        setMyCollected([...myCollected, { ...item, status: "Collected" }]); // Add to History
      }
    } catch (error) {
      // Show the specific error from backend if available
      const message = error.response?.data?.message || "Failed to update status";
      toast.error(message);
    }
  };

  const openGoogleMaps = (location) => {
    if (!location) return toast.error("Location not provided");
    // 👇 Fixed URL format
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(url, "_blank");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* 👇 VERIFICATION STATUS BANNER 👇 */}
      {!isVerified ? (
        <div style={{ 
          backgroundColor: '#fff3cd', 
          color: '#856404', 
          padding: '15px', 
          marginBottom: '20px', 
          border: '1px solid #ffeeba', 
          borderRadius: '5px',
          textAlign: 'center'
        }}>
          <h3>⚠️ Account Verification Pending</h3>
          <p>You cannot accept donations until an Admin verifies your NGO account.</p>
        </div>
      ) : (
        <div style={{ 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          padding: '10px', 
          marginBottom: '20px', 
          border: '1px solid #c3e6cb', 
          borderRadius: '5px',
          textAlign: 'center'
        }}>
          ✅ <strong>Verified NGO Account</strong> - You can accept donations.
        </div>
      )}
      {/* 👆 END BANNER 👆 */}

      {/* --- SECTION 1: MY ACTIVE PICKUPS (ACCEPTED) --- */}
      <div
        style={{
          marginBottom: "40px",
          padding: "20px",
          background: "#e3f2fd",
          borderRadius: "10px",
          border: "1px solid #90caf9",
        }}
      >
        <h3 style={{ color: "#0d47a1", marginTop: 0 }}>
          ✅ Ready for Pickup (Accepted)
        </h3>
        {myClaims.length === 0 ? (
          <p>You have no pending pickups.</p>
        ) : (
          <div style={gridStyle}>
            {myClaims.map((donation) => (
              <div key={donation._id} style={cardStyle}>
                
                <ImageSlider
                  images={
                    donation.images && donation.images.length > 0
                      ? donation.images
                      : [donation.image]
                  }
                />

                <h4>{donation.name}</h4>
                <p>
                  <strong>📍 Location:</strong> {donation.location}
                </p>
                <p>
                  <strong>📞 Donor:</strong> {donation.user?.phone || "N/A"}
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    marginTop: "10px",
                  }}
                >
                  <button
                    onClick={() => openGoogleMaps(donation.location)}
                    style={{
                      ...buttonStyle,
                      background: "#ff9800",
                      color: "black",
                    }}
                  >
                    📍 Navigate
                  </button>
                  <button
                    onClick={() => updateStatus(donation._id, "Collected")}
                    style={{ ...buttonStyle, background: "#28a745" }}
                  >
                    📦 Mark as Collected
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- SECTION 2: NEW AVAILABLE DONATIONS --- */}
      <h3 style={{ borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
        📢 New Available Donations
      </h3>
      {donations.length === 0 ? (
        <p>No new donations available.</p>
      ) : (
        <div style={gridStyle}>
          {donations.map((donation) => (
            <div key={donation._id} style={cardStyle}>
              <ImageSlider
                  images={
                    donation.images && donation.images.length > 0
                      ? donation.images
                      : [donation.image]
                  }
                />
              <h4>{donation.name}</h4>
              <p>
                <strong>Category:</strong> {donation.category}
              </p>
              <p>
                <strong>Location:</strong> {donation.location}
              </p>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  onClick={() => updateStatus(donation._id, "Accepted")}
                  style={{ ...buttonStyle, flex: 1, opacity: isVerified ? 1 : 0.6, cursor: isVerified ? 'pointer' : 'not-allowed' }}
                >
                  Accept
                </button>
                <button
                  onClick={() => openGoogleMaps(donation.location)}
                  style={{
                    ...buttonStyle,
                    background: "#eee",
                    color: "#333",
                    flex: 1,
                  }}
                >
                  Map
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- SECTION 3: COLLECTED HISTORY (TOGGLE) --- */}
      <div style={{ marginTop: "50px", textAlign: "center" }}>
        <button
          onClick={() => setShowHistory(!showHistory)}
          style={{
            background: "none",
            border: "none",
            color: "#666",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {showHistory
            ? "Hide Collected History ▲"
            : "Show Collected History ▼"}
        </button>
      </div>

      {showHistory && (
        <div
          style={{
            marginTop: "20px",
            background: "#f9f9f9",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h3>🎉 Collected Items History</h3>
          {myCollected.length === 0 ? (
            <p>No history yet.</p>
          ) : (
            <table
              style={{
                width: "100%",
                textAlign: "left",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid #ddd" }}>
                  <th style={{ padding: "10px" }}>Item</th>
                  <th style={{ padding: "10px" }}>Donor Contact</th>
                  <th style={{ padding: "10px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {myCollected.map((item) => (
                  <tr key={item._id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "10px" }}>{item.name}</td>
                    <td style={{ padding: "10px" }}>
                      {item.user?.phone || "N/A"}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        color: "green",
                        fontWeight: "bold",
                      }}
                    >
                      Collected
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

// Styles
const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: "20px",
  marginTop: "10px",
};

const cardStyle = {
  border: "1px solid #ddd",
  padding: "15px",
  borderRadius: "8px",
  background: "white",
  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
};

const buttonStyle = {
  padding: "10px",
  background: "#007bff",
  color: "white",
  border: "none",
  cursor: "pointer",
  borderRadius: "5px",
  fontWeight: "bold",
};

export default NgoDashboard;