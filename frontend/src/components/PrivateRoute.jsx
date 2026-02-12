import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading...</div>;
  }

  // If there is no user logged in, send them to Login page
  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;