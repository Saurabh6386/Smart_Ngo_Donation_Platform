import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Full user data from database
  const [userData, setUserData] = useState(null);

  // Form data for editing
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // 👇 FETCH FRESH DATA FROM DATABASE ON LOAD
  const fetchProfile = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      const { data } = await axios.get(
        "http://localhost:5000/api/auth/profile",
        config,
      );

      setUserData(data);
      setFormData({
        name: data.name || "",
        phone: data.phone || "",
        address: data.address || "",
      });
      setImagePreview(
        data.profilePic ||
          `https://ui-avatars.com/api/?name=${data.name?.replace(" ", "+")}&background=ff5252&color=fff&size=128`,
      );
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load profile data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const dataToSend = new FormData();
      dataToSend.append("name", formData.name);
      dataToSend.append("phone", formData.phone);
      dataToSend.append("address", formData.address);
      if (file) dataToSend.append("profilePic", file);

      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      const { data } = await axios.put(
        "http://localhost:5000/api/auth/profile",
        dataToSend,
        config,
      );

      // Update local storage with new info (like profile pic) to keep Navbar updated
      localStorage.setItem(
        "userInfo",
        JSON.stringify({ ...userInfo, ...data }),
      );

      toast.success("Profile Updated Successfully!");
      setIsEditing(false);
      fetchProfile(); // Re-fetch to update the view mode
      window.location.reload(); // Refresh to update Navbar
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-20 text-gray-500">Loading profile...</div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Your <span className="text-red-500">Profile</span>
      </h1>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        {/* --- DYNAMIC VIEW / EDIT MODES --- */}
        {!isEditing ? (
          /* 👇 1. READ-ONLY MODE (Matches your screenshot!) 👇 */
          <div className="animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start pb-6 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-6">
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-24 h-24 rounded-full shadow-sm object-cover border-2 border-gray-200"
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    {userData.name}
                    <span
                      className={`text-xs px-3 py-1 rounded-full text-white font-bold tracking-wide ${userData.role === "ngo" ? "bg-blue-500" : "bg-green-500"}`}
                    >
                      {userData.role.toUpperCase()}
                    </span>
                  </h2>
                  <p className="text-gray-500 mt-1">{userData.email}</p>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 sm:mt-0 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-2 px-5 rounded-lg border border-gray-200 shadow-sm transition flex items-center gap-2"
              >
                ✏️ Edit Profile
              </button>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500 font-semibold mb-1">
                  Phone Number
                </p>
                <p className="text-gray-800 font-bold text-lg">
                  {userData.phone || (
                    <span className="text-gray-400 italic font-normal">
                      Not provided
                    </span>
                  )}
                </p>
              </div>
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500 font-semibold mb-1">
                  Address
                </p>
                <p className="text-gray-800 font-bold text-lg">
                  {userData.address || (
                    <span className="text-gray-400 italic font-normal">
                      Not provided
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* 👇 NGO SPECIFIC DETAILS (Only shows if role is NGO) 👇 */}
            {userData.role === "ngo" && (
              <div className="mt-6 bg-blue-50 p-5 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-500 font-semibold mb-3">
                  NGO Verification Status
                </p>
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                  <div className="flex items-center gap-3">
                    {userData.isVerified ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded border border-green-200">
                        ✔ Verified Account
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-bold rounded border border-orange-200">
                        ⏳ Verification Pending
                      </span>
                    )}
                  </div>
                  {userData.verificationDocument && (
                    <a
                      href={
                        userData.verificationDocument.startsWith("http")
                          ? userData.verificationDocument
                          : `http://localhost:5000/${userData.verificationDocument.replace(/\\/g, "/")}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-bold text-sm underline"
                    >
                      View Uploaded Document 📄
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 👇 2. EDIT FORM MODE 👇 */
          <form onSubmit={onSubmit} className="animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-6 border-b border-gray-100">
              <div className="relative group">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-24 h-24 rounded-full shadow-md object-cover border-4 border-white"
                />
                <input
                  type="file"
                  id="profileUpload"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileChange}
                />
                <label
                  htmlFor="profileUpload"
                  className="absolute bottom-0 right-0 bg-red-500 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-red-600 transition"
                  title="Change Picture"
                >
                  📷
                </label>
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-800">
                  Edit Profile
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Update your contact details below.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email Address (Read-Only)
                </label>
                <input
                  type="email"
                  value={userData.email}
                  disabled
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={onChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Full Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={onChange}
                  className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:outline-none focus:border-red-500"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-1/3 bg-gray-100 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-2/3 bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition shadow-md"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
