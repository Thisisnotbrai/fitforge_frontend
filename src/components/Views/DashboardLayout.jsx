import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "./DashboardLayout.css";
import logo from "../../assets/FitForge Logo.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faHome,
  faUserTie,
  faHandshake,
  faChartLine,
  faSignOutAlt,
  faDumbbell,
  faAppleAlt,
} from "@fortawesome/free-solid-svg-icons";
import ChatbotWidget from "../Chatbot/ChatbotWidget";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Grab user role from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;

  useEffect(() => {
    // Redirect based on user role if not already on correct dashboard
    if (userRole === "trainer" && location.pathname === "/Dashboard") {
      navigate("/TrainerDashboard");
    } else if (
      userRole === "trainee" &&
      location.pathname === "/TrainerDashboard"
    ) {
      navigate("/Dashboard");
    }
  }, [userRole, location.pathname, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userProfile");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="dashboard-container" data-role={userRole}>
      <header className="header">
        <div
          className="logo"
          onClick={() =>
            navigate(
              userRole === "trainer" ? "/TrainerDashboard" : "/Dashboard"
            )
          }
        >
          <img src={logo} alt="FitForge Logo" className="logo-icon" />
          <span>
            <span className="fit">Fit</span>
            <span className="forge">Forge</span>
          </span>
        </div>

        <nav className="nav">
          <Link
            to={userRole === "trainer" ? "/TrainerDashboard" : "/Dashboard"}
            className={`nav-link ${
              isActive(
                userRole === "trainer" ? "/TrainerDashboard" : "/Dashboard"
              )
                ? "active"
                : ""
            }`}
          >
            <FontAwesomeIcon icon={faHome} /> <span>Home</span>
          </Link>
          <Link
            to={userRole === "trainer" ? "/your-trainee" : "/your-trainer"}
            className={`nav-link ${
              isActive(
                userRole === "trainer" ? "/your-trainee" : "/your-trainer"
              )
                ? "active"
                : ""
            }`}
          >
            <FontAwesomeIcon icon={faUserTie} />{" "}
            <span>
              {userRole === "trainer" ? "Your Trainees" : "Your Trainer"}
            </span>
          </Link>

          {userRole === "trainee" && (
            <>
              <Link
                to="/hire"
                className={`nav-link ${isActive("/hire") ? "active" : ""}`}
              >
                <FontAwesomeIcon icon={faHandshake} /> <span>Hire</span>
              </Link>
              <Link
                to="/workout"
                className={`nav-link ${isActive("/workout") ? "active" : ""}`}
              >
                <FontAwesomeIcon icon={faDumbbell} /> <span>Workout</span>
              </Link>
              <Link
                to="/nutrition"
                className={`nav-link ${isActive("/nutrition") ? "active" : ""}`}
              >
                <FontAwesomeIcon icon={faAppleAlt} /> <span>Nutrition</span>
              </Link>
              <Link
                to="/progress"
                className={`nav-link ${isActive("/progress") ? "active" : ""}`}
              >
                <FontAwesomeIcon icon={faChartLine} /> <span>Progress</span>
              </Link>
            </>
          )}
          <Link
            to="/profile"
            className={`profile-link ${isActive("/profile") ? "active" : ""}`}
          >
            <FontAwesomeIcon icon={faUser} /> <span>Profile</span>
          </Link>
          <button onClick={handleLogout} className="logout-button">
            <FontAwesomeIcon icon={faSignOutAlt} /> <span>Logout</span>
          </button>
        </nav>
      </header>

      <div className="dashboard-content">
        <Outlet />
      </div>

      <ChatbotWidget />
    </div>
  );
};

export default DashboardLayout;
