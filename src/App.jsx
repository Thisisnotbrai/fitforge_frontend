import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/LandingPage/Header";
import Hero from "./components/LandingPage/Hero";
import About from "./components/LandingPage/About";
import Services from "./components/LandingPage/Services";
import FAQ from "./components/LandingPage/FAQ";
import Features from "./components/LandingPage/Features";
import Footer from "./components/LandingPage/Footer";
import BackToTopButton from "./components/LandingPage/BackToTopButton";
import Dashboard from "./components/Views/Trainee/Dashboard.jsx";
import TrainerDashboard from "./components/Views/Trainer/TrainerDashboard";
import UserProfile from "./components/Views/Trainee/UserProfile";
import ProtectedRoute from "./components/Views/ProtectedRoute";
import AdminProtectedRoute from "./components/Views/AdminProtectedRoute";
import AdminSignin from "./components/Views/Admin/AdminSignin";
import AdminDashboard from "./components/Views/Admin/AdminDashboard";
import DashboardLayout from "./components/Views/DashboardLayout";
import Signup from "./components/Signup/Signup";
import VerificationTab from "./components/Signup/VerificationTab";
import Signin from "./components/Signin/Signin";
import TrainerVerificationModal from "./components/TrainerVerificationModal";
import YourTrainer from "./components/Views/Trainee/YourTrainer";
import Hire from "./components/Views/Trainee/Hire";
import Progress from "./components/Views/Trainee/Progress";
import Workout from "./components/Views/Trainee/Workout/Workout";
import WorkoutDetail from "./components/Views/Trainee/Workout/WorkoutDetail";
import WorkoutList from "./components/Views/Trainee/Workout/WorkoutList";
import ActiveWorkout from "./components/Views/Trainee/Workout/ActiveWorkout";
import Nutrition from "./components/Views/Trainee/Nutrition/Nutrition";
import YourTrainees from "./components/Views/Trainer/YourTrainees";
import "./App.css";

const VerificationRoute = () => {
  const userString = localStorage.getItem("user");

  if (userString) {
    const user = JSON.parse(userString);
    console.log(
      "User verification status in VerificationRoute:",
      user.is_verified
    );

    if (user.is_verified === true) {
      if (user.role === "trainee") {
        return <Navigate to="/Dashboard" replace />;
      } else if (user.role === "trainer") {
        return <Navigate to="/TrainerDashboard" replace />;
      }
    }
  }

  return <VerificationTab />;
};

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.includes('/admin');
  
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="App">
            <Header />
            <Hero />
            <About />
            <Services />
            <FAQ />
            <Features />
            <Footer />
            {!isAdminRoute && <BackToTopButton />}
            <TrainerVerificationModal />
          </div>
        }
      />

      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Signin />} />
      <Route path="/verify" element={<VerificationRoute />} />

      <Route path="/admin/login" element={<AdminSignin />} />
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      <Route
        path="/onboarding"
        element={<Navigate to="/Dashboard" replace />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/TrainerDashboard" element={<TrainerDashboard />} />
          <Route path="/profile" element={<UserProfile />} />

          <Route element={<ProtectedRoute allowedRoles={["trainee"]} />}>
            <Route path="/your-trainer" element={<YourTrainer />} />
            <Route path="/hire" element={<Hire />} />
            <Route path="/workout" element={<Workout />} />
            <Route path="/workouts" element={<WorkoutList />} />
            <Route path="/workout/:id" element={<WorkoutDetail />} />
            <Route path="/workout/:id/active" element={<ActiveWorkout />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/nutrition" element={<Nutrition />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["trainer"]} />}>
            <Route path="/your-trainee" element={<YourTrainees />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
