import PropTypes from "prop-types";
import "./Workout.css";

// Font Awesome imports
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChampagneGlasses,
  faDumbbell,
  faFire,
} from "@fortawesome/free-solid-svg-icons";

const WorkoutComplete = ({ workout, onFinish }) => {
  return (
    <div className="workout-complete">
      <div className="completion-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="50"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <h2>Workout Complete!</h2>
      <div className="completion-details">
        <div className="detail-item">
          <FontAwesomeIcon icon={faChampagneGlasses} className="detail-icon" />
          <span>
            You completed: <strong>{workout.workout_name}</strong>
          </span>
        </div>
        <div className="detail-item">
          <FontAwesomeIcon icon={faDumbbell} className="detail-icon" />
          <span>{workout.exercises.length} exercises completed</span>
        </div>
        <div className="detail-item">
          <FontAwesomeIcon icon={faFire} className="detail-icon" />
          <span>
            <strong>{workout.workout_calories}</strong> calories burned
          </span>
        </div>
      </div>
      <button className="btn-finish" onClick={onFinish}>
        Back to Dashboard
      </button>
    </div>
  );
};

WorkoutComplete.propTypes = {
  workout: PropTypes.shape({
    workout_name: PropTypes.string.isRequired,
    exercises: PropTypes.arrayOf(PropTypes.object).isRequired,
    workout_calories: PropTypes.number.isRequired,
  }).isRequired,
  onFinish: PropTypes.func.isRequired,
};

export default WorkoutComplete;
