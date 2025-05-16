import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import logo from "../../../assets/FitForge Logo.jpg";
import "./AdminSignin.css";

const AdminSignin = () => {
  const [user_email, setEmail] = useState("");
  const [user_password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:3000/users/login", {
        user_email,
        user_password,
      });

      if (response.data.data) {
        const token = response.data.data;
        const user = response.data.message.User;

        // Check if user is an admin
        if (user?.role !== "admin") {
          setError("Access denied. Admin privileges required.");
          return;
        }

        // Save token and user info
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Navigate to admin dashboard
        navigate("/admin/dashboard", { replace: true });
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(
        err.response?.data?.message || "An error occurred during login."
      );
    }
  };

  return (
    <div className="admin-signin-container">
      <div className="admin-form-container">
        <div className="Logo-container">
          <img className="Logo" src={logo} alt="Logo" />
          <h2>
            <span className="fit-text">Fit</span>
            <span className="forge-text">Forge</span>
          </h2>
        </div>
        <h1 className="admin-form-title">Admin Sign in</h1>
        
        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-input-group">
            <label htmlFor="email" className="admin-input-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="admin-input-field"
              placeholder="Enter your email"
              value={user_email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="admin-input-group">
            <label htmlFor="password" className="admin-input-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="admin-input-field"
              placeholder="Enter your password"
              value={user_password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="admin-error-message">{error}</p>}
          <button type="submit" className="admin-submit-button">
            Sign In
          </button>
        </form>
        <p className="admin-signin-info">Admin access only</p>
      </div>
    </div>
  );
};

export default AdminSignin; 