import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext'; // Only used for checking if already logged in
import axios from 'axios';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'donor', // Default role
    address: '',
  });

  const { name, email, password, phone, role, address } = formData;

  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // We only need 'user' to redirect if ALREADY logged in

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !phone) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      // 👇 DIRECT API CALL (Bypasses Auto-Login)
      await axios.post('http://localhost:5000/api/auth/register', formData);

      // Success Message
      toast.success('Registration Successful! Please Login.');

      // Redirect to Login Page
      navigate('/login');

    } catch (error) {
      // Handle Errors
      const message = error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : error.message;
      toast.error(message);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={formWrapperStyle}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
          <span style={{ color: '#ff5252' }}>Register</span> Account
        </h1>
        <p style={{ textAlign: 'center', marginBottom: '30px', color: '#666' }}>
          Join us to make a difference
        </p>

        <form onSubmit={onSubmit}>
          <div style={formGroupStyle}>
            <input
              type="text"
              name="name"
              value={name}
              placeholder="Full Name *"
              onChange={onChange}
              style={inputStyle}
            />
          </div>
          <div style={formGroupStyle}>
            <input
              type="email"
              name="email"
              value={email}
              placeholder="Email Address *"
              onChange={onChange}
              style={inputStyle}
            />
          </div>
          <div style={formGroupStyle}>
            <input
              type="password"
              name="password"
              value={password}
              placeholder="Password *"
              onChange={onChange}
              style={inputStyle}
            />
          </div>
          <div style={formGroupStyle}>
            <input
              type="text"
              name="phone"
              value={phone}
              placeholder="Phone Number *"
              onChange={onChange}
              style={inputStyle}
            />
          </div>
          
          <div style={formGroupStyle}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>I am a:</label>
            <select name="role" value={role} onChange={onChange} style={inputStyle}>
              <option value="donor">Donor</option>
              <option value="ngo">NGO</option>
              {/* Admin option removed for security */}
            </select>
          </div>

          <div style={formGroupStyle}>
            <input
              type="text"
              name="address"
              value={address}
              placeholder="Address (Optional)"
              onChange={onChange}
              style={inputStyle}
            />
          </div>

          <button type="submit" style={buttonStyle}>
            Register
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          Already have an account? <Link to="/login" style={{ color: '#ff5252', fontWeight: 'bold' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

// --- STYLES ---
const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f4f4f4' };
const formWrapperStyle = { background: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' };
const formGroupStyle = { marginBottom: '15px' };
const inputStyle = { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '1rem' };
const buttonStyle = { width: '100%', padding: '12px', background: '#ff5252', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' };

export default Register;