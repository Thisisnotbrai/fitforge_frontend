import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Workout.css";

const Workout = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentWorkoutId, setCurrentWorkoutId] = useState(null);
  const [newWorkout, setNewWorkout] = useState({
    workout_name: "",
    workout_type: "",
    workout_level: "Beginner",
    workout_duration: "",
    workout_calories: "",
    description: "",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const navigate = useNavigate();

  const premadeWorkouts = [
    {
      id: "premade-1",
      title: "Mobility Flow",
      duration: "30 min",
      calories: 345,
      level: "Intermediate",
      type: "Challenge",
      image:
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "premade-2",
      title: "Strength",
      duration: "30 min",
      calories: 345,
      level: "Beginner",
      type: "Challenge",
      image:
        "https://images.unsplash.com/photo-1517960413843-0aee8e2d471c?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "premade-3",
      title: "Full Body",
      duration: "42 min",
      calories: 289,
      level: "Intermediate",
      type: "Workout",
      image:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "premade-4",
      title: "Power Sculpt",
      duration: "30 min",
      calories: 345,
      level: "Advanced",
      type: "Challenge",
      image:
        "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "premade-5",
      title: "HIIT Burn",
      duration: "56 min",
      calories: 427,
      level: "Advanced",
      type: "Workout",
      image:
        "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80",
    },
  ];

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        // Get auth token from localStorage
        const token = localStorage.getItem("token");

        // Initialize arrays to hold different workout types
        let userWorkouts = [];
        let publicWorkouts = [];

        // If user is logged in, also fetch their personal workouts
        if (token) {
          try {
            const traineeWorkoutsResponse = await axios.get(
              "http://localhost:3000/trainee/my-workouts",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (
              traineeWorkoutsResponse.data &&
              traineeWorkoutsResponse.data.success &&
              Array.isArray(traineeWorkoutsResponse.data.data)
            ) {
              // Add user created workouts and mark them
              userWorkouts = traineeWorkoutsResponse.data.data.map(
                (workout) => ({
                  ...workout,
                  isUserCreated: true,
                })
              );
            } else {
              console.warn(
                "Unexpected format for trainee workouts:",
                traineeWorkoutsResponse.data
              );
            }
          } catch (err) {
            console.error("Error fetching user workouts:", err);
            // Continue with available workouts if user workouts fail
          }
        }

        // Also fetch public trainee workouts
        try {
          const publicWorkoutsResponse = await axios.get(
            "http://localhost:3000/trainee/public-workouts"
          );

          if (
            publicWorkoutsResponse.data &&
            publicWorkoutsResponse.data.success &&
            Array.isArray(publicWorkoutsResponse.data.data)
          ) {
            // Add public user-created workouts
            publicWorkouts = publicWorkoutsResponse.data.data.map(
              (workout) => ({
                ...workout,
                isPublicWorkout: true,
              })
            );
          } else {
            console.warn(
              "Unexpected format for public workouts:",
              publicWorkoutsResponse.data
            );
          }
        } catch (err) {
          console.error("Error fetching public workouts:", err);
          // Continue with available workouts if public workouts fail
        }

        // Combine all workouts for category filtering
        const allWorkouts = [...userWorkouts, ...publicWorkouts];
        console.log("All workouts loaded:", allWorkouts);
        setWorkouts({
          all: allWorkouts,
          user: userWorkouts,
          public: publicWorkouts,
        });
      } catch (error) {
        console.error("Error in overall workout fetching process:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  // Get unique workout types for categories
  const categories =
    workouts.all && workouts.all.length > 0
      ? [
          "all",
          ...new Set(
            workouts.all.map((workout) => workout.workout_type.toLowerCase())
          ),
        ]
      : ["all"];

  // Filter workouts by active category
  const getFilteredWorkouts = (workoutList) => {
    if (!workoutList || workoutList.length === 0) return [];

    return activeCategory === "all"
      ? workoutList
      : workoutList.filter(
          (workout) => workout.workout_type.toLowerCase() === activeCategory
        );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewWorkout({
      ...newWorkout,
      [name]: value,
    });
  };

  const handleAddWorkout = async (e) => {
    e.preventDefault();

    // Simple validation
    if (
      !newWorkout.workout_name ||
      !newWorkout.workout_type ||
      !newWorkout.workout_duration ||
      !newWorkout.workout_calories
    ) {
      setFormError("Please fill in all required fields");
      return;
    }

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        setFormError("You must be logged in to create a workout");
        return;
      }

      let response;

      if (isEditing && currentWorkoutId) {
        // Update existing workout
        response = await axios.put(
          `http://localhost:3000/trainee/workouts/${currentWorkoutId}`,
          newWorkout,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          // Update workout in state
          const updatedWorkout = { ...response.data.data, isUserCreated: true };

          setWorkouts((prevWorkouts) => ({
            ...prevWorkouts,
            all: prevWorkouts.all.map((workout) =>
              workout.id === currentWorkoutId ? updatedWorkout : workout
            ),
            user: prevWorkouts.user.map((workout) =>
              workout.id === currentWorkoutId ? updatedWorkout : workout
            ),
          }));

          setFormSuccess("Workout updated successfully!");
        } else {
          setFormError(response.data.message || "Failed to update workout");
        }
      } else {
        // Create new workout
        response = await axios.post(
          "http://localhost:3000/trainee/workouts",
          newWorkout,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Add new workout to state
        if (response.data.success) {
          const newWorkoutData = { ...response.data.data, isUserCreated: true };

          setWorkouts((prevWorkouts) => ({
            ...prevWorkouts,
            all: [...prevWorkouts.all, newWorkoutData],
            user: [...prevWorkouts.user, newWorkoutData],
          }));

          setFormSuccess("Workout created successfully!");
        } else {
          setFormError(response.data.message || "Failed to create workout");
        }
      }

      // Reset form
      setNewWorkout({
        workout_name: "",
        workout_type: "",
        workout_level: "Beginner",
        workout_duration: "",
        workout_calories: "",
        description: "",
      });

      setTimeout(() => setFormSuccess(""), 3000);
      setFormError("");

      // Reset editing state
      setIsEditing(false);
      setCurrentWorkoutId(null);

      // Optionally close form after successful submission
      // setShowAddForm(false);
    } catch (error) {
      console.error("Error adding/updating workout:", error);
      setFormError(
        error.response?.data?.message ||
          "Failed to save workout. Please try again."
      );
    }
  };

  const handleEditWorkout = (workout) => {
    // Set form to edit mode
    setIsEditing(true);
    setCurrentWorkoutId(workout.id);

    // Populate form with workout data
    setNewWorkout({
      workout_name: workout.workout_name,
      workout_type: workout.workout_type,
      workout_level: workout.workout_level,
      workout_duration: workout.workout_duration,
      workout_calories: workout.workout_calories,
      description: workout.description || "",
    });

    // Show the form
    setShowAddForm(true);

    // Scroll to form
    setTimeout(() => {
      const formElement = document.querySelector(".add-workout-form-container");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleDeleteWorkout = async (workoutId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setFormError("You must be logged in to delete a workout");
        return;
      }

      const response = await axios.delete(
        `http://localhost:3000/trainee/workouts/${workoutId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Remove workout from state
        setWorkouts((prevWorkouts) => ({
          ...prevWorkouts,
          all: prevWorkouts.all.filter((workout) => workout.id !== workoutId),
          user: prevWorkouts.user.filter((workout) => workout.id !== workoutId),
        }));

        setFormSuccess("Workout deleted successfully!");
        setTimeout(() => setFormSuccess(""), 3000);

        // Reset form if currently editing the deleted workout
        if (isEditing && currentWorkoutId === workoutId) {
          setIsEditing(false);
          setCurrentWorkoutId(null);
          setNewWorkout({
            workout_name: "",
            workout_type: "",
            workout_level: "Beginner",
            workout_duration: "",
            workout_calories: "",
            description: "",
          });
          setShowAddForm(false);
        }
      } else {
        setFormError("Failed to delete workout");
      }
    } catch (error) {
      console.error("Error deleting workout:", error);
      setFormError("Failed to delete workout. Please try again.");
    }
  };

  const toggleAddForm = () => {
    // If we're closing the form, reset editing state
    if (showAddForm) {
      setIsEditing(false);
      setCurrentWorkoutId(null);
      setNewWorkout({
        workout_name: "",
        workout_type: "",
        workout_level: "Beginner",
        workout_duration: "",
        workout_calories: "",
        description: "",
      });
    }

    setShowAddForm(!showAddForm);
    setFormError("");
    setFormSuccess("");
  };

  const handleStartPremadeWorkout = (workout) => {
    console.log("Starting premade workout:", workout);
    // If it's a premade workout, we can navigate to a generic workout detail page
    // You might want to create these workouts in the backend or handle them differently
    navigate(`/workout/${workout.id}`);
  };

  if (loading)
    return <div className="loading-container">Loading workouts...</div>;

  // Function to render workout cards
  const renderWorkoutCards = (workoutList, showEditButton = false) => {
    const filteredList = getFilteredWorkouts(workoutList);

    if (filteredList.length === 0) {
      return (
        <div className="no-workouts">
          <p>No workouts found in this category.</p>
          <button
            onClick={() => setActiveCategory("all")}
            className="btn-reset"
          >
            Show All Workouts
          </button>
        </div>
      );
    }

    return (
      <div className="workout-grid">
        {filteredList.map((workout) => (
          <div
            key={workout.id}
            className={`workout-card ${
              workout.isUserCreated ? "user-created" : ""
            } ${workout.isPublicWorkout ? "public" : ""}`}
          >
            <div className="workout-card-header">
              <div className="workout-tag">{workout.workout_type}</div>
              <div className="workout-level">{workout.workout_level}</div>
            </div>
            {workout.isUserCreated && (
              <div className="workout-user-created">
                <span>Your Workout</span>
              </div>
            )}
            {workout.isPublicWorkout && workout.creator && (
              <div className="workout-shared-by">
                <span>
                  Shared by{" "}
                  {workout.creator.username ||
                    (workout.creator.first_name && workout.creator.last_name
                      ? `${workout.creator.first_name} ${workout.creator.last_name}`
                      : "Another User")}
                </span>
              </div>
            )}
            <h3>{workout.workout_name}</h3>
            <div className="workout-stats">
              <div className="stat">
                <span className="stat-value">
                  {workout.workout_duration || 0}
                </span>
                <span className="stat-label">minutes</span>
              </div>
              <div className="stat">
                <span className="stat-value">
                  {workout.workout_calories || 0}
                </span>
                <span className="stat-label">calories</span>
              </div>
            </div>
            {workout.description && (
              <p className="workout-description">
                {workout.description.length > 100
                  ? `${workout.description.substring(0, 100)}...`
                  : workout.description}
              </p>
            )}
            <div className="workout-actions">
              <Link
                to={`/workout/${workout.id}`}
                className="btn-primary"
                onClick={() => {
                  console.log("Workout being viewed:", workout);
                }}
              >
                View Details
              </Link>
              {showEditButton && workout.isUserCreated && (
                <button
                  className="btn-edit-workout"
                  onClick={(e) => {
                    e.preventDefault();
                    handleEditWorkout(workout);
                  }}
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="workout-container">
      <div className="workout-dashboard">
        {/* Hero Section */}
        <div className="workout-hero">
          <div className="hero-content">
            <h1>Find Your Perfect Workout</h1>
            <p>
              Customized training programs to help you reach your fitness goals
            </p>
          </div>
        </div>

        {/* Categories Filter */}
        <div className="workout-categories">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-btn ${
                activeCategory === category ? "active" : ""
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Premade Workouts Section */}
        <div className="section-header" style={{ marginBottom: "1.5rem" }}>
          <h2>Premade Workouts</h2>
        </div>
        <div className="premade-workouts-grid">
          {premadeWorkouts.map((workout, idx) => (
            <div
              className="premade-workout-card"
              key={idx}
              style={{
                backgroundImage: `linear-gradient(120deg, rgba(0,0,0,0.35), rgba(0,0,0,0.15)), url(${workout.image})`,
              }}
            >
              <div className="premade-card-content">
                <span className={`premade-badge ${workout.type.toLowerCase()}`}>
                  {workout.type}
                </span>
                <h3>{workout.title}</h3>
                <div className="premade-meta">
                  <span>🔥 {workout.calories} Kcal</span>
                  <span>⏱ {workout.duration}</span>
                </div>
                <button
                  className="btn-premade-start"
                  onClick={() => handleStartPremadeWorkout(workout)}
                >
                  Start Workout
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* My Workouts Section - Only shown if user has created workouts */}
        {workouts.user && workouts.user.length > 0 && (
          <section className="my-workouts">
            <div className="section-header">
              <h2>My Custom Workouts</h2>
            </div>

            {renderWorkoutCards(workouts.user, true)}
          </section>
        )}

        {/* Public Workouts Section - Only shown if public workouts exist */}
        {workouts.public && workouts.public.length > 0 && (
          <section className="public-workouts">
            <div className="section-header">
              <h2>Community Workouts</h2>
              <p className="section-description">
                Workouts shared by other users in the community
              </p>
            </div>

            {renderWorkoutCards(workouts.public, false)}
          </section>
        )}

        {/* Add Workout Section */}
        <section className="add-workout-section">
          <div className="section-header">
            <h2>
              {isEditing ? "Edit Your Workout" : "Create Your Own Workout"}
            </h2>
            <button
              className={`add-workout-toggle ${showAddForm ? "active" : ""}`}
              onClick={toggleAddForm}
            >
              {showAddForm
                ? "Cancel"
                : isEditing
                ? "Edit Workout"
                : "Add Workout"}
            </button>
          </div>

          {showAddForm && (
            <div className="add-workout-form-container">
              {formError && <div className="form-error">{formError}</div>}
              {formSuccess && <div className="form-success">{formSuccess}</div>}

              <form className="add-workout-form" onSubmit={handleAddWorkout}>
                <div className="form-group">
                  <label htmlFor="workout_name">Workout Name*</label>
                  <input
                    type="text"
                    id="workout_name"
                    name="workout_name"
                    value={newWorkout.workout_name}
                    onChange={handleInputChange}
                    placeholder="Enter workout name"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="workout_type">Workout Type*</label>
                    <input
                      type="text"
                      id="workout_type"
                      name="workout_type"
                      value={newWorkout.workout_type}
                      onChange={handleInputChange}
                      placeholder="e.g., Cardio, Strength"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="workout_level">Difficulty Level</label>
                    <select
                      id="workout_level"
                      name="workout_level"
                      value={newWorkout.workout_level}
                      onChange={handleInputChange}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="workout_duration">
                      Duration (minutes)*
                    </label>
                    <input
                      type="number"
                      id="workout_duration"
                      name="workout_duration"
                      value={newWorkout.workout_duration}
                      onChange={handleInputChange}
                      placeholder="Duration in minutes"
                      min="1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="workout_calories">Calories Burned*</label>
                    <input
                      type="number"
                      id="workout_calories"
                      name="workout_calories"
                      value={newWorkout.workout_calories}
                      onChange={handleInputChange}
                      placeholder="Estimated calories"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={newWorkout.description}
                    onChange={handleInputChange}
                    placeholder="Describe the workout and what it targets"
                    rows="4"
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-add-workout">
                    {isEditing ? "Update Workout" : "Create Workout"}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      className="btn-delete-workout"
                      onClick={() => handleDeleteWorkout(currentWorkoutId)}
                    >
                      Delete Workout
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={toggleAddForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {!showAddForm && (
            <div className="add-workout-card">
              <div className="add-workout-content">
                <div className="add-icon">+</div>
                <h3>Create Custom Workout</h3>
                <p>Design your own personalized workout routine</p>
                <button className="btn-create-workout" onClick={toggleAddForm}>
                  Get Started
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Workout;
