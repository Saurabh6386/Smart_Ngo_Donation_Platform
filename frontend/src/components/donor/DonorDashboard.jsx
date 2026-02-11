import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const DonorDashboard = () => {
  const [myDonations, setMyDonations] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false); // <--- 1. NEW LOADING STATE

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Clothing",
    condition: "Used - Good",
    location: "",
  });

  const { name, description, category, condition, location } = formData;

  // Fetch My Donations
  useEffect(() => {
    fetchMyDonations();
  }, []);

  const fetchMyDonations = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(
        "http://localhost:5000/api/donations/my",
        config,
      );
      setMyDonations(data);
    } catch (error) {
      console.error(error);
    }
  };

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onFileChange = (e) => {
    setImageFiles(e.target.files);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // <--- 2. START LOADING

    if (!name || !description || !location) {
      toast.error("Please fill all fields");
      setLoading(false); // Stop loading if error
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", name);
    formDataToSend.append("description", description);
    formDataToSend.append("category", category);
    formDataToSend.append("condition", condition);
    formDataToSend.append("location", location);

    for (let i = 0; i < imageFiles.length; i++) {
      formDataToSend.append("images", imageFiles[i]);
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      await axios.post(
        "http://localhost:5000/api/donations",
        formDataToSend,
        config,
      );

      toast.success("Donation Added Successfully!");

      // Reset Form
      setFormData({
        name: "",
        description: "",
        category: "Clothing",
        condition: "Used - Good",
        location: "",
      });
      setImageFiles([]);
      document.getElementById("fileInput").value = ""; // Clear file input manually

      fetchMyDonations(); // Refresh list
    } catch (error) {
      toast.error("Failed to add donation");
      console.error(error);
    } finally {
      setLoading(false); // <--- 3. STOP LOADING (Always runs)
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      {/* FORM SECTION */}
      <div
        style={{
          background: "#f9f9f9",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "30px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            borderBottom: "2px solid #ddd",
            paddingBottom: "10px",
            marginBottom: "20px",
          }}
        >
          ➕ Add New Donation
        </h2>

        <form onSubmit={onSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            {/* Left Column */}
            <div>
              <label style={labelStyle}>Item Name</label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={onChange}
                style={inputStyle}
                placeholder="e.g. Winter Jacket"
              />

              <label style={labelStyle}>Category</label>
              <select
                name="category"
                value={category}
                onChange={onChange}
                style={inputStyle}
              >
                <option value="Clothing">Clothing</option>
                <option value="Food">Food</option>
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Books">Books</option>
                <option value="Toys">Toys</option>
                <option value="Other">Other</option>
              </select>

              <label style={labelStyle}>Condition</label>
              <select
                name="condition"
                value={condition}
                onChange={onChange}
                style={inputStyle}
              >
                <option value="New">New</option>
                <option value="Used - Like New">Used - Like New</option>
                <option value="Used - Good">Used - Good</option>
                <option value="Used - Fair">Used - Fair</option>
              </select>
            </div>

            {/* Right Column */}
            <div>
              <label style={labelStyle}>Pickup Location</label>
              <input
                type="text"
                name="location"
                value={location}
                onChange={onChange}
                style={inputStyle}
                placeholder="Full Address"
              />

              <label style={labelStyle}>Images (Max 5)</label>
              <input
                type="file"
                id="fileInput"
                multiple
                onChange={onFileChange}
                style={{ ...inputStyle, padding: "9px" }}
              />

              <label style={labelStyle}>Description</label>
              <textarea
                name="description"
                value={description}
                onChange={onChange}
                style={{ ...inputStyle, height: "80px" }}
                placeholder="Details about the item..."
              />
            </div>
          </div>

          {/* SUBMIT BUTTON WITH LOADING STATE */}
          <button
            type="submit"
            disabled={loading} // <--- Disable when loading
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "12px",
              background: loading ? "#6c757d" : "#28a745", // Grey if loading, Green if ready
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontSize: "1.1rem",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "0.3s",
            }}
          >
            {loading ? "⏳ Adding Donation..." : "Submit Donation"}
          </button>
        </form>
      </div>

      {/* HISTORY LIST */}
      <h3>📜 My Donation History</h3>
      {myDonations.length === 0 ? (
        <p>No donations yet.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px",
          }}
        >
          <thead>
            <tr style={{ background: "#eee", textAlign: "left" }}>
              <th style={{ padding: "10px" }}>Item</th>
              <th style={{ padding: "10px" }}>Status</th>
              <th style={{ padding: "10px" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {myDonations.map((d) => (
              <tr key={d._id} style={{ borderBottom: "1px solid #ddd" }}>
                <td
                  style={{
                    padding: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <img
                    src={d.image}
                    alt={d.name}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "5px",
                      objectFit: "cover",
                    }}
                  />
                  {d.name}
                </td>
                <td style={{ padding: "10px" }}>
                  <span
                    style={{
                      padding: "5px 10px",
                      borderRadius: "15px",
                      fontSize: "0.9rem",
                      background:
                        d.status === "Pending"
                          ? "#fff3cd"
                          : d.status === "Accepted"
                            ? "#d1ecf1"
                            : "#d4edda",
                      color:
                        d.status === "Pending"
                          ? "#856404"
                          : d.status === "Accepted"
                            ? "#0c5460"
                            : "#155724",
                    }}
                  >
                    {d.status}
                  </span>
                </td>
                <td style={{ padding: "10px" }}>
                  {new Date(d.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Styles
const labelStyle = {
  display: "block",
  marginBottom: "5px",
  fontWeight: "bold",
  color: "#555",
  marginTop: "10px",
};
const inputStyle = {
  width: "100%",
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "5px",
};

export default DonorDashboard;
