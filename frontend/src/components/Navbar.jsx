import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

// 👇 Reliable Default Image
const DEFAULT_PIC = "https://ui-avatars.com/api/?name=User&background=random";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={navStyle}>
      <div style={containerStyle}>
        <Link to="/" style={logoStyle}>
          <span
            style={{
              background: "#ff5252",
              color: "white",
              padding: "5px 10px",
              marginRight: "5px",
            }}
          >
            NGO
          </span>
          Smart Donation
        </Link>

        <div>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              {/* 👇 THIS IS THE FIX: Wrapped image and name in a Link! 👇 */}
              <Link to="/profile" style={profileLinkStyle} title="Edit Profile">
                <img
                  src={user.profilePic || DEFAULT_PIC}
                  alt="Profile"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid white",
                    backgroundColor: "#eee",
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_PIC;
                  }}
                />
                <span style={{ color: "#ccc", fontWeight: "bold" }}>
                  Hello, {user.name}
                </span>
              </Link>
              {/* 👆 END OF FIX 👆 */}

              <Link to="/" style={linkStyle}>
                Home
              </Link>

              <Link to="/dashboard" style={linkStyle}>
                Dashboard
              </Link>
              <button onClick={handleLogout} style={logoutBtnStyle}>
                Logout
              </button>
            </div>
          ) : (
            <div>
              <Link to="/" style={linkStyle}>
                Home
              </Link>
              <Link to="/login" style={linkStyle}>
                Login
              </Link>
              <Link to="/register" style={ctaBtnStyle}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// --- STYLES ---
const navStyle = {
  background: "#222",
  padding: "15px 0",
  position: "sticky",
  top: 0,
  zIndex: 1000,
};
const containerStyle = {
  width: "90%",
  margin: "0 auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};
const logoStyle = {
  color: "white",
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: "1.2rem",
  display: "flex",
  alignItems: "center",
};

// 👇 ADDED THIS NEW STYLE FOR THE CLICKABLE PROFILE 👇
const profileLinkStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  textDecoration: "none",
  cursor: "pointer",
  padding: "5px",
  borderRadius: "5px",
};

const linkStyle = {
  color: "white",
  textDecoration: "none",
  marginLeft: "20px",
  fontSize: "1rem",
};
const ctaBtnStyle = {
  marginLeft: "20px",
  padding: "8px 20px",
  background: "#ff5252",
  color: "white",
  textDecoration: "none",
  borderRadius: "5px",
  fontWeight: "bold",
};
const logoutBtnStyle = {
  marginLeft: "20px",
  padding: "8px 20px",
  background: "transparent",
  border: "1px solid #ff5252",
  color: "#ff5252",
  cursor: "pointer",
  borderRadius: "5px",
};

export default Navbar;
