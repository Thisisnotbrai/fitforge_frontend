import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./VerificationTab.css";

const VerificationTab = () => {
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const inputRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Get email from location state, fallback to localStorage if not provided
  const email = location.state?.email || localStorage.getItem("pendingVerificationEmail") || "";

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Check if email is already verified and redirect if needed
  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!email) {
        navigate("/signup");
        return;
      }
      
      try {
        // Store email in localStorage in case of page refresh
        localStorage.setItem("pendingVerificationEmail", email);
        
        // Check if we have temp user data from registration
        const storedUser = localStorage.getItem("tempUserData");
        
        if (storedUser) {
          // User is coming from registration, we need to check if they're verified
          const userData = JSON.parse(storedUser);
          const apiUrl = import.meta.env.VITE_API_URL;
          try {
            // Try to login which will tell us if verified
            const loginResponse = await axios.post(`${apiUrl}/users/login`, {
              user_email: userData.email,
              user_password: userData.password
            });
            
            if (loginResponse.data.data) {
              const user = loginResponse.data.message.User;
              
              // If user is already verified, log them in and redirect
              if (user.is_verified) {
                const token = loginResponse.data.data;
                
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));
                localStorage.removeItem("tempUserData");
                localStorage.removeItem("pendingVerificationEmail");
                
                // Redirect based on user role
                if (user.role === "trainee") {
                  navigate("/Dashboard", { replace: true });
                } else if (user.role === "trainer") {
                  // Check if the trainer is approved (should be false for new trainers)
                  if (user.is_approved === true) {
                    // If already approved, store credentials and redirect to dashboard
                    localStorage.setItem("token", token);
                    localStorage.setItem("user", JSON.stringify(user));
                    navigate("/TrainerDashboard", { replace: true });
                  } else {
                    // For trainers awaiting approval, redirect to landing page with modal
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    // Set a flag for the landing page to show a trainer verification modal
                    localStorage.setItem("showTrainerVerificationModal", "true");
                    navigate("/", { replace: true });
                  }
                }
                return;
              }
            }
          } catch (err) {
            console.error("Error checking verification status:", err);
            // Continue showing verification page even if check fails
          }
        } else {
          // User is coming from login, try to check verification status via login API
          // We don't have the password, so we can't automatically verify
          // But we'll keep the component mounted to allow verification
        }
      } finally {
        setIsChecking(false);
      }
    };
    
    checkVerificationStatus();
  }, [email, navigate]);

  const handleChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    // Update the verification code state
    const newVerificationCode = [...verificationCode];
    newVerificationCode[index] = value;
    setVerificationCode(newVerificationCode);

    // If a digit was entered and there's a next input, focus on it
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (verificationCode[index] === "" && index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
    // Handle left arrow
    else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    // Handle right arrow
    else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");

    // If pasted content is 6 digits, fill all inputs
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setVerificationCode(digits);

      // Focus the last input
      inputRefs.current[5].focus();
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setError("");

    // Check if all digits are entered
    if (verificationCode.join("").length !== 6) {
      setError("Please enter all 6 digits");
      setIsVerifying(false);
      return;
    }
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      // Call the backend verification API
      const response = await axios.post(`${apiUrl}/users/verify`, {
        email: email,
        verification_code: verificationCode.join("")
      });

      // If verification was successful
      if (response.status === 200) {
        // Clear the pending verification email
        localStorage.removeItem("pendingVerificationEmail");
        
        // Try to get user credentials if they exist (in case user just registered)
        const storedUser = localStorage.getItem("tempUserData");
        
        if (storedUser) {
          // User just registered, log them in automatically
          const userData = JSON.parse(storedUser);
          
          try {
            // Attempt to log in the user
            const loginResponse = await axios.post(`${apiUrl}/users/login`, {
              user_email: userData.email,
              user_password: userData.password
            });
            
            if (loginResponse.data.data) {
              const token = loginResponse.data.data;
              const user = loginResponse.data.message.User;
              
              localStorage.setItem("token", token);
              localStorage.setItem("user", JSON.stringify(user));
              localStorage.removeItem("tempUserData");
              
              // Redirect based on user role
              if (user.role === "trainee") {
                navigate("/Dashboard", { replace: true });
              } else if (user.role === "trainer") {
                // Check if the trainer is approved (should be false for new trainers)
                if (user.is_approved === true) {
                  // If already approved, store credentials and redirect to dashboard
                  localStorage.setItem("token", token);
                  localStorage.setItem("user", JSON.stringify(user));
                  navigate("/TrainerDashboard", { replace: true });
                } else {
                  // For trainers awaiting approval, redirect to landing page with modal
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  // Set a flag for the landing page to show a trainer verification modal
                  localStorage.setItem("showTrainerVerificationModal", "true");
                  navigate("/", { replace: true });
                }
              }
            }
          } catch (loginErr) {
            console.error("Auto-login failed after verification:", loginErr);
            navigate("/login", { 
              state: { message: "Email verified successfully! Please log in." } 
            });
          }
        } else {
          // User came from login page, redirect back to login
          navigate("/login", { 
            state: { message: "Email verified successfully! Please log in again." } 
          });
        }
      }
    } catch (err) {
      console.error("Verification failed:", err);
      setError(err.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    try {
      // Here you would typically call your backend to resend the code
      // Since we don't have that endpoint, we'll just show a message
      alert(`A new verification code would be sent to ${email}`);
      
      // In a real implementation, you would have code like:
      // await axios.post("${apiUrl}/users/resend-verification", { email });
    } catch (err) {
      console.error("Failed to resend code:", err);
      setError("Failed to resend verification code. Please try again.");
    }
  };

  if (isChecking) {
    return (
      <div className="verification-container">
        <div className="verification-card">
          <h1>Checking verification status...</h1>
          <p>Please wait while we check your account status.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="verification-container">
      <div className="verification-card">
        <h1>Email Verification</h1>
        <p>We have sent a verification code to:</p>
        <p className="verification-email">{email}</p>
        <p>Enter the 6-digit code below to verify your account.</p>

        <div className="verification-inputs">
          {verificationCode.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : null}
              ref={(el) => (inputRefs.current[index] = el)}
              className="verification-input"
              autoFocus={index === 0}
            />
          ))}
        </div>

        {error && <p className="verification-error">{error}</p>}

        <button
          className="verification-button"
          onClick={handleVerify}
          disabled={isVerifying}
        >
          {isVerifying ? "Verifying..." : "Verify"}
        </button>

        <p className="verification-resend">
          Did not receive the code?{" "}
          <button className="resend-button" onClick={handleResendCode}>
            Resend Code
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerificationTab;
