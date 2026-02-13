import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Donate = () => {
  // --- STATE FOR FORM ---
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Clothing",
    condition: "Used - Good",
    location: "",
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- TIME SLOT STATES ---
  const [slotInput, setSlotInput] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);

  // State to track the time the donor types in for a specific donation
  const [donorTimeInputs, setDonorTimeInputs] = useState({});

  // --- STATE FOR TABLE ---
  const [myDonations, setMyDonations] = useState([]);

  // Fetch donations on load
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

  const { name, description, category, condition, location } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onFileChange = (e) => {
    setFiles(e.target.files);
  };

  // --- TIME SLOT HANDLERS ---
  const addSlot = (e) => {
    e.preventDefault(); // Stop form submission
    if (slotInput.trim()) {
      setAvailableSlots([...availableSlots, slotInput]);
      setSlotInput(""); // clear input
    }
  };

  const removeSlot = (indexToRemove) => {
    setAvailableSlots(availableSlots.filter((_, idx) => idx !== indexToRemove));
  };

  // --- PROVIDE TIME LATER HANDLER ---
  const handleProvideTime = async (id) => {
    const time = donorTimeInputs[id];
    if (!time || time.trim() === "") {
      return toast.warning("Please type a time before saving!");
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      await axios.put(
        `http://localhost:5000/api/donations/${id}`,
        { pickupTime: time },
        { headers: { Authorization: `Bearer ${userInfo.token}` } },
      );

      toast.success("Pickup time confirmed!");
      fetchMyDonations(); // Refresh the table so it updates to blue text
    } catch (error) {
      toast.error("Failed to update time");
    }
  };

  // --- SUBMIT NEW DONATION ---
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append("name", name);
    formDataToSend.append("description", description);
    formDataToSend.append("category", category);
    formDataToSend.append("condition", condition);
    formDataToSend.append("location", location);

    for (let i = 0; i < files.length; i++) {
      formDataToSend.append("images", files[i]);
    }

    // Append the available slots as a JSON string
    formDataToSend.append("availableSlots", JSON.stringify(availableSlots));

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
      setFiles([]);
      setAvailableSlots([]); // Clear slots
      setSlotInput("");

      // Reset file input visually
      const fileInput = document.getElementById("fileInput");
      if (fileInput) fileInput.value = "";

      fetchMyDonations(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding donation");
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE DONATION LOGIC ---
  const handleDelete = async (id, status) => {
    if (status !== "Pending") {
      return toast.error("You cannot delete an item that is already accepted!");
    }

    if (window.confirm("Are you sure you want to cancel this donation?")) {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };

        await axios.delete(`http://localhost:5000/api/donations/${id}`, config);

        toast.success("Donation Cancelled");
        fetchMyDonations(); // Refresh list immediately
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete");
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Manage Your <span className="text-red-500">Donations</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* LEFT: ADD DONATION FORM */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            ➕ Add New Item
          </h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              value={name}
              onChange={onChange}
              placeholder="Item Name (e.g. Winter Jacket)"
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <select
                name="category"
                value={category}
                onChange={onChange}
                className="p-3 border rounded-lg bg-white focus:outline-none focus:border-red-500"
              >
                <option value="Clothing">Clothing</option>
                <option value="Food">Food</option>
                <option value="Books">Books</option>
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Other">Other</option>
              </select>

              <select
                name="condition"
                value={condition}
                onChange={onChange}
                className="p-3 border rounded-lg bg-white focus:outline-none focus:border-red-500"
              >
                <option value="New">New</option>
                <option value="Used - Good">Used - Good</option>
                <option value="Used - Fair">Used - Fair</option>
              </select>
            </div>

            <input
              type="text"
              name="location"
              value={location}
              onChange={onChange}
              placeholder="Pickup Location"
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              required
            />

            {/* THE TIME SLOT SECTION */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Available Pickup Times
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={slotInput}
                  onChange={(e) => setSlotInput(e.target.value)}
                  placeholder="e.g. 15th Feb, 2 PM - 5 PM"
                  className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={addSlot}
                  className="bg-gray-800 text-white px-4 rounded font-bold hover:bg-gray-700 transition"
                >
                  Add
                </button>
              </div>

              {/* Added Tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                {availableSlots.length === 0 && (
                  <span className="text-xs text-gray-400 italic">
                    No times added yet.
                  </span>
                )}
                {availableSlots.map((slot, idx) => (
                  <span
                    key={idx}
                    className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm"
                  >
                    {slot}
                    <button
                      type="button"
                      onClick={() => removeSlot(idx)}
                      className="text-red-500 hover:text-red-800 font-bold"
                    >
                      ✖
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <textarea
              name="description"
              value={description}
              onChange={onChange}
              placeholder="Description (Size, quantity, details...)"
              className="w-full p-3 border rounded-lg h-24 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              required
            ></textarea>

            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Images (Max 3)
              </label>
              <input
                type="file"
                id="fileInput"
                multiple
                accept="image/*"
                onChange={onFileChange}
                className="w-full text-sm text-gray-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition transform hover:-translate-y-1 shadow-md"
            >
              {loading ? "Uploading..." : "Submit Donation 🎁"}
            </button>
          </form>
        </div>

        {/* RIGHT: MY DONATIONS LIST */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            📜 Your History
          </h2>

          <div className="overflow-y-auto max-h-150">
            {myDonations.length === 0 ? (
              <p className="text-gray-500 text-center py-10">
                You haven't donated anything yet.
              </p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-sm text-gray-500 border-b">
                    <th className="py-2">Item</th>
                    <th className="py-2 text-center">Status</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myDonations.map((donation) => (
                    <tr
                      key={donation._id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-1">
                        <p className="font-bold text-gray-800">
                          {donation.name}
                        </p>
                        <p className="text-xs text-gray-500 mb-1">
                          {new Date(donation.createdAt).toLocaleDateString()}
                        </p>

                        {/* Dynamic Pickup Time UI */}
                        {donation.pickupTime ===
                          "To be coordinated with donor" &&
                        donation.status === "Accepted" ? (
                          <div className="mt-2 flex flex-col sm:flex-row gap-2 items-start">
                            <input
                              type="text"
                              placeholder="Type time (e.g. 4 PM)..."
                              value={donorTimeInputs[donation._id] || ""}
                              onChange={(e) =>
                                setDonorTimeInputs({
                                  ...donorTimeInputs,
                                  [donation._id]: e.target.value,
                                })
                              }
                              className="text-xs p-1.5 border border-orange-300 rounded focus:outline-none focus:border-orange-500 bg-orange-50 w-full sm:w-auto"
                            />
                            <button
                              onClick={() => handleProvideTime(donation._id)}
                              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded transition shadow-sm"
                            >
                              Confirm
                            </button>
                          </div>
                        ) : donation.pickupTime ? (
                          <p className="text-xs text-blue-500 font-bold mt-1">
                            🕒 Pickup: {donation.pickupTime}
                          </p>
                        ) : null}
                      </td>
                      <td className="py-3 px-1 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold
                          ${
                            donation.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : donation.status === "Accepted"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {donation.status}
                        </span>
                      </td>
                      <td className="py-3 px-1 text-right">
                        {donation.status === "Pending" ? (
                          <button
                            onClick={() =>
                              handleDelete(donation._id, donation.status)
                            }
                            className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 text-xs font-bold transition"
                          >
                            Cancel 🗑️
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs italic cursor-not-allowed">
                            Locked 🔒
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;
