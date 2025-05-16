import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ExerciseScreen from "./ExerciseScreen";
import RestTimer from "./RestTimer";
import CustomRestTimer from "./CustomRestTimer";
import WorkoutComplete from "./WorkoutComplete";
import CircularTimer from "./CircularTimer";
import "./Workout.css";
import "./ActiveWorkout.css";

const ActiveWorkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const [isUserWorkout, setIsUserWorkout] = useState(false);
  // New states for set-based timer
  const [currentSet, setCurrentSet] = useState(1);
  const [timerKey, setTimerKey] = useState(0);

  useEffect(() => {
    const fetchWorkoutDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to find the workout in different sources
        const token = localStorage.getItem('token');
        let workoutData = null;
        
        // First try as a trainee workout if user is logged in
        if (token) {
          try {
            const traineeResponse = await axios.get(
              `${apiUrl}/trainee/workouts/${id}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            
            if (traineeResponse.data && traineeResponse.data.success) {
              workoutData = traineeResponse.data.data;
              setIsUserWorkout(true);
              console.log("Found trainee workout:", workoutData);
            }
          } catch (err) {
            console.log("Not a trainee workout or not authorized:", err.message);
            // Continue to try regular workout
          }
        }
        
        // If not found as trainee workout, try regular workout
        if (!workoutData) {
          try {
            const regularResponse = await axios.get(
              `${apiUrl}/workouts/workouts/${id}`
            );
            
            if (regularResponse.data) {
              workoutData = regularResponse.data;
              setIsUserWorkout(false);
              console.log("Found regular workout:", workoutData);
            }
          } catch (err) {
            console.error("Error fetching regular workout:", err);
            setError("Workout not found");
          }
        }
        
        if (workoutData) {
          // Ensure exercises is an array
          if (!workoutData.exercises) {
            workoutData.exercises = [];
          }
          
          // Check if the workout has any exercises
          if (workoutData.exercises.length === 0) {
            setError("This workout doesn't have any exercises. Please add exercises before starting the workout.");
          } else {
            setWorkout(workoutData);
            setWorkoutStartTime(new Date());
          }
        } else {
          setError("Unable to find workout");
        }
      } catch (error) {
        console.error("Error fetching workout details:", error);
        setError("Failed to load workout");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutDetails();
  }, [id]);

  // Reset set and timerKey when exercise changes
  useEffect(() => {
    setCurrentSet(1);
    setTimerKey(prev => prev + 1);
  }, [currentExerciseIndex]);

  // Update workout duration every minute
  useEffect(() => {
    if (!workoutStartTime || workoutComplete) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((new Date() - workoutStartTime) / 60000);
      setWorkoutDuration(elapsed);
    }, 60000);

    return () => clearInterval(interval);
  }, [workoutStartTime, workoutComplete]);

  // Set-based timer complete handler
  const handleTimerComplete = () => {
    if (currentSet < (workout.exercises[currentExerciseIndex].sets || 1)) {
      setCurrentSet(currentSet + 1);
      setTimerKey(prev => prev + 1);
    } else {
      setCurrentSet(1);
      handleExerciseComplete();
    }
  };

  const handleExerciseComplete = () => {
    if (!workout || !workout.exercises || workout.exercises.length === 0) {
      setError("No exercises found in this workout");
      return;
    }

    const nextExerciseIndex = currentExerciseIndex + 1;

    if (nextExerciseIndex < workout.exercises.length) {
      // Get rest time from the current exercise
      const currentExercise = workout.exercises[currentExerciseIndex];
      const restSeconds = currentExercise.rest_between || 60;

      setRestTime(restSeconds);
      setIsResting(true);
    } else {
      // All exercises completed
      const completionTime = new Date() - workoutStartTime;
      const minutes = Math.floor(completionTime / 60000);

      // Record workout completed if needed
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // Different endpoints for user workouts vs. featured workouts
          const endpoint = isUserWorkout
            ? "${apiUrl}/trainee/workout-history"
            : "${apiUrl}/workouts/workout-history";
          
          axios.post(endpoint, {
            workoutId: workout.id,
            completionTime: minutes || workoutDuration, // Use tracked duration as fallback
            date: new Date().toISOString(),
          }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }).catch((error) =>
            console.error("Error saving workout history:", error)
          );
        }
      } catch (error) {
        console.error("Error saving workout history:", error);
      }

      setWorkoutComplete(true);
    }
  };

  const handleRestComplete = () => {
    setIsResting(false);
    setCurrentExerciseIndex((prevIndex) => prevIndex + 1);
  };

  const handleFinishWorkout = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return <div className="loading-container">Loading workout...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate(-1)} className="btn-go-back">
          Go Back
        </button>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="error-container">
        <div className="error-message">Workout not found</div>
        <button onClick={() => navigate(-1)} className="btn-go-back">
          Go Back
        </button>
      </div>
    );
  }

  if (!workout.exercises || workout.exercises.length === 0) {
    return (
      <div className="error-container">
        <div className="error-message">
          This workout doesn&apos;t have any exercises. Please add exercises before starting.
        </div>
        <button 
          onClick={() => navigate(`/workout/${id}`)} 
          className="btn-go-back"
        >
          Go to Workout Details
        </button>
      </div>
    );
  }

  if (workoutComplete) {
    return (
      <WorkoutComplete
        workout={{
          ...workout,
          workout_duration: workoutDuration, // Pass tracked duration to completion screen
        }}
        onFinish={handleFinishWorkout}
      />
    );
  }

  // Guard against invalid current exercise index
  if (currentExerciseIndex >= workout.exercises.length) {
    setCurrentExerciseIndex(0);
    return <div className="loading-container">Adjusting workout progress...</div>;
  }

  const currentExercise = workout.exercises[currentExerciseIndex];
  
  // Additional safety check for currentExercise
  if (!currentExercise) {
    return (
      <div className="error-container">
        <div className="error-message">
          There was a problem with the current exercise. Please try again.
        </div>
        <button onClick={() => navigate(-1)} className="btn-go-back">
          Go Back
        </button>
      </div>
    );
  }
  
  const progress = (
    (currentExerciseIndex / workout.exercises.length) *
    100
  ).toFixed(0);

  // Check if we have a next exercise (for rest timer)
  const hasNextExercise = currentExerciseIndex + 1 < workout.exercises.length;
  const nextExerciseName = hasNextExercise 
    ? workout.exercises[currentExerciseIndex + 1].exercise_name 
    : "";

  return (
    <div className="active-workout-container">
      <div className="workout-progress">
        <h3>{workout.workout_name}</h3>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="progress-text">
          {currentExerciseIndex + 1} of {workout.exercises.length} exercises (
          {progress}% complete)
          {workoutDuration > 0 && (
            <span className="workout-time">{workoutDuration} min</span>
          )}
        </div>
      </div>

      {isResting ? (
        hasNextExercise ? (
          <RestTimer
            seconds={restTime}
            nextExercise={nextExerciseName}
            onComplete={handleRestComplete}
          />
        ) : (
          <CustomRestTimer
            seconds={restTime}
            onComplete={handleRestComplete}
          />
        )
      ) : (
        currentExercise.work_time ? (
          <CircularTimer
            key={timerKey}
            duration={currentExercise.work_time}
            onComplete={handleTimerComplete}
            onNext={handleTimerComplete}
            label={`Set ${currentSet} of ${currentExercise.sets || 1}`}
          />
      ) : (
        <ExerciseScreen
          exercise={currentExercise}
          onComplete={handleExerciseComplete}
          exerciseNumber={currentExerciseIndex + 1}
          totalExercises={workout.exercises.length}
        />
        )
      )}
    </div>
  );
};

export default ActiveWorkout;
