import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import register from "../../assets/Register.jpg"; // Import the image
import logo from "../../assets/FitForge Logo.jpg"; // Import the logo
import "./Signup.css"; // Import the CSS file

const Signup = () => {
  const [user_name, setName] = useState("");
  const [user_email, setEmail] = useState("");
  const [user_password, setPassword] = useState("");
  const [user_role, setRole] = useState("trainee"); // Default role is trainee
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!user_name) newErrors.name = "Name is required";
    if (!user_email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(user_email)) {
      newErrors.email = "Email address is invalid";
    }
    if (!user_password) {
      newErrors.password = "Password is required";
    } else if (user_password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // Stop if validation fails
    }

    setLoading(true);
    setApiError("");

    try {
      const result = await axios.post("http://localhost:3000/users/register", {
        user_name,
        user_email,
        user_password,
        user_role, // Include user role in the request
      });
      console.log("Registration successful:", result.data);

      // Store user credentials temporarily for auto-login after verification
      localStorage.setItem("tempUserData", JSON.stringify({
        email: user_email,
        password: user_password
      }));

      // Navigate to verification page
      navigate("/verify", { state: { email: user_email } });
    } catch (err) {
      console.error("Registration failed:", err);
      setApiError(
        err.response?.data?.message || "An error occurred during registration."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="signup-section">
        {/* Form Container */}
        <div className="signup-form-container">
          <div className="signup-logo-container">
            <img className="signup-logo" src={logo} alt="Logo" />
            <h2>
              <span className="fit-text">Fit</span>
              <span className="forge-text">Forge</span>
            </h2>
          </div>
          <h1 className="signup-form-title">Sign Up</h1>
          <form onSubmit={handleSubmit}>
            <div className="signup-input-group">
              <label htmlFor="name" className="signup-input-label">
                Name:
              </label>
              <input
                type="text"
                id="name"
                className="signup-input-field"
                placeholder="Enter your name"
                value={user_name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && (
                <span style={{ color: "red" }}>{errors.name}</span>
              )}
            </div>
            <div className="signup-input-group">
              <label htmlFor="email" className="signup-input-label">
                Email:
              </label>
              <input
                type="email"
                id="email"
                className="signup-input-field"
                placeholder="Enter your email"
                value={user_email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <span style={{ color: "red" }}>{errors.email}</span>
              )}
            </div>
            <div className="signup-input-group">
              <label htmlFor="password" className="signup-input-label">
                Password:
              </label>
              <input
                type="password"
                id="password"
                className="signup-input-field"
                placeholder="Enter your password"
                value={user_password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <span style={{ color: "red" }}>{errors.password}</span>
              )}
            </div>
            <div className="signup-input-group">
              <label htmlFor="role" className="signup-input-label">
                Role:
              </label>
              <select
                id="role"
                className="signup-input-field"
                value={user_role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="trainee">Trainee</option>
                <option value="trainer">Trainer</option>
              </select>
            </div>
            {apiError && <p style={{ color: "red" }}>{apiError}</p>}
            <button
              type="submit"
              className="signup-submit-button"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
          <p className="signup-text">
            Already have an account?{" "}
            <a href="/login" className="signup-link">
              Sign In
            </a>
          </p>
        </div>

        {/* Register Hero Image */}
        <img className="register-hero" src={register} alt="" />
      </div>
    </>
  );
};

export default Signup;
