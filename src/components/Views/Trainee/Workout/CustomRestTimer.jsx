import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./RestTimer.css";

const CustomRestTimer = ({ seconds, onComplete, isPaused = false }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isAnimating, setIsAnimating] = useState(false);
  const [internalPaused, setInternalPaused] = useState(isPaused);

  // Reset timer when seconds prop changes
  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  // Update internal pause state when prop changes
  useEffect(() => {
    setInternalPaused(isPaused);
  }, [isPaused]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onComplete) onComplete();
      return;
    }

    // Don't run timer if paused
    if (internalPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete, internalPaused]);

  // Format time to display minutes and seconds if needed
  const formatTime = (time) => {
    if (time < 60) return `${time}`;

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Calculate progress percentage for the circular progress
  const calculateProgress = () => {
    return ((seconds - timeLeft) / seconds) * 100;
  };

  const handleTogglePause = () => {
    setInternalPaused(prev => !prev);
  };

  const handleReset = () => {
    setTimeLeft(seconds);
  };

  return (
    <div className="rest-timer-section">
      <h3>Rest Timer</h3>
      
      <div className="rest-timer" style={{ margin: '1rem auto' }}>
        <div
          className="rest-timer-progress"
          style={{
            background: `conic-gradient(
              #3498db ${calculateProgress()}%, 
              #ecf0f1 ${calculateProgress()}% 100%
            )`,
          }}
        >
          <div className="rest-timer-display">
            <div className="timer-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="28"
                height="28"
                fill="#3498db"
              >
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
              </svg>
            </div>
            <div className={`timer-text ${isAnimating ? "pulse" : ""}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="timer-label">seconds</div>
          </div>
        </div>
      </div>

      <div className="timer-controls">
        <button onClick={handleTogglePause} className="timer-control-btn">
          {internalPaused ? 'Resume' : 'Pause'}
        </button>
        <button onClick={handleReset} className="timer-control-btn reset">
          Reset
        </button>
        {onComplete && (
          <button onClick={onComplete} className="timer-control-btn">
            Skip
          </button>
        )}
      </div>
    </div>
  );
};

// Define PropTypes for validation
CustomRestTimer.propTypes = {
  seconds: PropTypes.number.isRequired,
  onComplete: PropTypes.func,
  isPaused: PropTypes.bool
};

export default CustomRestTimer; 