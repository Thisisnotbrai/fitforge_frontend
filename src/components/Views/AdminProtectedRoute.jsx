import { Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

const AdminProtectedRoute = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = () => {
    try {
      const token = localStorage.getItem("token");
      const userString = localStorage.getItem("user");

      if (!token || !userString) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const user = JSON.parse(userString);

      // Check if user is an admin
      if (user && user.role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
      setLoading(false);
    }
  };

  if (loading) {
    // You could return a loading spinner here
    return <div>Loading...</div>;
  }

  // If not an admin, redirect to login
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  // Render child routes if user is an admin
  return <Outlet />;
};

export default AdminProtectedRoute;
