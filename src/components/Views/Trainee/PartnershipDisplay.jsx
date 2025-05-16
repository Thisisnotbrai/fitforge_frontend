import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./PartnershipDisplay.css"; // You'll need to create this CSS file
import axios from "axios";

const PartnershipDisplay = ({ userId, userRole }) => {
  const [partnerships, setPartnerships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPartnerships = async () => {
      try {
        setLoading(true);
        setError("");

        const endpoint =
          userRole === "trainee"
            ? `/partnership/trainee/${userId}`
            : `/partnership/trainer/${userId}`;

        const response = await axios.get(endpoint);
        setPartnerships(response.data);
      } catch (err) {
        console.error("Error fetching partnerships:", err);
        setError("Failed to load partnerships. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchPartnerships();
    }
  }, [userId, userRole]);

  const handleStatusChange = async (partnershipId, newStatus) => {
    try {
      await axios.put(`/partnership/${partnershipId}/status`, {
        status: newStatus,
        // Add end_date if terminating the partnership
        ...(newStatus === "terminated" && {
          end_date: new Date().toISOString(),
        }),
      });

      // Update the local state
      setPartnerships(
        partnerships.map((p) =>
          p.id === partnershipId
            ? {
                ...p,
                status: newStatus,
                // If terminating, set end_date
                ...(newStatus === "terminated" && {
                  end_date: new Date().toISOString(),
                }),
                // If activating, clear end_date
                ...(newStatus === "active" && { end_date: null }),
              }
            : p
        )
      );
    } catch (err) {
      console.error("Error updating partnership status:", err);
      setError("Failed to update partnership status. Please try again.");
    }
  };

  if (loading)
    return <div className="loading-spinner">Loading partnerships...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (partnerships.length === 0) {
    return (
      <div className="no-partnerships">
        <p>You don&apos;t have any active partnerships yet.</p>
        {userRole === "trainee" && (
          <p>Book a session with a trainer to establish a partnership.</p>
        )}
      </div>
    );
  }

  return (
    <div className="partnerships-container">
      <h2>My {userRole === "trainee" ? "Trainers" : "Trainees"}</h2>

      <div className="partnerships-list">
        {partnerships.map((partnership) => {
          const partner =
            userRole === "trainee" ? partnership.trainer : partnership.trainee;

          return (
            <div
              key={partnership.id}
              className={`partnership-card ${partnership.status}`}
            >
              <div className="partnership-header">
                <h3>{partner.user_name}</h3>
                <span className={`status-badge ${partnership.status}`}>
                  {partnership.status.charAt(0).toUpperCase() +
                    partnership.status.slice(1)}
                </span>
              </div>

              <div className="partnership-details">
                <p>
                  <strong>Email:</strong> {partner.user_email}
                </p>
                <p>
                  <strong>Since:</strong>{" "}
                  {new Date(partnership.start_date).toLocaleDateString()}
                </p>

                {partnership.end_date && (
                  <p>
                    <strong>Until:</strong>{" "}
                    {new Date(partnership.end_date).toLocaleDateString()}
                  </p>
                )}

                {userRole === "trainee" && partnership.trainer.trainerInfo && (
                  <p>
                    <strong>Specialization:</strong>{" "}
                    {partnership.trainer.trainerInfo.specialization}
                  </p>
                )}

                {partnership.notes && (
                  <div className="partnership-notes">
                    <p>
                      <strong>Notes:</strong>
                    </p>
                    <p>{partnership.notes}</p>
                  </div>
                )}
              </div>

              <div className="partnership-actions">
                {partnership.status === "active" ? (
                  <button
                    className="pause-btn"
                    onClick={() => handleStatusChange(partnership.id, "paused")}
                  >
                    Pause Partnership
                  </button>
                ) : partnership.status === "paused" ? (
                  <button
                    className="resume-btn"
                    onClick={() => handleStatusChange(partnership.id, "active")}
                  >
                    Resume Partnership
                  </button>
                ) : null}

                {partnership.status !== "terminated" && (
                  <button
                    className="terminate-btn"
                    onClick={() =>
                      handleStatusChange(partnership.id, "terminated")
                    }
                  >
                    End Partnership
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

PartnershipDisplay.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  userRole: PropTypes.oneOf(["trainee", "trainer"]).isRequired,
};

export default PartnershipDisplay;
