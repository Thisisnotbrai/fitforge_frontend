import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDumbbell, faClock } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "./YourTrainer.css";
import { useNavigate } from "react-router-dom";

const YourTrainer = () => {
  const [trainer, setTrainer] = useState(null);
  const [partnership, setPartnership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trainerWorkouts, setTrainerWorkouts] = useState([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);
  const navigate = useNavigate();

  // Fetch user data, partnership, and trainer data
  useEffect(() => {
    const fetchTrainerData = async () => {
      try {
        setLoading(true);

        // Get authentication token and user from localStorage (matching your auth pattern)
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Not authenticated");
        }

        // Get user from localStorage
        const userString = localStorage.getItem("user");
        if (!userString) {
          throw new Error("User data not found");
        }

        const user = JSON.parse(userString);

        // Verify user is a trainee
        const userRole = user.role || user.user_role;
        if (userRole !== "trainee") {
          throw new Error("This page is for trainees only");
        }

        // Fetch partnerships for this trainee using API with authentication
        const partnershipResponse = await axios.get(
          `http://localhost:3000/partnership/trainee/${user.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Find active partnership (if any)
        const activePartnership = partnershipResponse.data.find(
          (p) => p.status === "active"
        );

        if (activePartnership) {
          setPartnership(activePartnership);

          // If we have an active partnership, get trainer info from the partnership
          const trainerInfo = activePartnership.trainer;

          // Convert trainer data to match the format your component expects
          setTrainer({
            id: trainerInfo.id,
            name: trainerInfo.user_name,
            credentials: trainerInfo.trainerInfo
              ? `${trainerInfo.trainerInfo.specialization} Specialist`
              : "Certified Personal Trainer",
            specialties: trainerInfo.trainerInfo
              ? [trainerInfo.trainerInfo.specialization]
              : ["Strength Training", "Cardio", "Nutrition"],
          });

          // Fetch workouts created by the trainer for this trainee
          fetchTrainerWorkouts(user.id);
        }
      } catch (err) {
        console.error("Error fetching trainer data:", err);
        setError(
          "Failed to load your trainer information. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTrainerData();
  }, []);

  // Fetch workouts created by the trainer for this trainee
  const fetchTrainerWorkouts = async (traineeId) => {
    try {
      setLoadingWorkouts(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Not authenticated");
      }

      // Fetch trainee workouts
      const response = await axios.get(
        `http://localhost:3000/trainee/my-workouts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Trainee-Id": traineeId, // Use traineeId to fetch specific trainee's workouts
          },
        }
      );

      if (response.data && response.data.success) {
        // Filter to only show workouts created by the trainer
        const trainerCreated = response.data.data.filter(
          (workout) => workout.created_by_trainer
        );
        setTrainerWorkouts(trainerCreated);
      }
    } catch (err) {
      console.error("Error fetching trainer workouts:", err);
      // Don't show error to user, just log it
    } finally {
      setLoadingWorkouts(false);
    }
  };

  // Handle partnership status change
  const handlePartnershipStatusChange = async (newStatus) => {
    try {
      // Get authentication token (same as used in useEffect)
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      console.log(
        `Updating partnership ${partnership.id} to status: ${newStatus}`
      );

      // Make the API call to update partnership status
      await axios.put(
        `http://localhost:3000/partnership/${partnership.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(`Successfully updated partnership to ${newStatus}`);

      // If partnership is terminated, remove the trainer
      if (newStatus === "terminated") {
        setTrainer(null);
        setPartnership(null);
      } else if (newStatus === "paused" || newStatus === "active") {
        // Update partnership status locally for both pause and resume cases
        setPartnership({
          ...partnership,
          status: newStatus,
        });
      }
    } catch (err) {
      console.error("Error updating partnership status:", err);
      console.error(
        "Error details:",
        err.response ? err.response.data : "No response data"
      );
      console.error(
        "Request URL:",
        err.config ? err.config.url : "Unknown URL"
      );
      setError(
        "Failed to update trainer relationship status. Please try again."
      );
    }
  };

  // Navigate to workout detail page
  const handleStartWorkout = (workoutId) => {
    navigate(`/workout/${workoutId}`);
  };

  if (loading) {
    return (
      <div className="trainer-page">
        <div className="trainer-page-header">
          <h1>Your Trainer</h1>
          <p>Loading trainer information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trainer-page">
        <div className="trainer-page-header">
          <h1>Your Trainer</h1>
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="trainer-page">
      <div className="trainer-page-header">
        <h1>Your Trainer</h1>
        <p>View your assigned trainer&apos;s profile and upcoming sessions</p>
      </div>

      {trainer && partnership && partnership.status === "active" ? (
        <>
          <div className="trainer-profile-card">
            <div className="trainer-info">
              <h2 className="trainer-name">{trainer.name}</h2>
              <p className="trainer-credentials">{trainer.credentials}</p>

              <div className="trainer-specialties">
                <h3 className="specialties-title">Specialties</h3>
                <div className="specialty-tags">
                  {trainer.specialties.map((specialty, index) => (
                    <span key={index} className="specialty-tag">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div className="trainer-buttons">
                <button
                  className="pause-partnership-btn"
                  onClick={() => handlePartnershipStatusChange("paused")}
                >
                  Pause Partnership
                </button>
                <button
                  className="terminate-partnership-btn"
                  onClick={() => handlePartnershipStatusChange("terminated")}
                >
                  End Partnership
                </button>
              </div>
            </div>
          </div>

          <div className="trainer-sections">
            <div className="trainer-section">
              <h3 className="section-title">
                <FontAwesomeIcon icon={faClock} /> Partnership Details
              </h3>

              {partnership && partnership.start_date ? (
                <div className="partnership-details">
                  <div className="partnership-date">
                    <span className="date-label">Start Date:</span>
                    <span className="date-value">
                      {new Date(partnership.start_date).toLocaleDateString()}
                    </span>
                  </div>
                  {partnership.end_date && (
                    <div className="partnership-date">
                      <span className="date-label">End Date:</span>
                      <span className="date-value">
                        {new Date(partnership.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p>Partnership information not available.</p>
              )}

              <div className="trainer-section">
                <h3 className="section-title">
                  <FontAwesomeIcon icon={faDumbbell} /> Trainer Assigned
                  Workouts
                </h3>

                {loadingWorkouts ? (
                  <div className="loading-spinner">Loading workouts...</div>
                ) : trainerWorkouts.length > 0 ? (
                  <div className="trainer-workouts-grid">
                    {trainerWorkouts.map((workout) => (
                      <div key={workout.id} className="trainer-workout">
                        <div className="workout-name">
                          {workout.workout_name}
                        </div>
                        <div className="workout-detail">
                          <span className="workout-type">
                            {workout.workout_type}
                          </span>
                          <span className="workout-level">
                            {workout.workout_level}
                          </span>
                          <span className="workout-duration">
                            {workout.workout_duration} min
                          </span>
                        </div>
                        <div className="workout-detail">
                          Created on{" "}
                          {new Date(workout.createdAt).toLocaleDateString()}
                        </div>
                        <button
                          className="session-action"
                          onClick={() => handleStartWorkout(workout.id)}
                        >
                          Start Workout
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-workouts-message">
                    <p>Your trainer hasn&apos;t assigned any workouts yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : partnership && partnership.status === "paused" ? (
        <div className="paused-partnership">
          <h2>Partnership Paused</h2>
          <p>
            Your partnership with {trainer ? trainer.name : "your trainer"} is
            currently paused.
          </p>
          <button
            className="resume-partnership-btn"
            onClick={() => handlePartnershipStatusChange("active")}
          >
            Resume Partnership
          </button>
        </div>
      ) : (
        <div className="placeholder-page">
          <h1>No Trainer Assigned</h1>
          <p>You don&apos;t have a trainer assigned to your account yet.</p>
          <button className="contact-trainer-btn">Find a Trainer</button>
        </div>
      )}
    </div>
  );
};

export default YourTrainer;
