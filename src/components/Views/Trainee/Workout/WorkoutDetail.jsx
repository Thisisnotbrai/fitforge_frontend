import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PropTypes from 'prop-types';
import Modal from "../../../WorkoutModal";
import "./Workout.css";

// Number Input component for better UI
const NumberInput = ({ value, onChange, min = 1, name, label }) => {
  const handleDecrease = () => {
    if (value > min) {
      onChange({ target: { name, value: value - 1 } });
    }
  };

  const handleIncrease = () => {
    onChange({ target: { name, value: value + 1 } });
  };

  const handleChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min) {
      onChange({ target: { name, value: newValue } });
    }
  };

  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <div className="number-input-control">
        <button type="button" className="number-input-btn" onClick={handleDecrease}>-</button>
        <input
          type="number"
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          min={min}
        />
        <button type="button" className="number-input-btn" onClick={handleIncrease}>+</button>
      </div>
    </div>
  );
};

// Add prop validation
NumberInput.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired
};

const WorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [isUserWorkout, setIsUserWorkout] = useState(false);
  const [newExercise, setNewExercise] = useState({
    exercise_name: "",
    sets: 3,
    reps: 10,
    work_time: 45,
    rest_time: 15,
    rest_between: 60,
  });
  const [editingExerciseId, setEditingExerciseId] = useState(null);
  const [useTimerMode, setUseTimerMode] = useState(false);

  useEffect(() => {
    const fetchWorkoutDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if this is a trainee workout by trying to get it with authorization
        const token = localStorage.getItem('token');
        let workoutData = null;
        
        if (token) {
          try {
            // First try to get it as a trainee workout
            const traineeWorkoutResponse = await axios.get(
              `http://localhost:3000/trainee/workouts/${id}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            
            if (traineeWorkoutResponse.data && traineeWorkoutResponse.data.success) {
              workoutData = traineeWorkoutResponse.data.data;
              setIsUserWorkout(true);
              console.log("Found trainee workout:", workoutData);
            }
          } catch (err) {
            console.log("Not a trainee workout or not authorized:", err.message);
            // Ignore this error and try regular workout
          }
        }
        
        // If not found as trainee workout, try regular workout
        if (!workoutData) {
          const regularResponse = await axios.get(
            `http://localhost:3000/workouts/workouts/${id}`
          );
          
          workoutData = regularResponse.data;
          setIsUserWorkout(false);
          console.log("Found regular workout:", workoutData);
        }
        
        // Process workoutData into consistent format
        if (workoutData) {
          // Make sure exercises exists and is an array
          if (!workoutData.exercises) {
            workoutData.exercises = [];
          }
          
          setWorkout(workoutData);
        } else {
          setError("Unable to find workout");
        }
      } catch (error) {
        console.error("Error fetching workout details:", error);
        setError("Failed to load workout details");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutDetails();
  }, [id]);

  const handleStartWorkout = () => {
    setShowModal(true);
  };

  const confirmStartWorkout = () => {
    setShowModal(false);
    navigate(`/workout/${id}/active`);
  };

  const handleAddExercise = () => {
    setShowExerciseModal(true);
  };

  const handleExerciseInputChange = (e) => {
    const { name, value } = e.target;
    setNewExercise({
      ...newExercise,
      [name]: name === 'exercise_name' ? value : parseInt(value, 10) || 0
    });
  };

  const handleSaveExercise = async () => {
    try {
      if (!newExercise.exercise_name) {
        alert("Exercise name is required");
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        alert("You must be logged in to add exercises");
        return;
      }

      // Add the workout_id to the exercise
      const exerciseToAdd = {
        ...newExercise,
        workout_id: workout.id
      };

      console.log("Sending exercise data:", exerciseToAdd);

      const response = await axios.post(
        `http://localhost:3000/exercises/create`,
        exerciseToAdd,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        // Log the response to check what we're getting back
        console.log("Exercise created:", response.data);
        
        // Add the new exercise to the workout
        const updatedWorkout = {
          ...workout,
          exercises: [...workout.exercises, response.data]
        };
        setWorkout(updatedWorkout);
        
        // Reset form and close modal
        setNewExercise({
          exercise_name: "",
          sets: 3,
          reps: 10,
          work_time: 45,
          rest_time: 15,
          rest_between: 60,
        });
        setShowExerciseModal(false);
      }
    } catch (error) {
      console.error("Error adding exercise:", error);
      alert(`Failed to add exercise: ${error.response?.data?.message || error.message}. Please check the console for details.`);
    }
  };

  const handleDeleteExercise = async (exerciseId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("You must be logged in to delete exercises");
        return;
      }

      const confirmed = window.confirm("Are you sure you want to delete this exercise?");
      if (!confirmed) return;

      const response = await axios.delete(
        `http://localhost:3000/exercises/${exerciseId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.success) {
        // Remove the exercise from the workout
        const updatedWorkout = {
          ...workout,
          exercises: workout.exercises.filter(ex => ex.id !== exerciseId)
        };
        setWorkout(updatedWorkout);
      }
    } catch (error) {
      console.error("Error deleting exercise:", error);
      alert(`Failed to delete exercise: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUpdateExercise = async () => {
    try {
      if (!newExercise.exercise_name) {
        alert("Exercise name is required");
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        alert("You must be logged in to update exercises");
        return;
      }

      const response = await axios.put(
        `http://localhost:3000/exercises/${editingExerciseId}`,
        newExercise,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        // Log the response to check what we're getting back
        console.log("Exercise updated:", response.data);
        
        // Update the exercise in the workout
        const updatedWorkout = {
          ...workout,
          exercises: workout.exercises.map(ex =>
            ex.id === editingExerciseId ? response.data : ex
          )
        };
        setWorkout(updatedWorkout);
        
        // Reset form and close modal
        setNewExercise({
          exercise_name: "",
          sets: 3,
          reps: 10,
          work_time: 45,
          rest_time: 15,
          rest_between: 60,
        });
        setEditingExerciseId(null);
        setShowExerciseModal(false);
      }
    } catch (error) {
      console.error("Error updating exercise:", error);
      alert(`Failed to update exercise: ${error.response?.data?.message || error.message}`);
    }
  };

  if (loading)
    return <div className="loading-container">Loading workout details...</div>;
  if (error) 
    return <div className="error-container">{error}</div>;
  if (!workout) 
    return <div className="error-container">Workout not found</div>;

  return (
    <div className="workout-detail">
      <div className="workout-header">
        <div className="workout-header-content">
          <div className="workout-metadata">
            <div className="workout-tag">{workout.workout_type}</div>
            <div className="workout-level-indicator">{workout.workout_level}</div>
            {workout.user_id && (
              <div className="workout-creator">
                <span>Custom workout</span>
              </div>
            )}
          </div>
          <h2>{workout.workout_name}</h2>
          <div className="workout-specs">
            <div className="workout-spec-item">
              <i className="workout-spec-icon duration-icon"></i>
              <span>{workout.workout_duration} min</span>
            </div>
            <div className="workout-spec-item">
              <i className="workout-spec-icon calories-icon"></i>
              <span>{workout.workout_calories} cal</span>
            </div>
            <div className="workout-spec-item">
              <i className="workout-spec-icon level-icon"></i>
              <span>{workout.workout_level}</span>
            </div>
          </div>
        </div>
        
        {workout.description && (
          <div className="workout-description">
            <h3>Description</h3>
            <p>{workout.description}</p>
          </div>
        )}
      </div>

      <div className="workout-actions-container">
        <button className="btn-start-workout" onClick={handleStartWorkout}>
          <i className="start-icon"></i>
          Start Workout
        </button>
      </div>

      <div className="exercises-section">
        <div className="exercises-header">
          <div className="exercises-title">
            <h3>
              Exercises
              <span className="exercise-count">{workout.exercises.length || 0}</span>
            </h3>
            <p className="exercises-subtitle">Complete all exercises in sequence for best results</p>
          </div>
          
          {isUserWorkout && (
            <button 
              className="btn-add-exercise-header" 
              onClick={handleAddExercise}
            >
              <span className="icon">+</span> Add Exercise
            </button>
          )}
        </div>
        
        {workout.exercises && workout.exercises.length > 0 ? (
          <div className="exercise-list">
            {workout.exercises.map((exercise, index) => (
              <div key={exercise.id || index} className="exercise-item">
                <div className="exercise-number">{index + 1}</div>
                <div className="exercise-info">
                  <h4>{exercise.exercise_name}</h4>
                  <div className="exercise-details">
                    <span className="exercise-detail-item">
                      <i className="exercise-icon sets-icon"></i>
                      {exercise.sets || "1"} sets
                    </span>
                    {exercise.reps ? (
                      <span className="exercise-detail-item">
                        <i className="exercise-icon reps-icon"></i>
                        {exercise.reps} reps
                      </span>
                    ) : exercise.work_time ? (
                      <span className="exercise-detail-item">
                        <i className="exercise-icon timer-icon"></i>
                        {exercise.work_time}s work / {exercise.rest_time}s rest
                      </span>
                    ) : (
                      <span className="exercise-detail-item">No details available</span>
                    )}
                    {exercise.rest_between && (
                      <span className="exercise-detail-item">
                        <i className="exercise-icon rest-icon"></i>
                        {exercise.rest_between}s between sets
                      </span>
                    )}
                  </div>
                </div>
                {isUserWorkout && (
                  <div className="exercise-actions">
                    <button 
                      className="btn-edit-exercise"
                      aria-label="Edit exercise"
                      onClick={() => {
                        setNewExercise({
                          exercise_name: exercise.exercise_name,
                          sets: exercise.sets || 3,
                          reps: exercise.reps || 10,
                          work_time: exercise.work_time || 45,
                          rest_time: exercise.rest_time || 15,
                          rest_between: exercise.rest_between || 60,
                        });
                        setEditingExerciseId(exercise.id);
                        setUseTimerMode(!!exercise.work_time);
                        setShowExerciseModal(true);
                      }}
                    >
                      <span className="edit-icon">✎</span>
                    </button>
                    <button 
                      className="btn-delete-exercise"
                      aria-label="Delete exercise"
                      onClick={() => handleDeleteExercise(exercise.id)}
                    >
                      <span className="delete-icon">×</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-exercises">
            <div className="empty-state-icon"></div>
            <h4>No exercises found</h4>
            <p>This workout doesn&apos;t have any exercises yet.</p>
            {isUserWorkout && (
              <div className="empty-state-action">
                <button 
                  className="btn-add-exercise-empty" 
                  onClick={handleAddExercise}
                >
                  <span className="icon">+</span> Add Your First Exercise
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <Modal
          message={`Are you ready to start this workout?`}
          confirmText="START WORKOUT"
          cancelText="Cancel"
          onConfirm={confirmStartWorkout}
          onCancel={() => setShowModal(false)}
          workout={workout}
        />
      )}

      {/* Add Exercise Modal */}
      {showExerciseModal && (
        <div className="modal-overlay">
          <div className="modal-content exercise-modal">
            <div className="modal-header">
              <h3>
                {editingExerciseId ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit Exercise
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="16"></line>
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                    Add Exercise
                  </>
                )}
              </h3>
              <button 
                className="modal-close-btn"
                onClick={() => {
                  setShowExerciseModal(false);
                  setEditingExerciseId(null);
                  setNewExercise({
                    exercise_name: "",
                    sets: 3,
                    reps: 10,
                    work_time: 45,
                    rest_time: 15,
                    rest_between: 60,
                  });
                  setUseTimerMode(false);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="exercise_name">Exercise Name<span className="required">*</span></label>
                <input
                  type="text"
                  id="exercise_name"
                  name="exercise_name"
                  value={newExercise.exercise_name}
                  onChange={handleExerciseInputChange}
                  placeholder="e.g., Push-ups, Squats"
                  required
                  autoFocus
                />
              </div>

              <div className="form-section">
                <h4 className="form-section-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                  </svg>
                  Set & Repetition Details
                </h4>
                
                <div className="form-row">
                  <NumberInput
                    name="sets"
                    label="Sets"
                    value={newExercise.sets}
                    onChange={handleExerciseInputChange}
                    min={1}
                  />

                  <NumberInput
                    name="reps"
                    label="Reps per Set"
                    value={newExercise.reps}
                    onChange={handleExerciseInputChange}
                    min={1}
                  />
                </div>
              </div>

              <div className="exercise-timer-toggle">
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="use-timer"
                    checked={useTimerMode} 
                    onChange={() => setUseTimerMode(!useTimerMode)} 
                  />
                  <label htmlFor="use-timer" className="toggle-label"></label>
                </div>
                <div className="toggle-text">
                  <span className="toggle-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    Timed Exercise
                  </span>
                  <span className="toggle-description">Enable for HIIT, circuit training, or timed intervals</span>
                </div>
              </div>

              {useTimerMode && (
                <div className="form-section timer-settings">
                  <h4 className="form-section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    Timer Settings
                  </h4>
                  <div className="form-row">
                    <NumberInput
                      name="work_time"
                      label="Work Time (sec)"
                      value={newExercise.work_time}
                      onChange={handleExerciseInputChange}
                      min={1}
                    />

                    <NumberInput
                      name="rest_time"
                      label="Rest Time (sec)"
                      value={newExercise.rest_time}
                      onChange={handleExerciseInputChange}
                      min={1}
                    />
                  </div>
                </div>
              )}

              <div className="form-section">
                <h4 className="form-section-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"></path>
                    <path d="M2 20h20"></path>
                    <path d="M14 12v.01"></path>
                  </svg>
                  Rest Period
                </h4>
                <NumberInput
                  name="rest_between"
                  label="Rest Between Sets (sec)"
                  value={newExercise.rest_between}
                  onChange={handleExerciseInputChange}
                  min={1}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                onClick={() => {
                  setShowExerciseModal(false);
                  setEditingExerciseId(null);
                  setNewExercise({
                    exercise_name: "",
                    sets: 3,
                    reps: 10,
                    work_time: 45,
                    rest_time: 15,
                    rest_between: 60,
                  });
                  setUseTimerMode(false);
                }} 
                className="btn-cancel"
              >
                Cancel
              </button>
              <button 
                onClick={editingExerciseId ? handleUpdateExercise : handleSaveExercise} 
                className="btn-add-workout"
              >
                {editingExerciseId ? 'Update Exercise' : 'Add Exercise'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutDetail;
