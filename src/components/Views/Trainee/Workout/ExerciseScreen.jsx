import { useState } from "react";
import PropTypes from "prop-types"; // Import PropTypes
import "./Workout.css";

const ExerciseScreen = ({
  exercise,
  onComplete,
  exerciseNumber,
  totalExercises,
}) => {
  const [currentSet, setCurrentSet] = useState(1);

  const handleSetComplete = () => {
    if (currentSet < exercise.sets) {
      setCurrentSet(currentSet + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="exercise-screen">
      <h2>{exercise.exercise_name}</h2>

      <div className="exercise-details">
        {exercise.sets > 1 ? (
          <div className="set-counter">
            Set {currentSet} of {exercise.sets}
          </div>
        ) : null}

        <div className="exercise-instructions">
          {exercise.reps ? (
            <div className="reps">{exercise.reps} reps</div>
          ) : (
            <div className="timing">
              {exercise.work_time} work / {exercise.rest_time} rest
            </div>
          )}
        </div>
      </div>

      <button className="btn-complete-set" onClick={handleSetComplete}>
        {currentSet < exercise.sets ? "Complete Set" : "Complete Exercise"}
      </button>

      <div className="exercise-position">
        Exercise {exerciseNumber} of {totalExercises}
      </div>
    </div>
  );
};

// PropTypes validation
ExerciseScreen.propTypes = {
  exercise: PropTypes.shape({
    exercise_name: PropTypes.string.isRequired,
    sets: PropTypes.number.isRequired,
    reps: PropTypes.number, // Optional
    work_time: PropTypes.number, // Optional
    rest_time: PropTypes.number, // Optional
  }).isRequired,
  onComplete: PropTypes.func.isRequired,
  exerciseNumber: PropTypes.number.isRequired,
  totalExercises: PropTypes.number.isRequired,
};

export default ExerciseScreen;
