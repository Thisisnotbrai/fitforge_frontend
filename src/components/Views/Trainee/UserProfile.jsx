import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faCheckCircle,
  faEdit,
  faInfoCircle,
  faUser,
  faCertificate,
  faDumbbell,
  faToggleOn,
  faToggleOff,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import "./UserProfile.css";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

const UserProfile = () => {
    // User data states
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState({});
  const [profile, setProfile] = useState({});
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [isTrainer, setIsTrainer] = useState(false);
  const [userId, setUserId] = useState(null);
  // API state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trainerInfoExists, setTrainerInfoExists] = useState(false);

  // Available days options for trainers
  const availableDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Fetch trainer info function wrapped in useCallback
  const fetchTrainerInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await axios.get(
        `${apiUrl}/trainerinfo/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setTrainerInfoExists(true);
        const trainerData = response.data;

        // Format the days array if needed
        if (typeof trainerData.available_days === "string") {
          trainerData.available_days = JSON.parse(trainerData.available_days);
        }

        // Format certificates if stored as a string
        if (typeof trainerData.certificates === "string") {
          trainerData.certificates = JSON.parse(trainerData.certificates);
        }

        // Format time fields to HH:MM format if they exist
        if (trainerData.available_hours_from) {
          trainerData.available_hours_from =
            trainerData.available_hours_from.substring(0, 5);
        }
        if (trainerData.available_hours_to) {
          trainerData.available_hours_to =
            trainerData.available_hours_to.substring(0, 5);
        }

        setProfile((prevProfile) => ({
          ...prevProfile,
          ...trainerData,
        }));

        setEditableProfile((prevProfile) => ({
          ...prevProfile,
          ...trainerData,
        }));
      }
    } catch (error) {
      console.error("Error fetching trainer info:", error);
      if (error.response && error.response.status === 404) {
        setTrainerInfoExists(false);
        setEditableProfile((prev) => ({
          ...prev,
          specialization: "",
          experience_years: 0,
          hourly_rate: 0,
          bio: "",
          qualifications: "",
          available_days: [],
          available_hours_from: "09:00", // Default start time
          available_hours_to: "17:00", // Default end time
          certificates: [],
          is_available: true,
        }));
      } else {
        setError("Failed to load trainer information. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load user profile data when component mounts
  useEffect(() => {
    loadUserProfileData();
  }, []);

  // Fetch trainer info when userId is available and user is a trainer
  useEffect(() => {
    if (userId && isTrainer) {
      fetchTrainerInfo();
    }
  }, [userId, isTrainer, fetchTrainerInfo]);

  // Function to load user profile data from localStorage
  const loadUserProfileData = () => {
    try {
      // Get current user data from localStorage
      const userData = JSON.parse(localStorage.getItem("user") || "{}");

      // Ensure we have a user email and ID for identifying this user's profile
      if (!userData.email || !userData.id) {
        console.error("No user email or ID found, cannot load profile data");
        return;
      }

      setCurrentUserEmail(userData.email);
      setUserId(userData.id);

      // Check if user is a trainer - fixed to use 'role' instead of 'user_role'
      // This is the key fix - using the 'role' property from the auth system
      setIsTrainer(userData.role === "trainer");

      // Get user profile data for non-trainer specific fields
      const userProfileKey = `userProfile_${userData.email}`;
      const userProfileData = JSON.parse(
        localStorage.getItem(userProfileKey) || "{}"
      );

      console.log(`Loading profile data for user: ${userData.email}`);
      console.log(
        `User role: ${userData.role}, isTrainer: ${userData.role === "trainer"}`
      );

      // Combine data from auth and profile
      const combinedProfile = {
        ...userData,
        ...userProfileData,
        // Ensure the role is properly set in the combined profile
        // Add this explicitly to make sure it's available
        user_role: userData.role,
      };

      // Load previously saved profile image if it exists
      if (userProfileData.profileImageData) {
        setProfileImagePreview(userProfileData.profileImageData);
      }

      // Set the profile state
      setProfile(combinedProfile);
      setEditableProfile(combinedProfile);
    } catch (error) {
      console.error("Error loading user profile data:", error);
    }
  };

  // Save profile changes to localStorage and/or backend
  const saveProfileChanges = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!currentUserEmail) {
        throw new Error("No user email found, cannot save profile data");
      }

      // Save basic profile data to localStorage
      const userProfileKey = `userProfile_${currentUserEmail}`;
      const profileData = {
        ...editableProfile,
        profileImageData: profileImagePreview,
        lastUpdated: new Date().toISOString(),
        email: currentUserEmail,
      };

      // Save to localStorage
      localStorage.setItem(userProfileKey, JSON.stringify(profileData));

      // If user is a trainer, save trainer-specific info to backend
      if (isTrainer && userId) {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        // Extract trainer-specific fields from editableProfile
        const trainerData = {
          specialization: editableProfile.specialization || "",
          experience_years: editableProfile.experience_years || 0,
          hourly_rate: editableProfile.hourly_rate || 0,
          bio: editableProfile.bio || "",
          qualifications: editableProfile.qualifications || "",
          available_days: editableProfile.available_days || [],
          available_hours_from: editableProfile.available_hours_from || null,
          available_hours_to: editableProfile.available_hours_to || null,
          certificates: editableProfile.certificates || [],
          is_available:
            editableProfile.is_available !== undefined
              ? editableProfile.is_available
              : true,
        };

        try {
          // Determine if we need to create or update
          if (trainerInfoExists) {
            // Update existing trainer info - using direct URL
            await axios.put(
              `${apiUrl}/trainerinfo/${userId}`,
              trainerData,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
          } else {
            // Create new trainer info - using direct URL
            await axios.post(
              `${apiUrl}/trainerinfo/${userId}`,
              trainerData,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            setTrainerInfoExists(true);
          }
        } catch (error) {
          console.error("Error saving trainer info:", error);
          setError("Failed to save trainer information. Please try again.");
          throw error; // Re-throw to prevent updating UI state
        }
      }

      // Update the current profile state
      setProfile(profileData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile data:", error);
      setError("Failed to save profile data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageDataUrl = event.target.result;
        setProfileImagePreview(imageDataUrl);

        // Update editable profile with the image data
        setEditableProfile((prev) => ({
          ...prev,
          profileImageData: imageDataUrl,
        }));
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleChange = (name) => {
    setEditableProfile((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleAvailableDaysChange = (day) => {
    const currentAvailableDays = editableProfile.available_days || [];
    let updatedDays;

    if (currentAvailableDays.includes(day)) {
      // Remove the day if already selected
      updatedDays = currentAvailableDays.filter((d) => d !== day);
    } else {
      // Add the day if not already selected
      updatedDays = [...currentAvailableDays, day];
    }

    setEditableProfile((prev) => ({
      ...prev,
      available_days: updatedDays,
    }));
  };

  const handleCertificateAdd = () => {
    const certificates = editableProfile.certificates || [];
    setEditableProfile((prev) => ({
      ...prev,
      certificates: [...certificates, { name: "", issuer: "", year: "" }],
    }));
  };

  const handleCertificateChange = (index, field, value) => {
    const updatedCertificates = [...(editableProfile.certificates || [])];
    updatedCertificates[index] = {
      ...updatedCertificates[index],
      [field]: value,
    };

    setEditableProfile((prev) => ({
      ...prev,
      certificates: updatedCertificates,
    }));
  };

  const handleCertificateRemove = (index) => {
    const updatedCertificates = [...(editableProfile.certificates || [])];
    updatedCertificates.splice(index, 1);

    setEditableProfile((prev) => ({
      ...prev,
      certificates: updatedCertificates,
    }));
  };

  const startEditing = () => {
    setIsEditing(true);
    setError(null);
  };

  const cancelEditing = () => {
    // Reset editable profile to current profile
    setEditableProfile(profile);
    // Reset image preview to current image
    setProfileImagePreview(profile.profileImageData);
    setIsEditing(false);
    setError(null);
  };

  // Debug logging
  console.log("Current user role:", profile.role || profile.user_role);
  console.log("isTrainer state:", isTrainer);
  console.log("Trainer info exists:", trainerInfoExists);

  return (
    <div className="profile-container">
      {/* Error message display */}
      {error && (
        <div className="error-message">
          <FontAwesomeIcon icon={faInfoCircle} /> {error}
        </div>
      )}

      <div className="profile-header">
        <h2>User Profile</h2>
        {!isEditing && !loading && (
          <button className="edit-profile-btn" onClick={startEditing}>
            <FontAwesomeIcon icon={faEdit} /> Edit Profile
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          <p>Loading profile data...</p>
        </div>
      ) : (
        <>
          <div className="profile-content">
            <div className="profile-picture-section">
              <div className="profile-picture-container">
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt="Profile"
                    className="profile-picture"
                  />
                ) : (
                  <div className="profile-picture-placeholder">
                    <FontAwesomeIcon icon={faUser} size="2x" />
                  </div>
                )}
                {isEditing && (
                  <div className="profile-picture-overlay">
                    <label
                      htmlFor="profile-image-upload"
                      className="profile-image-upload-label"
                    >
                      <FontAwesomeIcon icon={faCamera} />
                      <span>Change Photo</span>
                    </label>
                    <input
                      type="file"
                      id="profile-image-upload"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      style={{ display: "none" }}
                    />
                  </div>
                )}
              </div>
              <h3 className="profile-name">
                {profile.name || profile.email || "User"}
              </h3>
              {/* Fixed this line to properly display the role from auth system */}
              <p className="profile-role">
                {profile.role || profile.user_role || "User"}
              </p>

              {/* Availability Badge for Trainers */}
              {isTrainer && (
                <div
                  className={`availability-badge ${
                    profile.is_available !== false ? "available" : "unavailable"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={
                      profile.is_available !== false
                        ? faCheckCircle
                        : faInfoCircle
                    }
                  />
                  <span>
                    {profile.is_available !== false
                      ? "Available for Booking"
                      : "Currently Unavailable"}
                  </span>
                </div>
              )}
            </div>

            <div className="profile-details-section">
              <h3>Personal Information</h3>

              {isEditing ? (
                <div className="profile-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editableProfile.name || ""}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={currentUserEmail}
                      disabled
                    />
                    <small>Email cannot be changed</small>
                  </div>

                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={editableProfile.phone || ""}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="form-group">
                    <label>Address</label>
                    <textarea
                      name="address"
                      value={editableProfile.address || ""}
                      onChange={handleInputChange}
                      placeholder="Enter your address"
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <div className="profile-info">
                  <div className="info-item">
                    <span className="info-label">Full Name</span>
                    <span className="info-value">
                      {profile.name || "Not set"}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{currentUserEmail}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-value">
                      {profile.phone || "Not set"}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Address</span>
                    <span className="info-value">
                      {profile.address || "Not set"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Non-trainer user section */}
          {!isTrainer && (
            <div className="profile-sections">
              <div className="profile-section">
                <h3>Fitness Information</h3>

                {isEditing ? (
                  <div className="profile-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Height (cm)</label>
                        <input
                          type="number"
                          name="height"
                          value={editableProfile.height || ""}
                          onChange={handleInputChange}
                          placeholder="Enter your height"
                        />
                      </div>

                      <div className="form-group">
                        <label>Weight (kg)</label>
                        <input
                          type="number"
                          name="weight"
                          value={editableProfile.weight || ""}
                          onChange={handleInputChange}
                          placeholder="Enter your weight"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Fitness Goals</label>
                      <textarea
                        name="fitnessGoals"
                        value={editableProfile.fitnessGoals || ""}
                        onChange={handleInputChange}
                        placeholder="Describe your fitness goals"
                        rows={3}
                      />
                    </div>

                    <div className="form-group">
                      <label>Health Conditions</label>
                      <textarea
                        name="healthConditions"
                        value={editableProfile.healthConditions || ""}
                        onChange={handleInputChange}
                        placeholder="List any health conditions or limitations"
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="profile-info">
                    <div className="info-item">
                      <span className="info-label">Height</span>
                      <span className="info-value">
                        {profile.height ? `${profile.height} cm` : "Not set"}
                      </span>
                    </div>

                    <div className="info-item">
                      <span className="info-label">Weight</span>
                      <span className="info-value">
                        {profile.weight ? `${profile.weight} kg` : "Not set"}
                      </span>
                    </div>

                    <div className="info-item">
                      <span className="info-label">Fitness Goals</span>
                      <span className="info-value">
                        {profile.fitnessGoals || "Not set"}
                      </span>
                    </div>

                    <div className="info-item">
                      <span className="info-label">Health Conditions</span>
                      <span className="info-value">
                        {profile.healthConditions || "Not set"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Trainer-specific information section - ALWAYS show if isTrainer is true */}
          {isTrainer && (
            <div className="profile-sections">
              <div className="profile-section trainer-section">
                <h3>
                  <FontAwesomeIcon icon={faDumbbell} /> Trainer Information
                </h3>

                {isEditing ? (
                  <div className="profile-form">
                    <div className="form-group availability-toggle">
                      <label>Availability Status</label>
                      <div
                        className={`toggle-switch ${
                          editableProfile.is_available !== false ? "active" : ""
                        }`}
                        onClick={() => handleToggleChange("is_available")}
                      >
                        <FontAwesomeIcon
                          icon={
                            editableProfile.is_available !== false
                              ? faToggleOn
                              : faToggleOff
                          }
                          size="lg"
                        />
                        <span>
                          {editableProfile.is_available !== false
                            ? "Available for Booking"
                            : "Currently Unavailable"}
                        </span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Specialization</label>
                      <input
                        type="text"
                        name="specialization"
                        value={editableProfile.specialization || ""}
                        onChange={handleInputChange}
                        placeholder="e.g., Strength Training, Yoga, Cardio"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Experience (Years)</label>
                        <input
                          type="number"
                          name="experience_years"
                          value={editableProfile.experience_years || ""}
                          onChange={handleInputChange}
                          placeholder="Years of experience"
                          min="0"
                        />
                      </div>

                      <div className="form-group">
                        <label>Hourly Rate ($)</label>
                        <input
                          type="number"
                          name="hourly_rate"
                          value={editableProfile.hourly_rate || ""}
                          onChange={handleInputChange}
                          placeholder="Your hourly rate"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Bio</label>
                      <textarea
                        name="bio"
                        value={editableProfile.bio || ""}
                        onChange={handleInputChange}
                        placeholder="Describe your training philosophy and approach"
                        rows={4}
                      />
                    </div>

                    <div className="form-group">
                      <label>Qualifications</label>
                      <textarea
                        name="qualifications"
                        value={editableProfile.qualifications || ""}
                        onChange={handleInputChange}
                        placeholder="List your relevant qualifications"
                        rows={3}
                      />
                    </div>

                    <div className="form-group">
                      <label>Available Days</label>
                      <div className="available-days-container">
                        {availableDays.map((day) => (
                          <div key={day} className="day-checkbox">
                            <input
                              type="checkbox"
                              id={`day-${day}`}
                              checked={(
                                editableProfile.available_days || []
                              ).includes(day)}
                              onChange={() => handleAvailableDaysChange(day)}
                            />
                            <label htmlFor={`day-${day}`}>{day}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Available Hours</label>
                      <div className="form-row">
                        <div className="form-group">
                          <label>From</label>
                          <input
                            type="time"
                            name="available_hours_from"
                            value={editableProfile.available_hours_from || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group">
                          <label>To</label>
                          <input
                            type="time"
                            name="available_hours_to"
                            value={editableProfile.available_hours_to || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group certificates-section">
                      <div className="certificates-header">
                        <label>Certificates & Credentials</label>
                        <button
                          type="button"
                          className="add-certificate-btn"
                          onClick={handleCertificateAdd}
                        >
                          + Add Certificate
                        </button>
                      </div>

                      {(editableProfile.certificates || []).map(
                        (cert, index) => (
                          <div key={index} className="certificate-item">
                            <div className="certificate-header">
                              <h4>Certificate #{index + 1}</h4>
                              <button
                                type="button"
                                className="remove-certificate-btn"
                                onClick={() => handleCertificateRemove(index)}
                              >
                                Remove
                              </button>
                            </div>
                            <div className="certificate-fields">
                              <div className="form-group">
                                <label>Name</label>
                                <input
                                  type="text"
                                  value={cert.name || ""}
                                  onChange={(e) =>
                                    handleCertificateChange(
                                      index,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Certificate name"
                                />
                              </div>
                              <div className="form-group">
                                <label>Issuer</label>
                                <input
                                  type="text"
                                  value={cert.issuer || ""}
                                  onChange={(e) =>
                                    handleCertificateChange(
                                      index,
                                      "issuer",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Issuing organization"
                                />
                              </div>
                              <div className="form-group">
                                <label>Year</label>
                                <input
                                  type="number"
                                  value={cert.year || ""}
                                  onChange={(e) =>
                                    handleCertificateChange(
                                      index,
                                      "year",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Year obtained"
                                  min="1900"
                                  max={new Date().getFullYear()}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="profile-info trainer-info">
                    {!trainerInfoExists && (
                      <div className="trainer-info-message">
                        <FontAwesomeIcon icon={faInfoCircle} />
                        <p>
                          Please click &quot;Edit Profile&quot; to add your trainer
                          information.
                        </p>
                      </div>
                    )}

                    {trainerInfoExists && (
                      <>
                        <div className="info-item availability-status">
                          <span className="info-label">Status</span>
                          <span
                            className={`info-value status-badge ${
                              profile.is_available !== false
                                ? "available"
                                : "unavailable"
                            }`}
                          >
                            <FontAwesomeIcon
                              icon={
                                profile.is_available !== false
                                  ? faCheckCircle
                                  : faInfoCircle
                              }
                            />
                            {profile.is_available !== false
                              ? "Available for Booking"
                              : "Currently Unavailable"}
                          </span>
                        </div>

                        <div className="info-item">
                          <span className="info-label">Specialization</span>
                          <span className="info-value">
                            {profile.specialization || "Not set"}
                          </span>
                        </div>

                        <div className="info-item">
                          <span className="info-label">Experience</span>
                          <span className="info-value">
                            {profile.experience_years
                              ? `${profile.experience_years} years`
                              : "Not set"}
                          </span>
                        </div>

                        <div className="info-item">
                          <span className="info-label">Hourly Rate</span>
                          <span className="info-value">
                            {profile.hourly_rate
                              ? `$${profile.hourly_rate}`
                              : "Not set"}
                          </span>
                        </div>

                        <div className="info-item">
                          <span className="info-label">Bio</span>
                          <span className="info-value">
                            {profile.bio || "Not set"}
                          </span>
                        </div>

                        <div className="info-item">
                          <span className="info-label">Qualifications</span>
                          <span className="info-value">
                            {profile.qualifications || "Not set"}
                          </span>
                        </div>

                        <div className="info-item">
                          <span className="info-label">Available Days</span>
                          <span className="info-value">
                            {profile.available_days &&
                            profile.available_days.length > 0
                              ? profile.available_days.join(", ")
                              : "Not set"}
                          </span>
                        </div>

                        <div className="info-item">
                          <span className="info-label">Available Hours</span>
                          <span className="info-value">
                            {profile.available_hours_from &&
                            profile.available_hours_to
                              ? `${profile.available_hours_from} to ${profile.available_hours_to}`
                              : "Not set"}
                          </span>
                        </div>

                        {profile.certificates &&
                          profile.certificates.length > 0 && (
                            <div className="info-item certificates-display">
                              <span className="info-label">
                                Certificates & Credentials
                              </span>
                              <div className="certificates-list">
                                {profile.certificates.map((cert, index) => (
                                  <div
                                    key={index}
                                    className="certificate-display-item"
                                  >
                                    <FontAwesomeIcon
                                      icon={faCertificate}
                                      className="certificate-icon"
                                    />
                                    <div className="certificate-details">
                                      <h4>{cert.name || "Unnamed Certificate"}</h4>
                                      <p>
                                        {cert.issuer && <span>Issuer: {cert.issuer}</span>}
                                        {cert.year && <span>Year: {cert.year}</span>}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form buttons (only show when editing) */}
          {isEditing && (
            <div className="form-buttons-container">
              <button
                type="button"
                className="cancel-btn"
                onClick={cancelEditing}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="save-btn"
                onClick={saveProfileChanges}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserProfile;
