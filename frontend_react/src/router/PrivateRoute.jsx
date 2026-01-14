import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = ({ allowedRoles, children }) => {
  const { auth } = useAuth();

  if (!auth.access) return <Navigate to="/login" />;
  if (!allowedRoles.includes(auth.role)) return <Navigate to="/" />;

  return children;
};

export default PrivateRoute;
