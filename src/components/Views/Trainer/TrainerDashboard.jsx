import { useState, useEffect } from "react";
import "./TrainerDashboard.css";
import axios from "axios";

const TrainerDashboard = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [partnerships, setPartnerships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTrainer, setCurrentTrainer] = useState(null);
  const [activeSection, setActiveSection] = useState("bookings"); // "bookings" or "partnerships"
  const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Not authenticated");
        }

        // Get user from localStorage
        const userString = localStorage.getItem("user");
        if (!userString) {
          throw new Error("User data not found");
        }

        const user = JSON.parse(userString);

        // Verify user is a trainer
        const userRole = user.role || user.user_role;
        if (userRole !== "trainer") {
          throw new Error(
            "Access denied. Only trainers can access this dashboard."
          );
        }

        setCurrentTrainer(user);

        // Fetch bookings for this trainer
        const bookingsResponse = await axios.get(
          `${apiUrl}/booking/trainer/${user.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch partnerships for this trainer
        const partnershipsResponse = await axios.get(
          `${apiUrl}/partnership/trainer/${user.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Ensure bookings is always an array
        const bookingsData = Array.isArray(bookingsResponse.data)
          ? bookingsResponse.data
          : [];

        // Ensure partnerships is always an array
        const partnershipsData = Array.isArray(partnershipsResponse.data)
          ? partnershipsResponse.data
          : [];

        setBookings(bookingsData);
        setPartnerships(partnershipsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load dashboard");
        // Ensure data is set to empty arrays even on error
        setBookings([]);
        setPartnerships([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  // Handle booking status update
  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      await axios.put(
        `${apiUrl}/booking/${bookingId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        )
      );

      // If status is confirmed, fetch partnerships again as a new one might have been created
      if (newStatus === "confirmed") {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));

        const partnershipsResponse = await axios.get(
          `${apiUrl}/partnership/trainer/${user.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setPartnerships(
          Array.isArray(partnershipsResponse.data)
            ? partnershipsResponse.data
            : []
        );
      }
    } catch (err) {
      console.error("Error updating booking status:", err);
      alert(
        `Failed to update booking: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  // Handle partnership status update
  const updatePartnershipStatus = async (partnershipId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      await axios.put(
        `${apiUrl}/partnership/${partnershipId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setPartnerships((prevPartnerships) =>
        prevPartnerships.map((partnership) =>
          partnership.id === partnershipId
            ? { ...partnership, status: newStatus }
            : partnership
        )
      );
    } catch (err) {
      console.error("Error updating partnership status:", err);
      alert(
        `Failed to update partnership: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  // Format time from dates
  const formatTime = (dateTimeString) => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.error("Error formatting time:", dateTimeString, e);
      return "Invalid time";
    }
  };

  // Filter bookings based on active tab
  const filteredBookings = Array.isArray(bookings)
    ? bookings.filter((booking) => {
        try {
          const bookingDate = new Date(booking.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          bookingDate.setHours(0, 0, 0, 0);

          const isPast = bookingDate < today;
          const isToday = bookingDate.getTime() === today.getTime();

          switch (activeTab) {
            case "upcoming":
              return (
                (bookingDate >= today && booking.status !== "cancelled") ||
                (isToday && booking.status === "pending") ||
                booking.status === "confirmed"
              );
            case "pending":
              return booking.status === "pending";
            case "completed":
              return (
                booking.status === "completed" ||
                (isPast && booking.status === "confirmed")
              );
            case "cancelled":
              return booking.status === "cancelled";
            default:
              return true;
          }
        } catch (e) {
          console.error("Error filtering booking:", booking, e);
          return false;
        }
      })
    : [];

  // Filter partnerships based on their status
  const filteredPartnerships = Array.isArray(partnerships)
    ? partnerships.filter((partnership) => {
        switch (activeTab) {
          case "active":
            return partnership.status === "active";
          case "paused":
            return partnership.status === "paused";
          case "terminated":
            return partnership.status === "terminated";
          case "all":
          default:
            return true;
        }
      })
    : [];

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return "Invalid date";
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="trainer-dashboard">
      <div className="dashboard-header">
        <h1>Trainer Dashboard</h1>
        {currentTrainer && (
          <div className="trainer-welcome">
            <p>Welcome, {currentTrainer.user_name}!</p>
            <p className="sub-text">
              Manage your bookings and partnerships below
            </p>
          </div>
        )}
      </div>

      <div className="section-tabs">
        <button
          className={`section-tab ${
            activeSection === "bookings" ? "active" : ""
          }`}
          onClick={() => {
            setActiveSection("bookings");
            setActiveTab("upcoming");
          }}
        >
          Bookings
        </button>
        <button
          className={`section-tab ${
            activeSection === "partnerships" ? "active" : ""
          }`}
          onClick={() => {
            setActiveSection("partnerships");
            setActiveTab("active");
          }}
        >
          Partnerships
        </button>
      </div>

      {activeSection === "bookings" && (
        <div className="bookings-section">
          <div className="tabs">
            <button
              className={`tab ${activeTab === "upcoming" ? "active" : ""}`}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming
            </button>
            <button
              className={`tab ${activeTab === "pending" ? "active" : ""}`}
              onClick={() => setActiveTab("pending")}
            >
              Pending
            </button>
            <button
              className={`tab ${activeTab === "completed" ? "active" : ""}`}
              onClick={() => setActiveTab("completed")}
            >
              Completed
            </button>
            <button
              className={`tab ${activeTab === "cancelled" ? "active" : ""}`}
              onClick={() => setActiveTab("cancelled")}
            >
              Cancelled
            </button>
          </div>

          <div className="bookings-list">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`booking-card status-${booking.status}`}
                >
                  <div className="booking-header">
                    <div className="booking-date">
                      <h3>{formatDate(booking.date)}</h3>
                      <p>
                        {formatTime(booking.start_date)} -{" "}
                        {formatTime(booking.end_date)}
                      </p>
                    </div>
                    <div className="booking-status">
                      <span className={`status-badge ${booking.status}`}>
                        {booking.status?.charAt(0).toUpperCase() +
                          booking.status?.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="booking-details">
                    <h4>Client</h4>
                    <p>
                      <strong>Name:</strong>{" "}
                      {booking.trainee?.user_name || "Anonymous"}
                    </p>
                    <p>
                      <strong>Email:</strong>{" "}
                      {booking.trainee?.user_email || "N/A"}
                    </p>

                    {booking.notes && (
                      <div className="booking-notes">
                        <h4>Notes</h4>
                        <p>{booking.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="booking-actions">
                    {booking.status === "pending" && (
                      <>
                        <button
                          className="confirm-btn"
                          onClick={() =>
                            updateBookingStatus(booking.id, "confirmed")
                          }
                        >
                          Confirm
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={() =>
                            updateBookingStatus(booking.id, "cancelled")
                          }
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {booking.status === "confirmed" && (
                      <>
                        <button
                          className="complete-btn"
                          onClick={() =>
                            updateBookingStatus(booking.id, "completed")
                          }
                        >
                          Mark as Completed
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={() =>
                            updateBookingStatus(booking.id, "cancelled")
                          }
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {(booking.status === "completed" ||
                      booking.status === "cancelled") && (
                      <p className="no-actions">No actions available</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-bookings">
                <p>No {activeTab} bookings found.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === "partnerships" && (
        <div className="partnerships-section">
          <div className="tabs">
            <button
              className={`tab ${activeTab === "active" ? "active" : ""}`}
              onClick={() => setActiveTab("active")}
            >
              Active
            </button>
            <button
              className={`tab ${activeTab === "paused" ? "active" : ""}`}
              onClick={() => setActiveTab("paused")}
            >
              Paused
            </button>
            <button
              className={`tab ${activeTab === "terminated" ? "active" : ""}`}
              onClick={() => setActiveTab("terminated")}
            >
              Terminated
            </button>
            <button
              className={`tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All
            </button>
          </div>

          <div className="partnerships-list">
            {filteredPartnerships.length > 0 ? (
              filteredPartnerships.map((partnership) => (
                <div
                  key={partnership.id}
                  className={`partnership-card status-${partnership.status}`}
                >
                  <div className="partnership-header">
                    <div className="partnership-info">
                      <h3>
                        Partner: {partnership.trainee?.user_name || "Anonymous"}
                      </h3>
                      <p>
                        <strong>Since:</strong>{" "}
                        {formatDate(partnership.start_date)}
                      </p>
                    </div>
                    <div className="partnership-status">
                      <span className={`status-badge ${partnership.status}`}>
                        {partnership.status?.charAt(0).toUpperCase() +
                          partnership.status?.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="partnership-details">
                    <h4>Trainee Information</h4>
                    <p>
                      <strong>Name:</strong>{" "}
                      {partnership.trainee?.user_name || "Anonymous"}
                    </p>
                    <p>
                      <strong>Email:</strong>{" "}
                      {partnership.trainee?.user_email || "N/A"}
                    </p>

                    {partnership.notes && (
                      <div className="partnership-notes">
                        <h4>Notes</h4>
                        <p>{partnership.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="partnership-actions">
                    {partnership.status === "active" && (
                      <>
                        <button
                          className="pause-btn"
                          onClick={() =>
                            updatePartnershipStatus(partnership.id, "paused")
                          }
                        >
                          Pause Partnership
                        </button>
                        <button
                          className="terminate-btn"
                          onClick={() =>
                            updatePartnershipStatus(
                              partnership.id,
                              "terminated"
                            )
                          }
                        >
                          Terminate Partnership
                        </button>
                      </>
                    )}

                    {partnership.status === "paused" && (
                      <>
                        <button
                          className="activate-btn"
                          onClick={() =>
                            updatePartnershipStatus(partnership.id, "active")
                          }
                        >
                          Reactivate Partnership
                        </button>
                        <button
                          className="terminate-btn"
                          onClick={() =>
                            updatePartnershipStatus(
                              partnership.id,
                              "terminated"
                            )
                          }
                        >
                          Terminate Partnership
                        </button>
                      </>
                    )}

                    {partnership.status === "terminated" && (
                      <p className="no-actions">
                        This partnership is terminated
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-partnerships">
                <p>No {activeTab} partnerships found.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerDashboard;
