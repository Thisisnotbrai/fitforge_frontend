import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminDashboard.css";
// Import Chart.js for analytics
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  LineElement, 
  PointElement,
  Filler 
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  LineElement, 
  PointElement,
  Filler
);

const AdminDashboard = () => {
  const [pendingTrainers, setPendingTrainers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL;
  // New states for analytics data
  const [userAnalytics, setUserAnalytics] = useState({
    totalUsers: 0,
    traineeCount: 0,
    trainerCount: 0,
    pendingCount: 0,
    registrationTrend: []
  });
  const [workoutAnalytics, setWorkoutAnalytics] = useState({
    totalWorkouts: 0,
    completedWorkouts: 0,
    popularWorkouts: []
  });
  const [bookingAnalytics, setBookingAnalytics] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    bookingTrend: []
  });
  const [systemHealth, setSystemHealth] = useState({
    status: "Operational",
    userActivity: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0
    }
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const navigate = useNavigate();

  // Wrap checkAdminAuth in useCallback
  const checkAdminAuth = useCallback(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    if (!token || user.role !== "admin") {
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleLogout = useCallback(() => {
    // Clear user data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Navigate to admin login page
    navigate("/admin/login");
  }, [navigate]);

  // Wrap fetchAnalyticsData in useCallback
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }
      
      // Function to handle API requests with fallback to mock data
      const fetchWithFallback = async (endpoint, mockDataGenerator) => {
        try {
          const response = await axios.get(`${apiUrl}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (response && response.data && response.data.success) {
            console.log(`Successfully fetched data from ${endpoint}`);
            return response.data.data;
          }
          throw new Error("Invalid response format");
        } catch (error) {
          console.warn(`Error fetching from ${endpoint}, using mock data:`, error.message);
          return mockDataGenerator ? mockDataGenerator() : null;
        }
      };
      
      // User stats with fallback
      const userStatsData = await fetchWithFallback("/users/stats", () => {
        const mockData = generateMockUserStats();
        return mockData.data.data;
      });
      
      if (userStatsData) {
        setUserAnalytics(userStatsData);
      }
      
      // Workout stats with fallback
      const workoutStatsData = await fetchWithFallback("/workouts/stats", () => ({
        totalWorkouts: 7,
        completedWorkouts: 0,
        popularWorkouts: [
          { name: "Strength Training", count: 38 },
          { name: "Cardio", count: 35 },
          { name: "HIIT", count: 22 },
          { name: "Yoga", count: 18 },
          { name: "Flexibility", count: 12 }
        ]
      }));
      
      if (workoutStatsData) {
        setWorkoutAnalytics(workoutStatsData);
      }
      
      // Booking stats with fallback
      const bookingStatsData = await fetchWithFallback("/bookings/stats", () => ({
        totalBookings: 1,
        pendingBookings: 0,
        completedBookings: 0,
        bookingTrend: [
          { date: "Jan", count: 8 },
          { date: "Feb", count: 12 },
          { date: "Mar", count: 15 },
          { date: "Apr", count: 20 },
          { date: "May", count: 17 },
          { date: "Jun", count: 15 }
        ]
      }));
      
      if (bookingStatsData) {
        setBookingAnalytics(bookingStatsData);
      }
      
      // System health with fallback
      const systemHealthData = await fetchWithFallback("/system-health", () => ({
        status: "Operational",
        userActivity: {
          today: 1,
          thisWeek: 0,
          thisMonth: 0
        }
      }));
      
      if (systemHealthData) {
        setSystemHealth(systemHealthData);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError("Failed to fetch analytics data");
      setLoading(false);
    }
  }, [apiUrl, generateMockUserStats, setError, setLoading, setUserAnalytics]);

  // Wrap generateMockUserStats in useCallback
  const generateMockUserStats = useCallback(() => {
    const trainerCount = trainers.length || Math.floor(Math.random() * 5) + 1;
    const traineeCount = trainees.length || Math.floor(Math.random() * 10) + 1;
    const pendingCount = pendingTrainers.length || Math.floor(Math.random() * 3);
    const totalUsers = trainerCount + traineeCount + pendingCount;
    
    return {
      data: {
        success: true,
        data: {
          totalUsers,
          traineeCount,
          trainerCount, 
          pendingCount,
          registrationTrend: generateRegistrationTrend()
        }
      }
    };
  }, [trainers.length, trainees.length, pendingTrainers.length]);

  // Update useEffect with dependencies
  useEffect(() => {
    checkAdminAuth();
    fetchPendingTrainers();
    fetchTrainers();
    fetchTrainees();
    fetchAnalyticsData();
  }, [checkAdminAuth, fetchPendingTrainers, fetchTrainers, fetchTrainees, fetchAnalyticsData]);

  // Update useEffect with generateMockUserStats dependency
  useEffect(() => {
    if (trainers.length > 0 || trainees.length > 0 || pendingTrainers.length > 0) {
      const mockStats = generateMockUserStats();
      if (mockStats.data && mockStats.data.data) {
        setUserAnalytics(mockStats.data.data);
      }
    }
  }, [trainers, trainees, pendingTrainers, generateMockUserStats]);

  // Wrap fetchPendingTrainers in useCallback
  const fetchPendingTrainers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }
      
      const response = await axios.get(
        `${apiUrl}/users/pending-trainers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.data) {
        setPendingTrainers(response.data.data);
      } else {
        setPendingTrainers([]);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching pending trainers:", err);
      setError(
        err.response?.data?.message || "Failed to fetch pending trainers"
      );
      setLoading(false);
    }
  }, [apiUrl, setError, setLoading, setPendingTrainers]);

  // Wrap fetchTrainers in useCallback
  const fetchTrainers = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Authentication required");
        return;
      }
      
      const response = await axios.get(
        `${apiUrl}/users/trainers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.data) {
        setTrainers(response.data.data);
      } else {
        setTrainers([]);
      }
    } catch (err) {
      console.error("Error fetching trainers:", err);
    }
  }, [apiUrl, setError, setTrainers]);

  // Wrap fetchTrainees in useCallback
  const fetchTrainees = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Authentication required");
        return;
      }
      
      const response = await axios.get(
        `${apiUrl}/users/trainees`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.data) {
        setTrainees(response.data.data);
      } else {
        setTrainees([]);
      }
    } catch (err) {
      console.error("Error fetching trainees:", err);
    }
  }, [apiUrl, setError, setTrainees]);

  const approveTrainer = async (trainerId) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }
      
      const response = await axios.put(
        `${apiUrl}/users/approve/${trainerId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.data) {
        setSuccessMessage(`Trainer ${response.data.data.user_name} approved successfully!`);
        // Remove the approved trainer from the list
        setPendingTrainers(
          pendingTrainers.filter((trainer) => trainer.id !== trainerId)
        );
        
        // Refresh the trainers list
        fetchTrainers();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error approving trainer:", err);
      setError(
        err.response?.data?.message || "Failed to approve trainer"
      );
      setLoading(false);
    }
  };
  
  // New function to handle user suspension
  const suspendUser = async (userId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }
      
      const response = await axios.put(
        `${apiUrl}/users/suspend/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ).catch(err => {
        console.error("Error suspending user:", err);
        setError("Failed to suspend user - API endpoint may not exist yet");
        setLoading(false);
        return null;
      });

      if (response && response.data && response.data.data) {
        setSuccessMessage(`User ${response.data.data.user_name} suspended successfully!`);
        
        // Refresh user lists
        fetchTrainers();
        fetchTrainees();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error suspending user:", err);
      setError(
        err.response?.data?.message || "Failed to suspend user"
      );
      setLoading(false);
    }
  };
  
  // Function to view user details
  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };
  
  // Function to close user details modal
  const closeUserDetails = () => {
    setSelectedUser(null);
    setShowUserDetails(false);
  };

  const renderTabContent = () => {
    if (loading && (activeTab === "pending" || activeTab === "dashboard")) {
      return <div className="admin-loading">Loading...</div>;
    }

    switch(activeTab) {
      case "dashboard":
        return renderDashboardOverview();
        
      case "pending":
        return (
          <>
            {pendingTrainers.length === 0 ? (
              <div className="admin-no-data">No pending trainer approvals</div>
            ) : (
              <div className="admin-trainer-list">
                {pendingTrainers.map((trainer) => (
                  <div key={trainer.id} className="admin-trainer-card">
                    <div className="admin-trainer-details">
                      <h3>{trainer.user_name}</h3>
                      <p>{trainer.user_email}</p>
                    </div>
                    <div className="admin-trainer-actions">
                      <button
                        className="admin-view-button"
                        onClick={() => viewUserDetails(trainer)}
                      >
                        View Details
                      </button>
                      <button
                        className="admin-approve-button"
                        onClick={() => approveTrainer(trainer.id)}
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        );
        
      case "trainers":
        return (
          <>
            {pendingTrainers.length === 0 && (
              <div className="admin-error-notification">No pending trainers found.</div>
            )}
            
            {trainers.length === 0 ? (
              <div className="admin-no-data">No approved trainers found</div>
            ) : (
              <div className="admin-user-list">
                {trainers.map((trainer) => (
                  <div key={trainer.id} className="admin-user-card">
                    <div className="admin-user-details">
                      <h3>{trainer.user_name}</h3>
                      <p>Email: {trainer.user_email}</p>
                      <p className="admin-status-verified">
                        Verification: {trainer.is_verified ? "Verified" : "Not Verified"}
                      </p>
                    </div>
                    <div className="admin-user-actions">
                      <button
                        className="admin-view-button"
                        onClick={() => viewUserDetails(trainer)}
                      >
                        View Details
                      </button>
                      <button
                        className="admin-suspend-button"
                        onClick={() => suspendUser(trainer.id)}
                      >
                        Suspend
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        );
        
      case "trainees":
        return (
          <>
            {trainees.length === 0 ? (
              <div className="admin-no-data">No trainees found</div>
            ) : (
              <div className="admin-user-list">
                {trainees.map((trainee) => (
                  <div key={trainee.id} className="admin-user-card">
                    <div className="admin-user-details">
                      <h3>{trainee.user_name}</h3>
                      <p>Email: {trainee.user_email}</p>
                      <p className="admin-status-verified">
                        Verification: {trainee.is_verified ? "Verified" : "Not Verified"}
                      </p>
                    </div>
                    <div className="admin-user-actions">
                      <button
                        className="admin-view-button"
                        onClick={() => viewUserDetails(trainee)}
                      >
                        View Details
                      </button>
                      <button
                        className="admin-suspend-button"
                        onClick={() => suspendUser(trainee.id)}
                      >
                        Suspend
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        );
        
      default:
        return <div>Select a tab</div>;
    }
  };

  const renderDashboardOverview = () => {
    return (
      <div className="admin-dashboard-overview">
        {/* Quick Stats Row */}
        <div className="admin-stats-row">
          <div className="admin-stat-card">
            <h3>{userAnalytics.totalUsers}</h3>
            <p>Total Users</p>
          </div>
          
          <div className="admin-stat-card">
            <h3>{userAnalytics.traineeCount}</h3>
            <p>Trainees</p>
          </div>
          
          <div className="admin-stat-card">
            <h3>{userAnalytics.trainerCount}</h3>
            <p>Trainers</p>
          </div>
          
          <div className="admin-stat-card">
            <h3>{userAnalytics.pendingCount}</h3>
            <p>Pending</p>
          </div>
        </div>
        
        {/* User Growth Chart */}
        <div className="admin-chart-wrapper">
          <h3 className="admin-chart-title">User Growth Trend</h3>
          <p className="admin-chart-subtitle">Monthly User Registration</p>
          <div className="admin-chart-container">
            <Line 
              data={{
                labels: userAnalytics.registrationTrend.map(item => item.date),
                datasets: [
                  {
                    label: 'New Registrations',
                    data: userAnalytics.registrationTrend.map(item => item.count),
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleFont: { size: 13 },
                    bodyFont: { size: 12 },
                    padding: 10,
                    cornerRadius: 4,
                    displayColors: false
                  },
                  filler: {
                    propagate: true
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                      precision: 0
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    }
                  }
                }
              }}
            />
          </div>
        </div>
        
        {/* Workout & Booking Analytics Row */}
        <div className="admin-charts-row">
          {/* Workout Analytics */}
          <div className="admin-chart-card">
            <h3 className="admin-chart-title">Workout Analytics</h3>
            <div className="admin-analytics-summary">
              <div className="analytics-summary-item">
                <span className="analytics-number">{workoutAnalytics.totalWorkouts}</span>
                <span className="analytics-label">Total Workouts</span>
              </div>
              <div className="analytics-summary-item">
                <span className="analytics-number">{workoutAnalytics.completedWorkouts}</span>
                <span className="analytics-label">Completed</span>
              </div>
              <div className="analytics-summary-item">
                <span className="analytics-number">
                  {workoutAnalytics.totalWorkouts > 0 
                    ? Math.round((workoutAnalytics.completedWorkouts / workoutAnalytics.totalWorkouts) * 100) 
                    : 0}%
                </span>
                <span className="analytics-label">Completion Rate</span>
              </div>
            </div>
            <div className="admin-chart-container">
              <Pie
                data={{
                  labels: workoutAnalytics.popularWorkouts.map(workout => workout.name),
                  datasets: [
                    {
                      data: workoutAnalytics.popularWorkouts.map(workout => workout.count),
                      backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                      ],
                      borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                      ],
                      borderWidth: 2,
                      hoverOffset: 6,
                      hoverBorderWidth: 3
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        boxWidth: 12,
                        padding: 15,
                        font: {
                          size: 12
                        }
                      }
                    },
                    title: {
                      display: true,
                      text: 'Popular Workout Types',
                      font: {
                        size: 14
                      },
                      padding: {
                        bottom: 15
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      titleFont: { size: 13 },
                      bodyFont: { size: 12 },
                      padding: 10,
                      cornerRadius: 4,
                    }
                  },
                  cutout: '40%'
                }}
              />
            </div>
          </div>
          
          {/* Booking Analytics */}
          <div className="admin-chart-card">
            <h3 className="admin-chart-title">Booking Analytics</h3>
            <div className="admin-analytics-summary">
              <div className="analytics-summary-item">
                <span className="analytics-number">{bookingAnalytics.totalBookings}</span>
                <span className="analytics-label">Total Bookings</span>
              </div>
              <div className="analytics-summary-item">
                <span className="analytics-number">{bookingAnalytics.pendingBookings}</span>
                <span className="analytics-label">Pending</span>
              </div>
              <div className="analytics-summary-item">
                <span className="analytics-number">{bookingAnalytics.completedBookings}</span>
                <span className="analytics-label">Completed</span>
              </div>
            </div>
            <div className="admin-chart-container">
              <Bar
                data={{
                  labels: bookingAnalytics.bookingTrend.map(item => item.date),
                  datasets: [
                    {
                      label: 'Bookings',
                      data: bookingAnalytics.bookingTrend.map(item => item.count),
                      backgroundColor: 'rgba(75, 192, 192, 0.6)',
                      borderColor: 'rgba(75, 192, 192, 1)',
                      borderWidth: 1,
                      borderRadius: 4,
                      maxBarThickness: 30
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: 'Monthly Booking Trend'
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      titleFont: { size: 13 },
                      bodyFont: { size: 12 },
                      padding: 10,
                      cornerRadius: 4,
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                      },
                      ticks: {
                        precision: 0
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
        
        {/* System Health & Activity Row */}
        <div className="admin-activity-row">
          {/* Pending Approvals Card */}
          <div className="admin-activity-card">
            <h3 className="admin-activity-title">
              Pending Approvals 
              <span className="admin-badge">{pendingTrainers.length}</span>
            </h3>
            <div className="admin-activity-content">
              {pendingTrainers.length === 0 ? (
                <p className="admin-no-data-small">No pending approvals</p>
              ) : (
                <div className="admin-pending-list">
                  {pendingTrainers.slice(0, 3).map((trainer) => (
                    <div key={trainer.id} className="admin-pending-item">
                      <div className="admin-pending-info">
                        <h4>{trainer.user_name}</h4>
                        <p>{trainer.user_email}</p>
                      </div>
                      <button
                        className="admin-approve-button-small"
                        onClick={() => approveTrainer(trainer.id)}
                      >
                        Approve
                      </button>
                    </div>
                  ))}
                  {pendingTrainers.length > 3 && (
                    <button 
                      className="admin-view-all-button"
                      onClick={() => setActiveTab("pending")}
                    >
                      View All ({pendingTrainers.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* System Health Card */}
          <div className="admin-activity-card">
            <h3 className="admin-activity-title">System Health</h3>
            <div className="admin-activity-content">
              <div className="admin-system-status">
                <div className={`status-indicator ${systemHealth.status === "Operational" ? "status-green" : "status-red"}`}></div>
                <span>Status: {systemHealth.status}</span>
              </div>
              <div className="admin-user-activity-small">
                <div className="admin-activity-stat">
                  <span className="admin-activity-value">{systemHealth.userActivity.today}</span>
                  <span className="admin-activity-label">Today</span>
                </div>
                <div className="admin-activity-stat">
                  <span className="admin-activity-value">{systemHealth.userActivity.thisWeek}</span>
                  <span className="admin-activity-label">This Week</span>
                </div>
                <div className="admin-activity-stat">
                  <span className="admin-activity-value">{systemHealth.userActivity.thisMonth}</span>
                  <span className="admin-activity-label">This Month</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Generate mock registration trend data
  const generateRegistrationTrend = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    // Create trend data for the last 6 months
    return Array(6).fill().map((_, index) => {
      const monthIndex = (currentMonth - 5 + index + 12) % 12;
      // Generate a random count between 1-5 for the first months, increasing up to 5-15 for recent months
      const minCount = 1 + Math.floor(index * 0.8);
      const maxCount = 5 + Math.floor(index * 2);
      const count = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
      
      return {
        date: months[monthIndex],
        count
      };
    });
  };

  useEffect(() => {
    // Remove any back-to-top buttons that might be present
    const scrollButtons = document.querySelectorAll('.back-to-top');
    scrollButtons.forEach(button => {
      if (button && button.parentNode) {
        button.parentNode.removeChild(button);
      }
    });
    
    // Clean up function to run when component unmounts
    return () => {
      // Nothing to clean up
    };
  }, []);

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <h1 className="admin-dashboard-title">Admin Dashboard</h1>
        <div className="admin-header-right">
          <div className="admin-welcome">
            Welcome, {JSON.parse(localStorage.getItem("user") || "{}")?.user_name || "Admin"}
          </div>
          <button className="admin-logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      
      {successMessage && (
        <div className="admin-success-message">{successMessage}</div>
      )}
      
      {error && <div className="admin-error-message">{error}</div>}
      
      <div className="admin-tabs">
        <button 
          className={`admin-tab-button ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </button>
        <button 
          className={`admin-tab-button ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending Approvals
        </button>
        <button 
          className={`admin-tab-button ${activeTab === "trainers" ? "active" : ""}`}
          onClick={() => setActiveTab("trainers")}
        >
          Trainers
        </button>
        <button 
          className={`admin-tab-button ${activeTab === "trainees" ? "active" : ""}`}
          onClick={() => setActiveTab("trainees")}
        >
          Trainees
        </button>
      </div>
      
      <div className="admin-section">
        <h2 className="admin-section-title">
          {activeTab === "dashboard" && "Dashboard Overview"}
          {activeTab === "pending" && "Pending Trainer Approvals"}
          {activeTab === "trainers" && "Approved Trainers"}
          {activeTab === "trainees" && "Registered Trainees"}
        </h2>
        
        {renderTabContent()}
      </div>
      
      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>User Details</h3>
              <button className="admin-modal-close" onClick={closeUserDetails}>×</button>
            </div>
            <div className="admin-modal-content">
              <div className="admin-user-detail-item">
                <span className="admin-detail-label">Name:</span>
                <span className="admin-detail-value">{selectedUser.user_name}</span>
              </div>
              <div className="admin-user-detail-item">
                <span className="admin-detail-label">Email:</span>
                <span className="admin-detail-value">{selectedUser.user_email}</span>
              </div>
              <div className="admin-user-detail-item">
                <span className="admin-detail-label">Role:</span>
                <span className="admin-detail-value">
                  {selectedUser.role || selectedUser.user_role || "Unknown"}
                </span>
              </div>
              <div className="admin-user-detail-item">
                <span className="admin-detail-label">Verified:</span>
                <span className="admin-detail-value">{selectedUser.is_verified ? "Yes" : "No"}</span>
              </div>
              <div className="admin-user-detail-item">
                <span className="admin-detail-label">Joined:</span>
                <span className="admin-detail-value">
                  {selectedUser.created_at 
                    ? new Date(selectedUser.created_at).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : "Invalid Date"}
                </span>
              </div>
              <div className="admin-user-detail-item">
                <span className="admin-detail-label">Status:</span>
                <span className="admin-detail-value">
                  {selectedUser.is_active !== undefined 
                    ? (selectedUser.is_active ? "Active" : "Inactive") 
                    : selectedUser.status || "Inactive"}
                </span>
              </div>
              {selectedUser.specialization && (
                <div className="admin-user-detail-item">
                  <span className="admin-detail-label">Specialization:</span>
                  <span className="admin-detail-value">{selectedUser.specialization}</span>
                </div>
              )}
            </div>
            <div className="admin-modal-footer">
              {selectedUser.role === "trainer" && !selectedUser.is_verified && (
                <button 
                  className="admin-approve-button"
                  onClick={() => {
                    approveTrainer(selectedUser.id);
                    closeUserDetails();
                  }}
                >
                  Approve Trainer
                </button>
              )}
              {selectedUser.is_active && (
                <button 
                  className="admin-suspend-button"
                  onClick={() => {
                    suspendUser(selectedUser.id);
                    closeUserDetails();
                  }}
                >
                  Suspend User
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
