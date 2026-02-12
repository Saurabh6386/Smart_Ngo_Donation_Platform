import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Register = () => {
  // Split state: Text fields & File
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "donor",
    address: "",
  });
  const [file, setFile] = useState(null); // <--- For the document
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { name, email, password, phone, role, address } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const onFileChange = (e) => setFile(e.target.files[0]); // <--- Capture file

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Validation
    if (!name || !email || !password || !phone) {
      setLoading(false);
      return toast.error("Please fill all required fields");
    }

    // Validate NGO Document
    if (role === "ngo" && !file) {
      setLoading(false);
      return toast.error("NGOs must upload a verification certificate!");
    }

    // 2. Prepare FormData (Required for file uploads)
    const data = new FormData();
    data.append("name", name);
    data.append("email", email);
    data.append("password", password);
    data.append("phone", phone);
    data.append("role", role);
    data.append("address", address);
    if (file) {
      data.append("verificationDoc", file); // <--- Key must match backend
    }

    try {
      // 3. Send to Backend
      // NOTE: Ensure your backend 'registerUser' route uses 'multer' middleware!
      await axios.post("http://localhost:5000/api/auth/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Registration Successful! Please Login.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Register</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* ... Name, Email, Password, Phone inputs (Keep same as before) ... */}

          <input
            type="text"
            name="name"
            value={name}
            onChange={onChange}
            placeholder="Full Name"
            className="w-full p-2 border rounded"
          />
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            placeholder="Email"
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            placeholder="Password"
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="phone"
            value={phone}
            onChange={onChange}
            placeholder="Phone"
            className="w-full p-2 border rounded"
          />

          {/* Role Selection */}
          <select
            name="role"
            value={role}
            onChange={onChange}
            className="w-full p-2 border rounded bg-white"
          >
            <option value="donor">Donor</option>
            <option value="ngo">NGO</option>
          </select>

          {/* 👇 NGO DOCUMENT UPLOAD (Only shows if NGO is selected) */}
          {role === "ngo" && (
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <label className="block text-sm font-medium text-blue-800 mb-1">
                Upload Registration Certificate (PDF/Image)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={onFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
              />
            </div>
          )}

          <input
            type="text"
            name="address"
            value={address}
            onChange={onChange}
            placeholder="Address"
            className="w-full p-2 border rounded"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
