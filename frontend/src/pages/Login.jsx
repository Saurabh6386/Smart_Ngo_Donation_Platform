import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { toast } from "react-toastify";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;
  const navigate = useNavigate();
  const { login, user, error, clearError } = useContext(AuthContext);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [user, error, navigate, clearError]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
    } else {
      login({ email, password });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          <span className="text-red-500">Welcome</span> Back
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Login to continue your journey
        </p>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <input
              type="email"
              name="email"
              value={email}
              placeholder="Email Address"
              onChange={onChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200"
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              value={password}
              placeholder="Password"
              onChange={onChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Login
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center mt-6 text-gray-600">
          New here?{" "}
          <Link
            to="/register"
            className="text-red-500 font-bold hover:underline"
          >
            Register Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
