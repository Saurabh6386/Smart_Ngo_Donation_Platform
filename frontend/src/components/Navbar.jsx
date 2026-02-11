import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={navStyle}>
      <div style={containerStyle}>
        {/* LOGO LINK Logic: If logged in, go to Dashboard; else Home */}
        <Link to={user ? "/dashboard" : "/"} style={logoStyle}>
          <span style={{ background: '#ff5252', color: 'white', padding: '5px 10px', marginRight: '5px' }}>NGO</span>
          Smart Donation
        </Link>

        <div>
          {user ? (
            // --- SHOW THIS IF LOGGED IN ---
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{ color: '#ccc' }}>Hello, {user.name}</span>
              <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
              <button onClick={handleLogout} style={logoutBtnStyle}>Logout</button>
            </div>
          ) : (
            // --- SHOW THIS IF LOGGED OUT ---
            <div>
              <Link to="/" style={linkStyle}>Home</Link>
              <Link to="/login" style={linkStyle}>Login</Link>
              <Link to="/register" style={ctaBtnStyle}>Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// --- STYLES ---
const navStyle = { background: '#222', padding: '15px 0', position: 'sticky', top: 0, zIndex: 1000 };
const containerStyle = { width: '90%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const logoStyle = { color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center' };
const linkStyle = { color: 'white', textDecoration: 'none', marginLeft: '20px', fontSize: '1rem' };
const ctaBtnStyle = { marginLeft: '20px', padding: '8px 20px', background: '#ff5252', color: 'white', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold' };
const logoutBtnStyle = { marginLeft: '20px', padding: '8px 20px', background: 'transparent', border: '1px solid #ff5252', color: '#ff5252', cursor: 'pointer', borderRadius: '5px' };

export default Navbar;