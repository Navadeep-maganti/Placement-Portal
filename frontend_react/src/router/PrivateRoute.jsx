import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageLoader from "../components/Common/PageLoader";

const PrivateRoute = ({ allowedRoles, children }) => {
  const { auth, loading } = useAuth();
  const logoutRedirectInProgress =
    sessionStorage.getItem("logout_redirect_in_progress") === "true";

  if (loading) {
    return <PageLoader />;
  }

  if (logoutRedirectInProgress) {
    return <Navigate to="/" replace />;
  }

  if (!auth.access) return <Navigate to="/login" />;
  if (!allowedRoles.includes(auth.role)) return <Navigate to="/" />;

  return children;
};

export default PrivateRoute;
