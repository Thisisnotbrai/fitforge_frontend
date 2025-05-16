import PropTypes from "prop-types"; // Import PropTypes
import "./WorkoutModal.css";

const WorkoutModal = ({
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  workout,
}) => {
  // Calculate difficulty level color
  const getLevelColor = (level) => {
    if (!level) return "#e74c3c";

    switch (level.toLowerCase()) {
      case "beginner":
        return "#27ae60";
      case "intermediate":
        return "#f39c12";
      case "advanced":
        return "#e74c3c";
      default:
        return "#e74c3c";
    }
  };

  return (
    <div className="workoutmodal-overlay">
      <div className="workoutmodal-content">
        <button className="workoutmodal-close" onClick={onCancel}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="24"
            height="24"
          >
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>

        <div className="workoutmodal-container">
          <div
            className="workoutmodal-left"
            style={{
              background: "linear-gradient(135deg, #e74c3c, #c0392b)",
            }}
          >
            <div className="workoutmodal-graphic-wrapper">
              <div className="workoutmodal-graphic">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="54"
                  height="54"
                >
                  <path d="M4 22V8h2v14H4zm7 0V2h2v20h-2zm7 0v-8h2v8h-2z" />
                </svg>
              </div>
              <div className="workoutmodal-pulse"></div>
            </div>

            <div className="workoutmodal-button-container">
              <button className="workoutmodal-start-btn" onClick={onConfirm}>
                {confirmText}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="24"
                  height="24"
                  className="workoutmodal-btn-icon"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="workoutmodal-right">
            <div className="workoutmodal-details">
              <h2 className="workoutmodal-heading">
                {workout ? "YOU'RE ABOUT TO BEGIN:" : "Loading workout..."}
              </h2>

              {workout && (
                <>
                  <h1 className="workoutmodal-title">{workout.workout_name}</h1>

                  <div className="workoutmodal-tags">
                    <div className="workoutmodal-type-tag">
                      {workout.workout_type}
                    </div>
                    {workout.workout_level && (
                      <div
                        className="workoutmodal-level-tag"
                        style={{
                          backgroundColor: getLevelColor(workout.workout_level),
                        }}
                      >
                        {workout.workout_level}
                      </div>
                    )}
                  </div>

                  <div className="workoutmodal-metrics">
                    <div className="workoutmodal-metric">
                      <div className="workoutmodal-icon-container">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          width="22"
                          height="22"
                        >
                          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                        </svg>
                      </div>
                      <div className="workoutmodal-metric-info">
                        <span className="workoutmodal-metric-value">
                          {workout.workout_duration}
                        </span>
                        <span className="workoutmodal-metric-label">MIN</span>
                      </div>
                    </div>
                    <div className="workoutmodal-metric">
                      <div className="workoutmodal-icon-container">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          width="22"
                          height="22"
                        >
                          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                        </svg>
                      </div>
                      <div className="workoutmodal-metric-info">
                        <span className="workoutmodal-metric-value">
                          {workout.workout_calories}
                        </span>
                        <span className="workoutmodal-metric-label">KCAL</span>
                      </div>
                    </div>
                    <div className="workoutmodal-metric">
                      <div className="workoutmodal-icon-container">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          width="22"
                          height="22"
                        >
                          <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" />
                        </svg>
                      </div>
                      <div className="workoutmodal-metric-info">
                        <span className="workoutmodal-metric-value">
                          {workout.exercises?.length || 0}
                        </span>
                        <span className="workoutmodal-metric-label">
                          EXERCISES
                        </span>
                      </div>
                    </div>
                  </div>

                  {message && <p className="workoutmodal-message">{message}</p>}

                  {workout.exercises && workout.exercises.length > 0 && (
                    <div className="workoutmodal-first-exercise">
                      <div className="workoutmodal-exercise-heading">
                        FIRST EXERCISE:
                      </div>
                      <div className="workoutmodal-exercise-name">
                        {workout.exercises[0].exercise_name}
                      </div>
                      <div className="workoutmodal-exercise-details">
                        {workout.exercises[0].sets && (
                          <span>{workout.exercises[0].sets} sets</span>
                        )}
                        {workout.exercises[0].reps && (
                          <span>{workout.exercises[0].reps} reps</span>
                        )}
                        {workout.exercises[0].work_time && (
                          <span>
                            {workout.exercises[0].work_time}s work /{" "}
                            {workout.exercises[0].rest_time}s rest
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              <button className="workoutmodal-cancel" onClick={onCancel}>
                {cancelText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Define prop types
WorkoutModal.propTypes = {
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string.isRequired,
  cancelText: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  workout: PropTypes.object,
};

export default WorkoutModal;
