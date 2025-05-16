/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./BookingModal.css";
import axios from "axios";

const BookingModal = ({ trainer, traineeId, onClose }) => {
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [availableDays, setAvailableDays] = useState([]);
  const [selectedStartDateIsValid, setSelectedStartDateIsValid] =
    useState(true);
  const [selectedEndDateIsValid, setSelectedEndDateIsValid] = useState(true);

  // Safely convert available_days to array
  const parseAvailableDays = (days) => {
    if (!days) return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    try {
      // Try parsing as JSON first
      const parsed = JSON.parse(days);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // If not JSON, split by comma
      if (typeof days === "string") {
        return days
          .split(",")
          .map((day) => day.trim())
          .filter((day) => day);
      }
    }

    return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  };

  // Set available days on component mount
  useEffect(() => {
    setAvailableDays(parseAvailableDays(trainer.availableDays));
  }, [trainer.availableDays]);

  // When start date changes, set end date to same date if not already set
  useEffect(() => {
    if (startDate && !endDate) {
      setEndDate(startDate);
    }
  }, [startDate, endDate]);

  // Validate if selected date is on an available day
  const validateSelectedDate = (selectedDate, setIsValid) => {
    if (!selectedDate) {
      setIsValid(true);
      return true;
    }

    const dateObj = new Date(selectedDate);
    const dayName = dateObj.toLocaleString("en-us", { weekday: "long" });

    const isValid = availableDays.includes(dayName);
    setIsValid(isValid);

    return isValid;
  };

  // Format time from "HH:MM:SS" to "HH:MM"
  const formatTimeDisplay = (time) => {
    if (!time) return "";
    return time.slice(0, 5); // Takes "09:00:00" -> "09:00"
  };

  // Generate time slots based on trainer availability
  const getTimeOptions = () => {
    const options = [];
    const fromTime = trainer.availableHoursFrom || "09:00:00";
    const toTime = trainer.availableHoursTo || "17:00:00";

    // Convert to hours and minutes
    const fromHour = parseInt(fromTime.split(":")[0]);
    const fromMinute = parseInt(fromTime.split(":")[1]);
    const toHour = parseInt(toTime.split(":")[0]);
    const toMinute = parseInt(toTime.split(":")[1]);

    // Generate 30-minute slots
    for (let h = fromHour; h <= toHour; h++) {
      for (let m = 0; m < 60; m += 30) {
        // Skip times before from time
        if (h === fromHour && m < fromMinute) continue;

        // Skip times after to time
        if (h === toHour && m > toMinute) continue;

        const hour = h.toString().padStart(2, "0");
        const minute = m.toString().padStart(2, "0");
        // Ensure we have a properly formatted time string for the Date constructor
        const timeValue = `${hour}:${minute}:00`;
        const displayTime = `${hour}:${minute}`;

        options.push({ value: timeValue, label: displayTime });
      }
    }

    return options;
  };

  const timeOptions = getTimeOptions();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate inputs
      if (!startDate || !startTime || !endDate || !endTime) {
        throw new Error(
          "Please select start and end dates/times for your booking"
        );
      }

      // Validate dates are on available days
      if (!validateSelectedDate(startDate, setSelectedStartDateIsValid)) {
        throw new Error(
          `Start date is not available. Trainer is available on: ${availableDays.join(
            ", "
          )}`
        );
      }

      if (!validateSelectedDate(endDate, setSelectedEndDateIsValid)) {
        throw new Error(
          `End date is not available. Trainer is available on: ${availableDays.join(
            ", "
          )}`
        );
      }

      // Create full datetime objects
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);

      // Validate datetime objects
      if (isNaN(startDateTime.getTime())) {
        throw new Error("Invalid start date/time format");
      }

      if (isNaN(endDateTime.getTime())) {
        throw new Error("Invalid end date/time format");
      }

      // Make sure end is after start
      if (endDateTime <= startDateTime) {
        throw new Error("End date/time must be after start date/time");
      }

      // Get date for general booking date (using start date)
      const bookingDate = startDate;

      // Debug logging
      console.log("Form values:", { startDate, startTime, endDate, endTime });
      console.log("Parsed dates:", {
        bookingDate,
        startDateTime: startDateTime.toString(),
        endDateTime: endDateTime.toString(),
        startDateTimeISO: startDateTime.toISOString(),
        endDateTimeISO: endDateTime.toISOString(),
      });

      // Ensure end_date is properly formatted
      const endDateISO = endDateTime.toISOString();
      if (!endDateISO) {
        throw new Error("Failed to format end date properly");
      }

      // Data being sent to the backend
      const bookingData = {
        trainee_id: traineeId,
        trainer_id: trainer.id,
        date: bookingDate, // Using start date for the booking date
        start_date: startDateTime.toISOString(), // Full ISO string with date and time
        end_date: endDateISO, // Full ISO string with date and time
        notes,
      };

      // Final validation check
      if (!bookingData.end_date) {
        throw new Error(
          "End date is missing. Please select a valid end date and time."
        );
      }

      console.log("Sending booking data to backend:", bookingData);

      try {
        // Match the endpoint in app.js and BookingsRoutes.js
        const response = await axios.post(
          "${apiUrl}/booking/createbook",
          bookingData
        );

        console.log("Booking response:", response.data);

        // Check if end_date was properly saved
        if (!response.data.end_date) {
          console.error("WARNING: end_date is missing in the response!");
        } else {
          console.log("end_date successfully saved:", response.data.end_date);
        }

        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } catch (err) {
        console.error("Booking error:", err);
        if (err.response) {
          console.error("Error response:", {
            status: err.response.status,
            data: err.response.data,
          });
        }
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to create booking"
        );
      }
    } catch (err) {
      console.error("Booking error:", err);
      if (err.response) {
        console.error("Error response:", {
          status: err.response.status,
          data: err.response.data,
        });
      }
      setError(
        err.response?.data?.message || err.message || "Failed to create booking"
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate session duration when start and end dates/times are selected
  const calculateDuration = () => {
    if (!startDate || !startTime || !endDate || !endTime) return null;

    // Use the actual dates and times selected
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);

    // Make sure end is after start
    if (end <= start) return null;

    // Calculate duration in milliseconds
    const durationMs = end - start;
    // Convert to hours
    const durationHours = durationMs / (1000 * 60 * 60);

    return durationHours;
  };

  // Calculate estimated price based on hourly rate and duration
  const calculatePrice = () => {
    const duration = calculateDuration();
    if (duration === null) return null;

    const hourlyRate = parseFloat(
      trainer.price.replace("$", "").replace("/hour", "")
    );
    return (hourlyRate * duration).toFixed(2);
  };

  const duration = calculateDuration();
  const estimatedPrice = calculatePrice();

  // Calculate min and max dates for the date pickers
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90); // Allow booking up to 90 days in advance
  const maxDateString = maxDate.toISOString().split("T")[0];

  return (
    <div className="booking-modal-overlay">
      <div className="booking-modal">
        <div className="modal-header">
          <h2>Book a Session with {trainer.name}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          {success ? (
            <div className="success-message">
              <h3>Booking Successful!</h3>
              <p>Your booking request has been sent to {trainer.name}.</p>
              <p>
                You&apos;ll receive a notification once it&apos;s confirmed.
              </p>
            </div>
          ) : (
            <>
              <div className="trainer-details">
                <div className="trainer-info">
                  <h3>{trainer.name}</h3>
                  <p>
                    <strong>Specialty:</strong> {trainer.specialty}
                  </p>
                  <p>
                    <strong>Experience:</strong> {trainer.experience}
                  </p>
                  <p>
                    <strong>Rate:</strong> {trainer.price}
                  </p>
                  <p>
                    <strong>Available days:</strong> {availableDays.join(", ")}
                  </p>
                  <p>
                    <strong>Available hours:</strong>{" "}
                    {formatTimeDisplay(trainer.availableHoursFrom)} -{" "}
                    {formatTimeDisplay(trainer.availableHoursTo)}
                  </p>
                  {trainer.qualifications && (
                    <p>
                      <strong>Qualifications:</strong> {trainer.qualifications}
                    </p>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="booking-form">
                <div className="date-time-container">
                  <div className="date-time-group">
                    <h4>Start Date & Time</h4>
                    <div className="form-group">
                      <label htmlFor="start-date">Start Date</label>
                      <input
                        type="date"
                        id="start-date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          validateSelectedDate(
                            e.target.value,
                            setSelectedStartDateIsValid
                          );
                        }}
                        min={today}
                        max={maxDateString}
                        required
                      />
                      {!selectedStartDateIsValid && startDate && (
                        <div className="date-warning">
                          Trainer is not available on this day. Available days:{" "}
                          {availableDays.join(", ")}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="start-time">Start Time</label>
                      <select
                        id="start-time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                      >
                        <option value="">-- Select --</option>
                        {timeOptions.map((option) => (
                          <option
                            key={`start-${option.value}`}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="date-time-group">
                    <h4>End Date & Time</h4>
                    <div className="form-group">
                      <label htmlFor="end-date">End Date</label>
                      <input
                        type="date"
                        id="end-date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          validateSelectedDate(
                            e.target.value,
                            setSelectedEndDateIsValid
                          );
                        }}
                        min={startDate || today}
                        max={maxDateString}
                        required
                      />
                      {!selectedEndDateIsValid && endDate && (
                        <div className="date-warning">
                          Trainer is not available on this day. Available days:{" "}
                          {availableDays.join(", ")}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="end-time">End Time</label>
                      <select
                        id="end-time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                      >
                        <option value="">-- Select --</option>
                        {timeOptions.map((option) => (
                          <option
                            key={`end-${option.value}`}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {duration !== null && estimatedPrice !== null && (
                  <div className="booking-summary">
                    <p>
                      <strong>Duration:</strong> {duration.toFixed(1)} hours
                    </p>
                    <p>
                      <strong>Estimated Price:</strong> ${estimatedPrice}
                    </p>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="notes">Notes (Optional)</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requests or information the trainer should know"
                  />
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={
                      loading ||
                      (startDate && !selectedStartDateIsValid) ||
                      (endDate && !selectedEndDateIsValid)
                    }
                  >
                    {loading ? "Processing..." : "Book Session"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

BookingModal.propTypes = {
  trainer: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    name: PropTypes.string,
    specialty: PropTypes.string,
    experience: PropTypes.string,
    price: PropTypes.string,
    availableDays: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    availableHoursFrom: PropTypes.string,
    availableHoursTo: PropTypes.string,
    qualifications: PropTypes.string,
  }).isRequired,
  traineeId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BookingModal;
