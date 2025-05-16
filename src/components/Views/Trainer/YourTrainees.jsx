import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserFriends,
  faChartLine,
  faDumbbell,
  faCheckCircle,
  faClock,
  faPlusCircle,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "./YourTrainees.css";

const YourTrainees = () => {
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [showCreateWorkoutModal, setShowCreateWorkoutModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
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
  const [newExercise, setNewExercise] = useState({
    exercise_name: "",
    sets: 3,
    reps: 10,
    work_time: 45,
    rest_time: 15,
    rest_between: 60,
  });
  const [createSuccess, setCreateSuccess] = useState("");
  const [exerciseSuccess, setExerciseSuccess] = useState("");
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);
  const [trainerCreatedWorkouts, setTrainerCreatedWorkouts] = useState([]);
  const [traineeCreatedWorkouts, setTraineeCreatedWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [showExercisesModal, setShowExercisesModal] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  // Fetch workouts for a trainee
  const fetchTraineeWorkouts = useCallback(async (traineeId) => {
    try {
      setLoadingWorkouts(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      // We'll use the TraineeWorkout endpoint to get workouts created for this trainee
      const response = await axios.get(
        `${apiUrl}/trainee/my-workouts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Trainee-Id": traineeId, // Custom header to pass trainee ID
          },
        }
      );

      if (response.data && response.data.success) {
        const allWorkouts = response.data.data || [];

        // Separate trainer-created and trainee-created workouts
        const trainerWorkouts = allWorkouts.filter(
          (workout) => workout.created_by_trainer
        );
        const traineeWorkouts = allWorkouts.filter(
          (workout) => !workout.created_by_trainer
        );

        setTrainerCreatedWorkouts(trainerWorkouts);
        setTraineeCreatedWorkouts(traineeWorkouts);
      }
    } catch (err) {
      console.error("Error fetching trainee workouts:", err);
      // Don't show error to user, just log it
    } finally {
      setLoadingWorkouts(false);
    }
  }, [apiUrl, setLoadingWorkouts, setTrainerCreatedWorkouts, setTraineeCreatedWorkouts]);

  useEffect(() => {
    const fetchTrainees = async () => {
      try {
        setLoading(true);
        setError("");

        // Get authentication token and user from localStorage
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

        // Verify user is a trainer
        const userRole = user.role || user.user_role;
        if (userRole !== "trainer") {
          throw new Error("This page is for trainers only");
        }

        // Fetch partnerships for this trainer
        const partnershipResponse = await axios.get(
          `${apiUrl}/partnership/trainer/${user.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Filter to active partnerships
        const activePartnerships = partnershipResponse.data.filter(
          (p) => p.status === "active"
        );

        if (activePartnerships.length > 0) {
          // Extract trainee data from partnerships
          const traineeData = activePartnerships.map((p) => ({
            id: p.trainee.id,
            name: p.trainee.user_name,
            email: p.trainee.user_email,
            partnershipId: p.id,
            partnershipStart: p.start_date,
            partnershipEnd: p.end_date,
            goals: ["Weight Loss", "Muscle Gain", "Improved Fitness"], // Example goals - would come from trainee profile in a real app
          }));

          setTrainees(traineeData);

          // Set the first trainee as selected by default
          setSelectedTrainee(traineeData[0]);
        }
      } catch (err) {
        console.error("Error fetching trainees:", err);
        setError("Failed to load your trainees. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrainees();
  }, [apiUrl, setTrainees, setSelectedTrainee, setLoading, setError]);

  // Fetch trainee workouts when a trainee is selected
  useEffect(() => {
    if (selectedTrainee) {
      fetchTraineeWorkouts(selectedTrainee.id);
    }
  }, [selectedTrainee, fetchTraineeWorkouts]);

  // Handle partnership status change
  const handlePartnershipStatusChange = async (partnershipId, newStatus) => {
    try {
      // Get authentication token
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      // Make the API call to update partnership status
      await axios.put(
        `${apiUrl}/partnership/${partnershipId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // If partnership is terminated, remove the trainee from the list
      if (newStatus === "terminated") {
        setTrainees((prevTrainees) =>
          prevTrainees.filter((t) => t.partnershipId !== partnershipId)
        );

        // If the terminated trainee was selected, select another one or null
        if (
          selectedTrainee &&
          selectedTrainee.partnershipId === partnershipId
        ) {
          const remainingTrainees = trainees.filter(
            (t) => t.partnershipId !== partnershipId
          );
          setSelectedTrainee(
            remainingTrainees.length > 0 ? remainingTrainees[0] : null
          );
        }
      }
    } catch (err) {
      console.error("Error updating partnership status:", err);
      setError(
        "Failed to update trainee relationship status. Please try again."
      );
    }
  };

  // Handle creating a workout for trainee
  const handleCreateWorkoutForTrainee = async () => {
    try {
      if (!selectedTrainee) {
        return;
      }

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "${apiUrl}/trainee/create-workout-for-trainee",
        {
          trainee_id: selectedTrainee.id,
          ...newWorkout,
          created_by_trainer: true, // Mark as created by trainer
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.success) {
        // Show success message
        setCreateSuccess("Workout created successfully for trainee!");

        // Refresh trainee workouts
        fetchTraineeWorkouts(selectedTrainee.id);

        // Reset state
        setTimeout(() => {
          setShowCreateWorkoutModal(false);
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
        }, 2000);
      }
    } catch (err) {
      console.error("Error creating workout for trainee:", err);
      setError("Failed to create workout for trainee. Please try again.");
    }
  };

  // Handle adding an exercise to a trainee workout
  const handleAddExerciseToWorkout = async () => {
    try {
      if (!selectedWorkout) {
        return;
      }

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "${apiUrl}/exercises/create",
        {
          ...newExercise,
          workout_id: selectedWorkout.id,
          trainee_id: selectedTrainee.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        // Show success message
        setExerciseSuccess("Exercise added successfully to workout!");

        // Reset state after a delay
        setTimeout(() => {
          setShowAddExerciseModal(false);
          setNewExercise({
            exercise_name: "",
            sets: 3,
            reps: 10,
            work_time: 45,
            rest_time: 15,
            rest_between: 60,
          });
          setSelectedWorkout(null);
          setExerciseSuccess("");
        }, 2000);
      }
    } catch (err) {
      console.error("Error adding exercise to workout:", err);
      setError("Failed to add exercise to workout. Please try again.");
    }
  };

  // Add this function to fetch exercises for a specific workout
  const fetchExercisesForWorkout = async (workoutId) => {
    try {
      setLoadingExercises(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await axios.get(
        `${apiUrl}/exercises/workout/${workoutId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setExercises(response.data || []);
    } catch (err) {
      console.error("Error fetching exercises:", err);
      setError("Failed to load exercises. Please try again.");
    } finally {
      setLoadingExercises(false);
    }
  };

  // Add this function to view exercises for a workout
  const handleViewExercises = (workout) => {
    setSelectedWorkout(workout);
    fetchExercisesForWorkout(workout.id);
    setShowExercisesModal(true);
  };

  // Add this function to delete an exercise
  const handleDeleteExercise = async (exerciseId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      await axios.delete(`${apiUrl}/exercises/${exerciseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update exercises list after deletion
      setExercises(exercises.filter((exercise) => exercise.id !== exerciseId));
    } catch (err) {
      console.error("Error deleting exercise:", err);
      setError("Failed to delete exercise. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="trainees-page">
        <div className="trainees-page-header">
          <h1>Your Trainees</h1>
          <p>Loading trainees information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trainees-page">
        <div className="trainees-page-header">
          <h1>Your Trainees</h1>
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="trainees-page">
      <div className="trainees-page-header">
        <h1>Your Trainees</h1>
        <p>Manage your trainees and their training programs</p>
      </div>

      {trainees.length === 0 ? (
        <div className="no-trainees">
          <h2>No Active Trainees</h2>
          <p>You don&apos;t have any active trainees at the moment.</p>
        </div>
      ) : (
        <div className="trainees-container">
          <div className="trainees-list">
            <h3>
              <FontAwesomeIcon icon={faUserFriends} /> Your Trainees
            </h3>
            <div className="trainee-cards">
              {trainees.map((trainee) => (
                <div
                  key={trainee.id}
                  className={`trainee-card ${
                    selectedTrainee && selectedTrainee.id === trainee.id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => setSelectedTrainee(trainee)}
                >
                  <div className="trainee-name">{trainee.name}</div>
                  <div className="trainee-since">
                    Member since{" "}
                    {new Date(trainee.partnershipStart).toLocaleDateString()}
                  </div>
                  <div className="trainee-email">{trainee.email}</div>
                </div>
              ))}
            </div>
          </div>

          {selectedTrainee && (
            <div className="trainee-details">
              <div className="trainee-profile">
                <h2>{selectedTrainee.name}&apos;s Profile</h2>

                <div className="trainee-actions">
                  <button
                    className="terminate-btn"
                    onClick={() =>
                      handlePartnershipStatusChange(
                        selectedTrainee.partnershipId,
                        "terminated"
                      )
                    }
                  >
                    End Partnership
                  </button>
                </div>
              </div>

              <div className="trainee-sections">
                <div className="trainee-section">
                  <h3>
                    <FontAwesomeIcon icon={faClock} /> Partnership Length
                  </h3>

                  {selectedTrainee.partnershipStart ? (
                    <div className="partnership-details">
                      <div className="partnership-date">
                        <span className="date-label">Start Date:</span>
                        <span className="date-value">
                          {new Date(
                            selectedTrainee.partnershipStart
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {selectedTrainee.partnershipEnd && (
                        <div className="partnership-date">
                          <span className="date-label">End Date:</span>
                          <span className="date-value">
                            {new Date(
                              selectedTrainee.partnershipEnd
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="no-data-message">
                      Partnership information not available.
                    </p>
                  )}

                  <button className="schedule-btn">Schedule New Session</button>
                </div>

                <div className="trainee-section">
                  <h3>
                    <FontAwesomeIcon icon={faChartLine} /> Goals & Progress
                  </h3>

                  <div className="goals-list">
                    {selectedTrainee.goals.map((goal, index) => (
                      <div key={index} className="goal-item">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="goal-icon"
                        />
                        <span>{goal}</span>
                      </div>
                    ))}
                  </div>

                  <h3 className="section-title" style={{ marginTop: "20px" }}>
                    <FontAwesomeIcon icon={faDumbbell} /> Your Assigned Workouts
                  </h3>

                  {loadingWorkouts ? (
                    <div className="loading-spinner">Loading workouts...</div>
                  ) : trainerCreatedWorkouts.length > 0 ? (
                    trainerCreatedWorkouts.map((workout) => (
                      <div key={workout.id} className="trainee-workout">
                        <div className="workout-name">
                          {workout.workout_name}
                        </div>
                        <div className="workout-detail">
                          {workout.workout_type} • {workout.workout_level} •{" "}
                          {workout.workout_duration} min
                        </div>
                        <div className="workout-detail">
                          Created on{" "}
                          {new Date(workout.createdAt).toLocaleDateString()}
                        </div>
                        <div className="workout-actions">
                          <button
                            className="add-exercise-btn"
                            onClick={() => {
                              setSelectedWorkout(workout);
                              setShowAddExerciseModal(true);
                            }}
                          >
                            Add Exercise
                          </button>
                          <button
                            className="view-exercises-btn"
                            onClick={() => handleViewExercises(workout)}
                          >
                            View Exercises
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-workouts-message">
                      <p>No workouts assigned to this trainee yet.</p>
                    </div>
                  )}

                  <h3 className="section-title" style={{ marginTop: "20px" }}>
                    <FontAwesomeIcon icon={faDumbbell} /> Trainee&apos;s Own
                    Workouts
                  </h3>

                  {loadingWorkouts ? (
                    <div className="loading-spinner">Loading workouts...</div>
                  ) : traineeCreatedWorkouts.length > 0 ? (
                    traineeCreatedWorkouts.map((workout) => (
                      <div
                        key={workout.id}
                        className="trainee-workout trainee-created"
                      >
                        <div className="workout-name">
                          {workout.workout_name}
                        </div>
                        <div className="workout-detail">
                          {workout.workout_type} • {workout.workout_level} •{" "}
                          {workout.workout_duration} min
                        </div>
                        <div className="workout-detail">
                          Created on{" "}
                          {new Date(workout.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-workouts-message">
                      <p>Trainee hasn&apos;t created any workouts yet.</p>
                    </div>
                  )}

                  <div className="workout-actions">
                    <button
                      className="create-btn"
                      onClick={() => setShowCreateWorkoutModal(true)}
                    >
                      <FontAwesomeIcon icon={faPlusCircle} /> Create New Workout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Workout Modal */}
      {showCreateWorkoutModal && (
        <div className="modal-overlay">
          <div className="modal-content workout-modal">
            <div className="modal-header">
              <h3>Create Workout for {selectedTrainee.name}</h3>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setShowCreateWorkoutModal(false);
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
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {createSuccess ? (
                <div className="success-message">{createSuccess}</div>
              ) : (
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
              )}
            </div>

            <div className="modal-footer">
              {!createSuccess && (
                <>
                  <button
                    onClick={() => setShowCreateWorkoutModal(false)}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateWorkoutForTrainee}
                    className="btn-create"
                    disabled={!newWorkout.workout_name}
                  >
                    Create Workout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      {showAddExerciseModal && (
        <div className="modal-overlay">
          <div className="modal-content exercise-modal">
            <div className="modal-header">
              <h3>
                Add Exercise to{" "}
                {selectedWorkout ? selectedWorkout.workout_name : ""}
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setShowAddExerciseModal(false);
                  setSelectedWorkout(null);
                  setNewExercise({
                    exercise_name: "",
                    sets: 3,
                    reps: 10,
                    work_time: 45,
                    rest_time: 15,
                    rest_between: 60,
                  });
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {exerciseSuccess ? (
                <div className="success-message">{exerciseSuccess}</div>
              ) : (
                <div className="create-exercise-form">
                  <div className="form-group">
                    <label htmlFor="exercise_name">Exercise Name</label>
                    <input
                      type="text"
                      id="exercise_name"
                      value={newExercise.exercise_name}
                      onChange={(e) =>
                        setNewExercise({
                          ...newExercise,
                          exercise_name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label htmlFor="sets">Sets</label>
                      <input
                        type="number"
                        id="sets"
                        value={newExercise.sets}
                        onChange={(e) =>
                          setNewExercise({
                            ...newExercise,
                            sets: parseInt(e.target.value),
                          })
                        }
                        min="1"
                        required
                      />
                    </div>

                    <div className="form-group half">
                      <label htmlFor="reps">Reps</label>
                      <input
                        type="number"
                        id="reps"
                        value={newExercise.reps}
                        onChange={(e) =>
                          setNewExercise({
                            ...newExercise,
                            reps: parseInt(e.target.value),
                          })
                        }
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label htmlFor="work_time">Work Time (sec)</label>
                      <input
                        type="number"
                        id="work_time"
                        value={newExercise.work_time}
                        onChange={(e) =>
                          setNewExercise({
                            ...newExercise,
                            work_time: parseInt(e.target.value),
                          })
                        }
                        min="1"
                      />
                    </div>

                    <div className="form-group half">
                      <label htmlFor="rest_time">Rest Time (sec)</label>
                      <input
                        type="number"
                        id="rest_time"
                        value={newExercise.rest_time}
                        onChange={(e) =>
                          setNewExercise({
                            ...newExercise,
                            rest_time: parseInt(e.target.value),
                          })
                        }
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="rest_between">
                      Rest Between Sets (sec)
                    </label>
                    <input
                      type="number"
                      id="rest_between"
                      value={newExercise.rest_between}
                      onChange={(e) =>
                        setNewExercise({
                          ...newExercise,
                          rest_between: parseInt(e.target.value),
                        })
                      }
                      min="1"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {!exerciseSuccess && (
                <>
                  <button
                    onClick={() => setShowAddExerciseModal(false)}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddExerciseToWorkout}
                    className="btn-create"
                    disabled={!newExercise.exercise_name}
                  >
                    Add Exercise
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Exercises Modal */}
      {showExercisesModal && selectedWorkout && (
        <div className="modal-overlay">
          <div className="modal-content exercise-list-modal">
            <div className="modal-header">
              <h3>Exercises for {selectedWorkout.workout_name}</h3>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setShowExercisesModal(false);
                  setSelectedWorkout(null);
                  setExercises([]);
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {loadingExercises ? (
                <div className="loading-spinner">Loading exercises...</div>
              ) : exercises.length > 0 ? (
                <div className="exercises-list">
                  {exercises.map((exercise) => (
                    <div key={exercise.id} className="exercise-item">
                      <div className="exercise-details">
                        <div className="exercise-name">
                          {exercise.exercise_name}
                        </div>
                        <div className="exercise-stats">
                          <span>{exercise.sets} sets</span> •{" "}
                          <span>{exercise.reps} reps</span>
                          {exercise.work_time && (
                            <>
                              {" "}
                              • <span>{exercise.work_time}s work</span>
                            </>
                          )}
                          {exercise.rest_time && (
                            <>
                              {" "}
                              • <span>{exercise.rest_time}s rest</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="exercise-actions">
                        <button
                          className="delete-exercise-btn"
                          onClick={() => handleDeleteExercise(exercise.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-exercises-message">
                  <p>No exercises added to this workout yet.</p>
                </div>
              )}

              <div className="modal-footer">
                <button
                  className="add-exercise-btn"
                  onClick={() => {
                    setShowExercisesModal(false);
                    setShowAddExerciseModal(true);
                  }}
                >
                  Add New Exercise
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => setShowExercisesModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YourTrainees;
