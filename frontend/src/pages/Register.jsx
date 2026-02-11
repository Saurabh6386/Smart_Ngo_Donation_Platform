import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Register = () => {
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'donor', // Default role
    address: '',
  });

  const { name, email, password, phone, role, address } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    register(formData); // Call register function
  };

  return (
    <div className="container" style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
      <h2 style={{ textAlign: 'center' }}>Register</h2>
      <form onSubmit={onSubmit}>
        <input type="text" name="name" value={name} onChange={onChange} placeholder="Full Name" required style={inputStyle} />
        <input type="email" name="email" value={email} onChange={onChange} placeholder="Email" required style={inputStyle} />
        <input type="password" name="password" value={password} onChange={onChange} placeholder="Password" required style={inputStyle} />
        <input type="text" name="phone" value={phone} onChange={onChange} placeholder="Phone" required style={inputStyle} />
        
        <select name="role" value={role} onChange={onChange} style={inputStyle}>
          <option value="donor">Donor</option>
          <option value="ngo">NGO</option>
        </select>
        
        <textarea name="address" value={address} onChange={onChange} placeholder="Address" required style={inputStyle} />
        
        <button type="submit" style={{ width: '100%', padding: '10px', background: 'green', color: 'white', border: 'none', cursor: 'pointer', marginTop: '10px' }}>
          Register
        </button>
      </form>
    </div>
  );
};

const inputStyle = { width: '100%', padding: '8px', marginBottom: '10px', display: 'block' };

export default Register;