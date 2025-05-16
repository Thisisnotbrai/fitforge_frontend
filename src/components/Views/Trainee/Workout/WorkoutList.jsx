import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import "./Workout.css";

const WorkoutList = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [trainees, setTrainees] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [newWorkout, setNewWorkout] = useState({
    workout_name: "",
    workout_type: "Strength",
    workout_level: "Beginner",
    workout_duration: 30,
    workout_calories: 200,
    description: "",
    is_public: false,
    exercises: [],
  });
  const [createSuccess, setCreateSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await axios.get(
          "${apiUrl}/workouts/workouts"
        );
        setWorkouts(response.data);

        // Get user role from localStorage
        const userString = localStorage.getItem("user");
        if (userString) {
          const user = JSON.parse(userString);
          setUserRole(user.role || user.user_role);

          // If user is a trainer, fetch their trainees
          if (user.role === "trainer" || user.user_role === "trainer") {
            const token = localStorage.getItem("token");
            const traineeResponse = await axios.get(
              `${apiUrl}/partnership/trainer/${user.id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            // Filter to active partnerships
            const activePartnerships = traineeResponse.data.filter(
              (p) => p.status === "active"
            );

            // Extract trainee data
            const traineeData = activePartnerships.map((p) => ({
              id: p.trainee.id,
              name: p.trainee.user_name,
              email: p.trainee.user_email,
            }));

            setTrainees(traineeData);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching workouts:", error);
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  // Handle creating a workout for trainee
  const handleCreateWorkoutForTrainee = async () => {
    try {
      if (!selectedTrainee) {
        setError("Please select a trainee to create this workout for");
        return;
      }

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "${apiUrl}/trainee/create-workout-for-trainee",
        {
          trainee_id: selectedTrainee.id,
          ...newWorkout,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.success) {
        setCreateSuccess("Workout created successfully for trainee!");

        // Reset form after 2 seconds
        setTimeout(() => {
          setShowCreateModal(false);
          setSelectedTrainee(null);
          setNewWorkout({
            workout_name: "",
            workout_type: "Strength",
            workout_level: "Beginner",
            workout_duration: 30,
            workout_calories: 200,
            description: "",
            is_public: false,
            exercises: [],
          });
          setCreateSuccess("");
          setError("");
        }, 2000);
      }
    } catch (err) {
      console.error("Error creating workout for trainee:", err);
      setError("Failed to create workout for trainee. Please try again.");
    }
  };

  if (loading)
    return <div className="loading-container">Loading workouts...</div>;

  return (
    <div className="workout-list">
      <h2>Available Workouts</h2>

      {userRole === "trainer" && trainees.length > 0 && (
        <div className="workout-actions-header">
          <button
            className="create-workout-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <FontAwesomeIcon icon={faPlusCircle} /> Create New Workout for
            Trainee
          </button>
        </div>
      )}

      <div className="workout-grid">
        {workouts.map((workout) => (
          <div key={workout.id} className="workout-card">
            <div className="workout-tag">{workout.workout_type}</div>
            <h3>{workout.workout_name}</h3>
            <div className="workout-details">
              <span>{workout.workout_duration} min</span>
              <span>{workout.workout_calories} cal</span>
              <span>{workout.workout_level}</span>
            </div>

            <div className="workout-actions">
              <Link to={`/workout/${workout.id}`} className="btn-primary">
                View Workout
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Create Workout Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content workout-modal">
            <div className="modal-header">
              <h3>Create New Workout for Trainee</h3>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedTrainee(null);
                  setNewWorkout({
                    workout_name: "",
                    workout_type: "Strength",
                    workout_level: "Beginner",
                    workout_duration: 30,
                    workout_calories: 200,
                    description: "",
                    is_public: false,
                    exercises: [],
                  });
                  setError("");
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {createSuccess ? (
                <div className="success-message">{createSuccess}</div>
              ) : (
                <>
                  {error && <div className="error-message">{error}</div>}

                  <div className="trainee-selection">
                    <h4>Select Trainee:</h4>
                    <div className="trainee-list">
                      {trainees.map((trainee) => (
                        <div
                          key={trainee.id}
                          className={`trainee-item ${
                            selectedTrainee && selectedTrainee.id === trainee.id
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => setSelectedTrainee(trainee)}
                        >
                          <div className="trainee-name">{trainee.name}</div>
                          <div className="trainee-email">{trainee.email}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="create-workout-form">
                    <div className="form-group">
                      <label htmlFor="workout_name">Workout Name</label>
                      <input
                        type="text"
                        id="workout_name"
                        value={newWorkout.workout_name}
                        onChange={(e) =>
                          setNewWorkout({
                            ...newWorkout,
                            workout_name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="workout_type">Workout Type</label>
                      <select
                        id="workout_type"
                        value={newWorkout.workout_type}
                        onChange={(e) =>
                          setNewWorkout({
                            ...newWorkout,
                            workout_type: e.target.value,
                          })
                        }
                      >
                        <option value="Strength">Strength</option>
                        <option value="Cardio">Cardio</option>
                        <option value="Flexibility">Flexibility</option>
                        <option value="HIIT">HIIT</option>
                        <option value="Full Body">Full Body</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="workout_level">Difficulty Level</label>
                      <select
                        id="workout_level"
                        value={newWorkout.workout_level}
                        onChange={(e) =>
                          setNewWorkout({
                            ...newWorkout,
                            workout_level: e.target.value,
                          })
                        }
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    <div className="form-row">
                      <div className="form-group half">
                        <label htmlFor="workout_duration">Duration (min)</label>
                        <input
                          type="number"
                          id="workout_duration"
                          value={newWorkout.workout_duration}
                          onChange={(e) =>
                            setNewWorkout({
                              ...newWorkout,
                              workout_duration: parseInt(e.target.value),
                            })
                          }
                          min="1"
                          required
                        />
                      </div>

                      <div className="form-group half">
                        <label htmlFor="workout_calories">Calories</label>
                        <input
                          type="number"
                          id="workout_calories"
                          value={newWorkout.workout_calories}
                          onChange={(e) =>
                            setNewWorkout({
                              ...newWorkout,
                              workout_calories: parseInt(e.target.value),
                            })
                          }
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="description">Description</label>
                      <textarea
                        id="description"
                        value={newWorkout.description}
                        onChange={(e) =>
                          setNewWorkout({
                            ...newWorkout,
                            description: e.target.value,
                          })
                        }
                        rows={4}
                      ></textarea>
                    </div>

                    <div className="form-group checkbox">
                      <input
                        type="checkbox"
                        id="is_public"
                        checked={newWorkout.is_public}
                        onChange={(e) =>
                          setNewWorkout({
                            ...newWorkout,
                            is_public: e.target.checked,
                          })
                        }
                      />
                      <label htmlFor="is_public">
                        Make workout public (visible to other users)
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              {!createSuccess && (
                <>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateWorkoutForTrainee}
                    className="btn-create"
                    disabled={!newWorkout.workout_name || !selectedTrainee}
                  >
                    Create Workout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutList;
