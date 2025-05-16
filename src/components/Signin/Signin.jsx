import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import login from "../../assets/Loginlogo.jpg";
import logo from "../../assets/FitForge Logo.jpg";
import "./Signin.css";

const Signin = () => {
  const [user_email, setEmail] = useState("");
  const [user_password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pendingApproval, setPendingApproval] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for any messages passed via location state (like after verification)
  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("Attempting login for:", user_email);
      
      // Reset any existing errors and messages
      setError("");
      setPendingApproval(false);
      
      const response = await axios.post("http://localhost:3000/users/login", {
        user_email,
        user_password,
      });

      console.log("Backend response:", response.data); // Debugging

      if (response.data.data) {
        // Correctly extract the token and user info
        const token = response.data.data; // This is the actual token
        const user = response.data.message.User; // This is the user object

        // VERY IMPORTANT: Add email field to the user object if not present (for identity checking)
        if (!user.email && user_email) {
          user.email = user_email;
        }
        
        // Debugging: Log the user object and verification status
        console.log("User object from server:", user);
        console.log("Is verified?", user.is_verified);
        
        // Check if user is verified - only redirect if explicitly false
        if (user.is_verified === false) {
          // Store email for verification page
          localStorage.setItem("pendingVerificationEmail", user_email);
          
          // Set temporary session data for auto-login after verification
          if (!localStorage.getItem("tempUserData")) {
            localStorage.setItem("tempUserData", JSON.stringify({
              email: user_email,
              password: user_password
            }));
          }
          
          // Navigate to verification page
          navigate("/verify", { state: { email: user_email } });
          return;
        }

        // Check user role and navigate accordingly
        if (user?.role === "trainee") {
          // Force-set the token and user data for trainee
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
          console.log("Navigating to /Dashboard");
          navigate("/Dashboard", { replace: true });
        } else if (user?.role === "trainer") {
          console.log("Trainer approval status:", user.is_approved);
          
          // Check if the trainer is approved
          if (user.is_approved === true) {
            // Trainer is approved - store credentials and navigate to dashboard
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            console.log("Trainer is approved. Navigating to /TrainerDashboard");
            navigate("/TrainerDashboard", { replace: true });
          } else {
            // Trainer is not approved - show the approval pending message
            setPendingApproval(true);
            // Don't store credentials to prevent access
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        } else {
          setError("Unknown user role");
        }
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
    <>
      <img className="login-hero" src={login} alt="" />

      <div className="login-section">
        <div className="form-container">
          <div className="Logo-container">
            <img className="Logo" src={logo} alt="Logo" />
            <h2>
              <span className="fit-text">Fit</span>
              <span className="forge-text">Forge</span>
            </h2>
          </div>
          <h1 className="form-title">Sign in</h1>
          
          {message && <p className="success-message">{message}</p>}
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email" className="input-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="input-field"
                placeholder="Enter your email"
                value={user_email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="input-field"
                placeholder="Enter your password"
                value={user_password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            {pendingApproval && (
              <div className="approval-pending-message">
                <h3>Admin Approval Required</h3>
                <p>Your trainer account is awaiting administrator approval.</p>
                <p>You&apos;ll be notified when your account is approved and ready to use.</p>
              </div>
            )}
            <button type="submit" className="submit-button">
              Sign In
            </button>
          </form>
          <p className="signup-text">
            Don&apos;t have an account? <a href="/signup" className="signup-link">Sign Up</a>
          </p>
        </div>
      </div>
    </>
  );
};

export default Signin;
