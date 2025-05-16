import { Navigate, Outlet, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  const location = useLocation();

  console.log("Current path in ProtectedRoute:", location.pathname);
  console.log("Token in ProtectedRoute:", token);

  if (!token) {
    console.log("No token found, redirecting to login");
    return <Navigate to="/login" />;
  }

  if (!userString) {
    console.log("No user data found, redirecting to login");
    return <Navigate to="/login" />;
  }

  try {
    const user = JSON.parse(userString);
    const userRole = user?.role;
    console.log("User role in ProtectedRoute:", userRole);
    console.log(
      "User verification status in ProtectedRoute:",
      user.is_verified
    );

    // Redirect if user is not verified
    if (user.is_verified === false) {
      localStorage.setItem("pendingVerificationEmail", user.email);
      console.log("User not verified, redirecting to verify page");
      return <Navigate to="/verify" state={{ email: user.email }} />;
    }

    // Check role access
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      console.log(
        "User not authorized for this route, redirecting to default dashboard"
      );
      const defaultDashboard =
        userRole === "trainer" ? "/TrainerDashboard" : "/Dashboard";
      return <Navigate to={defaultDashboard} />;
    }
  } catch (error) {
    console.error("Error parsing user data in ProtectedRoute:", error);
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;
