import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import AdminDashboard from "../components/admin/AdminDashboard"; // 👈 Restore your Admin Dashboard
import Donate from "./Donate"; // 👈 Your new Donor Dashboard

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  // 👇 ROUTING LOGIC:
  // If Admin or NGO -> Show the Admin/NGO Dashboard
  // If Donor -> Show the Donate Page
  if (user.role === "admin" || user.role === "ngo") {
    return <AdminDashboard />;
  } else {
    return <Donate />;
  }
};

export default Dashboard;
