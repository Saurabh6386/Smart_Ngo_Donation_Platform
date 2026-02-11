import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check if user is already logged in (from local storage)
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);
  }, []);

  // Register Function
  const register = async (userData) => {
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/register",
        userData,
      );
      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      toast.success("Registration Successful!");
      navigate("/"); // Go to Dashboard/Home
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration Failed");
    }
  };

  // Login Function
  const login = async (userData) => {
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/login",
        userData,
      );
      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      toast.success("Login Successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed");
    }
  };

  // Logout Function
  const logout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    navigate("/login");
    toast.info("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
