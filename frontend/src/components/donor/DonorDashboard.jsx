import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const DonorDashboard = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Clothing",
    condition: "Used - Good",
    location: "",
  });

  // Separate state for the file
  const [imageFiles, setImageFiles] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [loading, setLoading] = useState(false); // <--- Add this
  const { name, description, category, condition, location } = formData;

  // 1. Fetch My Donations on Load AND Auto-Refresh every 3 seconds
  // 1. Fetch My Donations on Load AND Auto-Refresh every 3 seconds
  // 1. Fetch My Donations on Load AND Auto-Refresh
  useEffect(() => {
    fetchMyDonations(); // Initial fetch

    // Auto-refresh every 3 seconds
    const intervalId = setInterval(() => {
      fetchMyDonations();
    }, 3000);

    return () => clearInterval(intervalId); // Cleanup
  }, []);

  const fetchMyDonations = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      // 👇 TRICK: Add "?t=" + Date.now() to force a fresh request (No Cache)
      const { data } = await axios.get(
        `http://localhost:5000/api/donations/my?t=${Date.now()}`,
        config,
      );

      // 👇 DEBUG: Open your browser console (F12) to see this
      console.log("Fresh Data from Server:", data);

      setMyDonations(data);
    } catch (error) {
      console.error("Error fetching donations:", error);
    }
  };

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle File Selection
  const onFileChange = (e) => {
    setImageFiles(e.target.files); // Save FileList
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const formDataToSend = new FormData();

      // Append normal fields
      formDataToSend.append("name", name);
      formDataToSend.append("description", description);
      formDataToSend.append("category", category);
      formDataToSend.append("condition", condition);
      formDataToSend.append("location", location);

      // Loop and append each file with the SAME key 'images'
      if (imageFiles) {
        for (let i = 0; i < imageFiles.length; i++) {
          formDataToSend.append("images", imageFiles[i]);
        }
      }

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.post(
        "http://localhost:5000/api/donations",
        formDataToSend,
        config,
      );
      toast.success("Donation Added Successfully!");

      // Reset
      setFormData({
        name: "",
        description: "",
        category: "Clothing",
        condition: "Used - Good",
        location: "",
      });
      setImageFiles([]);
      document.getElementById("fileInput").value = "";
      fetchMyDonations();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add donation");
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "40px",
        }}
      >
        <h3>➕ Donate an Item</h3>
        <form onSubmit={onSubmit}>
          {/* ... Name, Description, Category Inputs (Same as before) ... */}
          <div style={{ marginBottom: "10px" }}>
            <label>Item Name</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={onChange}
              required
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Description</label>
            <textarea
              name="description"
              value={description}
              onChange={onChange}
              required
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Category</label>
            <select
              name="category"
              value={category}
              onChange={onChange}
              style={inputStyle}
            >
              <option value="Clothing">Clothing</option>
              <option value="Books">Books</option>
              <option value="Furniture">Furniture</option>
              <option value="Electronics">Electronics</option>
            </select>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={location}
              onChange={onChange}
              required
              style={inputStyle}
            />
          </div>

          {/* 👇 NEW IMAGE INPUT */}
          <div style={{ marginBottom: "20px" }}>
            <label>Upload Image</label>
            <input
              type="file"
              id="fileInput"
              onChange={onFileChange}
              accept="image/*"
              multiple
              style={{ display: "block", marginTop: "5px" }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              background: "#28a745",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Submit Donation
          </button>
        </form>
      </div>

      <h3>📜 My Donation History</h3>
      {myDonations.map((donation) => (
        <div
          key={donation._id}
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            marginBottom: "10px",
            display: "flex",
            gap: "15px",
          }}
        >
          {/* 👇 Display the Image */}
          {donation.image ? (
            <img
              src={donation.image}
              alt={donation.name}
              style={{
                width: "80px",
                height: "80px",
                objectFit: "cover",
                borderRadius: "5px",
              }}
            />
          ) : (
            /* Optional: Show a placeholder if no image exists */
            <div
              style={{
                width: "80px",
                height: "80px",
                background: "#eee",
                borderRadius: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              📷
            </div>
          )}
          <div>
            <h4>{donation.name}</h4>
            <p>{donation.status}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "8px",
  marginTop: "5px",
  display: "block",
  boxSizing: "border-box",
};

export default DonorDashboard;
