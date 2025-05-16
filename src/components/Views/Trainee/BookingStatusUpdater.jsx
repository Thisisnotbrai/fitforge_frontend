import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import "./BookingStatusUpdater.css";

const BookingStatusUpdater = ({ booking, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [partnership, setPartnership] = useState(null);
  const [showPartnershipInfo, setShowPartnershipInfo] = useState(false);

  useEffect(() => {
    // Check if there's an existing partnership when component mounts
    const checkPartnership = async () => {
      try {
        const response = await axios.get(
          `/partnership/trainer/${booking.trainer_id}`
        );
        const existingPartnership = response.data.find(
          (p) => p.trainee_id === booking.trainee_id
        );

        if (existingPartnership) {
          setPartnership(existingPartnership);
        }
      } catch (err) {
        console.error("Error checking for partnership:", err);
      }
    };

    if (booking.status === "confirmed") {
      checkPartnership();
    }
  }, [booking]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.put(`/booking/${booking.id}/status`, {
        status: newStatus,
      });

      // Check if a partnership was created (in case of confirmation)
      if (response.data.partnership) {
        setPartnership(response.data.partnership);
        setShowPartnershipInfo(true);
      }

      // Notify parent component of the change
      onStatusChange(booking.id, newStatus);
    } catch (err) {
      console.error("Error updating booking status:", err);
      setError(
        err.response?.data?.message || "Failed to update booking status"
      );
    } finally {
      setLoading(false);
    }
  };

  // Different action buttons based on current status
  const renderActionButtons = () => {
    switch (booking.status) {
      case "pending":
        return (
          <div className="booking-actions">
            <button
              className="confirm-btn"
              onClick={() => handleStatusUpdate("confirmed")}
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm"}
            </button>
            <button
              className="cancel-btn"
              onClick={() => handleStatusUpdate("cancelled")}
              disabled={loading}
            >
              Decline
            </button>
          </div>
        );

      case "confirmed":
        return (
          <div className="booking-actions">
            <button
              className="complete-btn"
              onClick={() => handleStatusUpdate("completed")}
              disabled={loading}
            >
              Mark Completed
            </button>
            <button
              className="cancel-btn"
              onClick={() => handleStatusUpdate("cancelled")}
              disabled={loading}
            >
              Cancel
            </button>
            {partnership && (
              <button
                className="partnership-btn"
                onClick={() => setShowPartnershipInfo(!showPartnershipInfo)}
              >
                {showPartnershipInfo ? "Hide Partnership" : "View Partnership"}
              </button>
            )}
          </div>
        );

      case "completed":
        return (
          <div className="booking-actions">
            <span className="status-complete">Completed</span>
            {partnership && (
              <button
                className="partnership-btn"
                onClick={() => setShowPartnershipInfo(!showPartnershipInfo)}
              >
                {showPartnershipInfo ? "Hide Partnership" : "View Partnership"}
              </button>
            )}
          </div>
        );

      case "cancelled":
        return (
          <div className="booking-actions">
            <span className="status-cancelled">Cancelled</span>
          </div>
        );

      default:
        return null;
    }
  };

  // Format date for display
 

  return (
    <div className="booking-status-updater">
      <div className="status-info">
        <span className={`status-badge ${booking.status}`}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
        {booking.notes && (
          <div className="booking-notes">
            <strong>Notes:</strong> {booking.notes}
          </div>
        )}
      </div>

      {renderActionButtons()}

      {error && <div className="status-error">{error}</div>}

      {showPartnershipInfo && partnership && (
        <div className="partnership-info">
          <h4>Partnership Details</h4>
          <p>
            <strong>Status:</strong> {partnership.status}
          </p>
          <p>
            <strong>Since:</strong>{" "}
            {new Date(partnership.start_date).toLocaleDateString()}
          </p>
          {partnership.notes && (
            <p>
              <strong>Notes:</strong> {partnership.notes}
            </p>
          )}
          <p className="partnership-message">
            You are the official trainer for this trainee!
          </p>
        </div>
      )}
    </div>
  );
};

BookingStatusUpdater.propTypes = {
  booking: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    trainee_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
      .isRequired,
    trainer_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
      .isRequired,
    status: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    start_date: PropTypes.string.isRequired,
    end_date: PropTypes.string.isRequired,
    notes: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
  }).isRequired,
  onStatusChange: PropTypes.func.isRequired,
};

export default BookingStatusUpdater;
