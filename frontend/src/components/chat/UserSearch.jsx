import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../../context/AuthContext";

export default function UserSearch({ onSelectUser }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const token = userInfo?.token;

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // Fetch all users and filter (or create a dedicated search endpoint)
      const { data } = await axios.get(
        "http://localhost:5000/api/auth/users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Filter results excluding current user
      const filtered = data.users.filter(
        (u) =>
          u._id !== user._id &&
          (u.name.toLowerCase().includes(query.toLowerCase()) ||
            u.email.toLowerCase().includes(query.toLowerCase()))
      );

      setSearchResults(filtered);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border-b border-gray-300 bg-white">
      <input
        type="text"
        placeholder="Search users to message..."
        value={searchQuery}
        onChange={handleSearch}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {searchResults.length > 0 && (
        <div className="mt-2 border border-gray-300 rounded-lg bg-white max-h-48 overflow-y-auto">
          {searchResults.map((u) => (
            <div
              key={u._id}
              onClick={() => {
                onSelectUser(u);
                setSearchQuery("");
                setSearchResults([]);
              }}
              className="p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 flex items-center gap-3"
            >
              <img
                src={u.profilePic}
                alt={u.name}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="font-semibold text-gray-800">{u.name}</p>
                <p className="text-xs text-gray-500">{u.role}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <p className="mt-2 text-sm text-gray-500">Searching...</p>
      )}
    </div>
  );
}
