import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const formatTime = (time) => {
  if (time < 60) return `${time}`;
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

const TimerIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#3498db" strokeWidth="2" />
    <path d="M12 6v6l4 2" stroke="#3498db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RestTimer = ({ seconds, nextExercise, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  // Circular progress
  const radius = 90;
  const stroke = 14;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = ((seconds - timeLeft) / seconds) * circumference;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#f7f9fb"
    }}>
      <div style={{
        background: "#1B202B",
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        padding: "2.2rem 2rem 2rem 2rem",
        maxWidth: 370,
        width: "100%",
        margin: "1.2rem auto 0.8rem auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        <div style={{
          fontWeight: 800,
          fontSize: 22,
          color: "#fff",
          marginBottom: 8,
          letterSpacing: 1,
          textTransform: "uppercase",
          textAlign: "center",
          fontFamily: "'Montserrat', 'Poppins', 'Segoe UI', Arial, sans-serif",
        }}>
          REST TIME
        </div>
        <div style={{
          color: "#b0b8c1",
          fontSize: 16,
          marginBottom: 18,
          textAlign: "center",
          fontFamily: "'Montserrat', 'Poppins', 'Segoe UI', Arial, sans-serif",
        }}>
          Get ready for <span style={{ color: "#C97B63", fontWeight: 700 }}>{nextExercise}</span>
      </div>
        <div style={{
          position: "relative",
          width: 220,
          height: 220,
          marginBottom: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <svg width={220} height={220}>
            <circle
              stroke="#23293A"
              fill="none"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={110}
              cy={110}
            />
            <circle
              stroke="#3498db"
              fill="none"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              r={normalizedRadius}
              cx={110}
              cy={110}
          style={{
                transition: "stroke-dashoffset 1s linear",
                filter: "drop-shadow(0 2px 8px rgba(52,152,219,0.18))"
              }}
            />
              </svg>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none",
            pointerEvents: "none",
          }}>
            <span style={{ marginBottom: 8 }}><TimerIcon /></span>
            <span style={{
              fontSize: 48,
              fontWeight: 800,
              color: "#fff",
              fontFamily: "'Montserrat', 'Poppins', 'Segoe UI', Arial, sans-serif",
              letterSpacing: 1,
              lineHeight: 1.1,
              textShadow: "0 2px 8px rgba(0,0,0,0.10)",
            }}>{formatTime(timeLeft)}</span>
            <span style={{
              fontSize: 16,
              color: "#b0b8c1",
              fontWeight: 600,
              letterSpacing: 2,
              marginTop: 2,
              fontFamily: "'Montserrat', 'Poppins', 'Segoe UI', Arial, sans-serif",
            }}>SECONDS</span>
          </div>
        </div>
        <div style={{
          background: "#23293A",
          borderRadius: 18,
          boxShadow: "0 2px 12px rgba(28,32,43,0.10)",
          padding: "1.2rem 1.5rem 1.2rem 1.5rem",
          width: "100%",
          margin: "0.5rem 0 1.2rem 0",
          textAlign: "center",
          borderLeft: "4px solid #C97B63",
        }}>
          <div style={{
            fontSize: 13,
            color: "#b0b8c1",
            fontWeight: 700,
            letterSpacing: 1,
            marginBottom: 4,
            textTransform: "uppercase",
          }}>COMING UP NEXT</div>
          <div style={{
            fontSize: 20,
            color: "#fff",
            fontWeight: 800,
            letterSpacing: 1,
            textTransform: "lowercase",
          }}>{nextExercise}</div>
      </div>
        <button
          onClick={onComplete}
          style={{
            background: "#3498db",
            color: "#fff",
            border: "none",
            borderRadius: 24,
            fontWeight: 700,
            fontSize: 18,
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 2px 8px rgba(52,152,219,0.12)",
            outline: "none",
            fontFamily: "'Montserrat', 'Poppins', 'Segoe UI', Arial, sans-serif",
            padding: "1rem 2.5rem",
            marginTop: 8,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          Skip Rest
          <svg style={{ marginLeft: 8 }} width="20" height="20" fill="#fff" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
      </button>
      </div>
    </div>
  );
};

RestTimer.propTypes = {
  seconds: PropTypes.number.isRequired,
  nextExercise: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};

export default RestTimer;
