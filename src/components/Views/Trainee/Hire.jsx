/* eslint-disable no-unused-vars */
import React from "react";
import { useState, useEffect, useMemo } from "react";
import "./Hire.css";
import BookingModal from "./BookingModal";
import axios from "axios";

const Hire = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasActivePartnership, setHasActivePartnership] = useState(false);
  const [activePartnershipTrainer, setActivePartnershipTrainer] =
    useState(null);
    const apiUrl = useMemo(() => import.meta.env.VITE_API_URL, []);
  useEffect(() => {
    // Fetch current user from localStorage instead of an API call
    const fetchCurrentUser = () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("User not authenticated");
        }

        const userString = localStorage.getItem("user");
        if (!userString) {
          throw new Error("User data not found");
        }

        const user = JSON.parse(userString);
        console.log("Current user from localStorage:", user);
        setCurrentUser(user);

        // Check if user has active partnerships
        if (user.id) {
          checkActivePartnerships(user.id);
        }
      } catch (err) {
        console.error("Error fetching current user:", err);
        setError("Please log in to book a trainer");
      }
    };

    // Check if trainee has any active partnerships
    const checkActivePartnerships = async (traineeId) => {
      try {
        const response = await axios.get(
          `${apiUrl}/partnership/trainee/${traineeId}`
        );

        console.log("Partnerships response:", response.data);

        // Filter to only find active partnerships
        const activePartnerships = response.data.filter(
          (partnership) => partnership.status === "active"
        );

        if (activePartnerships.length > 0) {
          setHasActivePartnership(true);
          // If there's an active partnership, get the trainer name for the message
          const trainerInfo = activePartnerships[0].trainer;
          setActivePartnershipTrainer({
            id: trainerInfo.id,
            name: trainerInfo.user_name,
          });
        } else {
          setHasActivePartnership(false);
          setActivePartnershipTrainer(null);
        }
      } catch (err) {
        console.error("Error checking partnerships:", err);
        // Don't block the UI if we can't check partnerships
        setHasActivePartnership(false);
      }
    };

    // Fetch all trainers from the API
    const fetchTrainers = async () => {
      try {
        console.log("Fetching trainers from API");
        // Updated to match backend API endpoint if needed
        const response = await axios.get(
          `${apiUrl}/trainerinfo/trainers`
        );

        console.log("API Response:", response.data); // For debugging

        if (!response.data || response.data.length === 0) {
          console.warn("No trainers found in API response");
          setTrainers([]);
          setLoading(false);
          return;
        }

        // Format trainer data for display
        const formattedTrainers = response.data
          .map((trainer) => {
            // Check if trainerInfo exists
            if (!trainer.trainerInfo) {
              console.warn(`No trainer info for user ID: ${trainer.id}`);
              return null;
            }

            return {
              id: trainer.id,
              name: trainer.user_name,
              specialty:
                trainer.trainerInfo.specialization || "General Fitness",
              experience: `${trainer.trainerInfo.experience_years} years`,
              description: trainer.trainerInfo.bio || "No bio provided",
              price: `$${trainer.trainerInfo.hourly_rate}/hour`,
              categories: trainer.trainerInfo.specialization
                ? trainer.trainerInfo.specialization
                    .toLowerCase()
                    .split(",")
                    .map((s) => s.trim())
                : ["general"],
              availableDays: trainer.trainerInfo.available_days,
              availableHoursFrom: trainer.trainerInfo.available_hours_from,
              availableHoursTo: trainer.trainerInfo.available_hours_to,
              qualifications: trainer.trainerInfo.qualifications,
              image: "/default-trainer.jpg", // Default image
            };
          })
          .filter(Boolean); // Remove any null entries

        console.log(
          `Formatted ${formattedTrainers.length} trainers for display`
        );
        setTrainers(formattedTrainers);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching trainers:", err);
        if (err.response) {
          console.error("Error status:", err.response.status);
          console.error("Error data:", err.response.data);
        }
        setError("Unable to load trainers. Please try again later.");
        setLoading(false);
      }
    };

    fetchCurrentUser();
    fetchTrainers();
  }, [apiUrl]);

  // Extract unique categories from trainers
  const extractCategories = () => {
    const categorySet = new Set();
    categorySet.add("all");

    trainers.forEach((trainer) => {
      if (trainer.categories) {
        trainer.categories.forEach((category) => categorySet.add(category));
      }
    });

    return Array.from(categorySet).map((id) => ({
      id,
      name:
        id === "all"
          ? "All Trainers"
          : id.charAt(0).toUpperCase() + id.slice(1),
    }));
  };

  const categories = extractCategories();

  const filteredTrainers = trainers.filter((trainer) => {
    const matchesCategory =
      selectedCategory === "all" ||
      (trainer.categories && trainer.categories.includes(selectedCategory));
    const matchesSearch =
      trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainer.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleHireClick = (trainer) => {
    if (!currentUser) {
      alert("Please log in to book a trainer");
      return;
    }

    // Check user_role property directly
    const userRole = currentUser.role || currentUser.user_role;

    if (userRole !== "trainee") {
      alert("Only trainees can book sessions");
      return;
    }

    // Check if trainee already has an active partnership with any trainer
    if (hasActivePartnership) {
      // Show message if trainee already has a trainer
      const trainerName = activePartnershipTrainer
        ? activePartnershipTrainer.name
        : "another trainer";
      alert(
        `You already have an active partnership with ${trainerName}. You can only have one trainer at a time.`
      );
      return;
    }

    // Allow booking if no active partnerships
    setSelectedTrainer(trainer);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTrainer(null);
  };

  if (loading) return <div className="loading">Loading trainers...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="hire-page">
      <div className="hire-header">
        <h1>Find Your Perfect Trainer</h1>
        <p>
          Browse through our certified trainers and find the one that matches
          your fitness goals
        </p>
      </div>

      {hasActivePartnership && activePartnershipTrainer && (
        <div className="active-partnership-notice">
          <p>
            <strong>Note:</strong> You already have an active partnership with
            trainer <strong>{activePartnershipTrainer.name}</strong>. You cannot
            book sessions with other trainers until this partnership is
            terminated.
          </p>
        </div>
      )}

      <div className="search-filter-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search trainers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-btn ${
                selectedCategory === category.id ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="trainers-grid">
        {filteredTrainers.length > 0 ? (
          filteredTrainers.map((trainer) => (
            <div key={trainer.id} className="trainer-card">
              <div className="trainer-info">
                <h3>{trainer.name}</h3>
                <p className="specialty">{trainer.specialty}</p>
                <p className="experience">Experience: {trainer.experience}</p>
                <p className="description">{trainer.description}</p>
                <div className="trainer-footer">
                  <span className="price">{trainer.price}</span>
                  <button
                    className="hire-btn"
                    onClick={() => handleHireClick(trainer)}
                    disabled={
                      hasActivePartnership &&
                      (!activePartnershipTrainer ||
                        activePartnershipTrainer.id !== trainer.id)
                    }
                  >
                    {hasActivePartnership &&
                    activePartnershipTrainer &&
                    activePartnershipTrainer.id === trainer.id
                      ? "Book Again"
                      : "Hire Now"}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            No trainers found matching your criteria
          </div>
        )}
      </div>

      {showModal && selectedTrainer && currentUser && (
        <BookingModal
          trainer={selectedTrainer}
          traineeId={currentUser.id}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default Hire;
