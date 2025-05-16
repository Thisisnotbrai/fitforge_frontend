import React, { useEffect, useState } from "react";

const formatTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

export default function CircularTimer({
  duration,
  onComplete,
  onNext,
  isPaused: isPausedProp = false,
  label = "Work Interval"
}) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [paused, setPaused] = useState(isPausedProp);
  const radius = 90;
  const stroke = 15;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = (timeLeft / duration) * circumference;

  useEffect(() => {
    if (paused) return;
    if (timeLeft === 0) {
      onComplete && onComplete();
      return;
    }
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft, paused, onComplete]);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "320px",
        width: "100%",
      }}
    >
      <div
        style={{
          background: "#1B202B",
          borderRadius: 28,
          boxShadow: "0 8px 32px rgba(52,152,219,0.10)",
          padding: "2.2rem 2rem 2rem 2rem",
          maxWidth: 340,
          width: "100%",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: 19,
            color: "#C97B63",
            marginBottom: 18,
            letterSpacing: 2,
            textTransform: "uppercase",
            textAlign: "center",
            fontFamily: "'Montserrat', 'Poppins', 'Segoe UI', Arial, sans-serif",
            opacity: 0.95,
          }}
        >
          {label}
        </div>
        <div
          style={{
            position: "relative",
            width: 220,
            height: 220,
            marginBottom: 28,
            maxWidth: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width={220} height={220}>
            <circle
              stroke="#2c3240"
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
            <circle
              stroke="#C97B63"
              fill="none"
              strokeWidth={3}
              r={normalizedRadius - 18}
              cx={110}
              cy={110}
              style={{ opacity: 0.5 }}
            />
          </svg>
          <div
            style={{
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
            }}
          >
            <span
              style={{
                fontSize: 54,
                fontWeight: 900,
                color: "#fff",
                fontFamily: "'Montserrat', 'Poppins', 'Segoe UI', Arial, sans-serif",
                letterSpacing: 1,
                lineHeight: 1.1,
                textShadow: "0 2px 8px rgba(0,0,0,0.12)",
                marginBottom: 2,
              }}
            >
              {formatTime(timeLeft)}
            </span>
            <span
              style={{
                fontSize: 17,
                color: "#b0b8c1",
                fontWeight: 600,
                letterSpacing: 2,
                marginTop: 2,
                fontFamily: "'Montserrat', 'Poppins', 'Segoe UI', Arial, sans-serif",
              }}
            >
              SECONDS
            </span>
          </div>
        </div>
        <div
          style={{
            marginTop: 0,
            display: "flex",
            gap: 18,
            width: "100%",
            justifyContent: "center",
            flexWrap: "wrap"
          }}
        >
          <button
            onClick={() => setPaused((p) => !p)}
            style={{
              padding: "0.8em 2.2em",
              background: "#1B202B",
              color: "#3498db",
              border: "2px solid #3498db",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 18,
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 2px 8px rgba(52,152,219,0.08)",
              outline: "none",
              fontFamily: "'Montserrat', 'Poppins', 'Segoe UI', Arial, sans-serif",
              marginBottom: 10,
            }}
            onFocus={e => e.target.style.boxShadow = "0 0 0 3px #3498db44"}
            onBlur={e => e.target.style.boxShadow = "0 2px 8px rgba(52,152,219,0.08)"}
          >
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            onClick={onNext}
            style={{
              padding: "0.8em 2.2em",
              background: "#27ae60",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 18,
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 2px 8px rgba(39,174,96,0.12)",
              outline: "none",
              fontFamily: "'Montserrat', 'Poppins', 'Segoe UI', Arial, sans-serif",
              marginBottom: 10,
            }}
            onFocus={e => e.target.style.boxShadow = "0 0 0 3px #27ae6044"}
            onBlur={e => e.target.style.boxShadow = "0 2px 8px rgba(39,174,96,0.12)"}
          >
            Next Training
          </button>
        </div>
      </div>
      {/* Responsive: shrink timer and buttons on small screens */}
      <style>
        {`
          @media (max-width: 600px) {
            .circular-timer-card {
              padding: 1.2rem 0.5rem 1.2rem 0.5rem !important;
              max-width: 98vw !important;
            }
            .circular-timer-svg {
              width: 120px !important;
              height: 120px !important;
            }
            .circular-timer-time {
              font-size: 32px !important;
            }
            .circular-timer-btn {
              font-size: 15px !important;
              padding: 0.6em 1.2em !important;
            }
          }
        `}
      </style>
    </div>
  );
}