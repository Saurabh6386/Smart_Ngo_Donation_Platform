import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import DonorDashboard from '../components/donor/DonorDashboard';
import NgoDashboard from '../components/ngo/NgoDashboard';
// 👇 IMPORT THE ADMIN DASHBOARD HERE
import AdminDashboard from '../components/admin/AdminDashboard'; 

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  // Safety check: Redirect if not logged in
  if (!user) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Please Login first</h2>
        <a href="/login">Go to Login</a>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* HEADER SECTION */}
      <div style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <h1>Welcome, {user.name} ({user.role})</h1>
      </div>

      {/* DASHBOARD CONTENT BASED ON ROLE */}
      {user.role === 'donor' && <DonorDashboard />}
      {user.role === 'ngo' && <NgoDashboard />}
      
      {/* 👇 THIS WAS THE MISSING PART */}
      {user.role === 'admin' && <AdminDashboard />}
    
    </div>
  );
};

export default Dashboard;