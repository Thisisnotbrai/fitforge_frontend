// components/Views/Trainee/Dashboard.jsx
import { useState, useEffect, useCallback } from "react";
import "./Dashboard.css";
import Modal from "../../../components/Modal";
// When packages are installed, uncomment these imports:
// import { Calendar, momentLocalizer } from 'react-big-calendar';
// import moment from 'moment';
// import 'react-big-calendar/lib/css/react-big-calendar.css';

// Define the Dashboard component
function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showAllEventsModal, setShowAllEventsModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState(new Set());
  const [currentEvent, setCurrentEvent] = useState({
    id: null,
    title: "",
    description: "",
    start: new Date(),
    end: new Date(),
    type: "workout" // workout, nutrition, rest, etc.
  });
  
  // Update the clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Clean up the interval on component unmount
    return () => {
      clearInterval(timer);
    };
  }, []);
  
  // Get the current user email
  const getCurrentUserEmail = () => {
    try {
      const userString = localStorage.getItem("user");
      if (!userString) return null;
      
      const user = JSON.parse(userString);
      return user.email || null;
    } catch (error) {
      console.error("Error getting current user email:", error);
      return null;
    }
  };
  
  // Helper function to get events storage key for the user
  const getEventsStorageKey = useCallback(() => {
    const userEmail = getCurrentUserEmail();
    return userEmail ? `fitnessEvents_${userEmail}` : null;
  }, []);
  
  // Helper function to safely serialize dates for storage
  const serializeEventsForStorage = (eventsArray) => {
    return eventsArray.map(event => ({
      ...event,
      // Keep the date objects as ISO strings for storage
      start: event.start instanceof Date ? event.start.toISOString() : event.start,
      end: event.end instanceof Date ? event.end.toISOString() : event.end
    }));
  };
  
  // Load user's events from localStorage
  useEffect(() => {
    const storageKey = getEventsStorageKey();
    if (!storageKey) {
      console.error("No user email found, cannot load events");
      return;
    }
    
    try {
      // Get user-specific events
      const storedEvents = localStorage.getItem(storageKey);
      
      if (storedEvents) {
        try {
          // Parse and convert date strings back to Date objects
          const parsedEvents = JSON.parse(storedEvents).map(event => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end)
          }));
          setEvents(parsedEvents);
          console.log("Events loaded successfully:", parsedEvents);
        } catch (error) {
          console.error("Error parsing stored events:", error);
          setEvents([]);
        }
      } else {
        // Sample events data for new users
        const sampleEvents = [
          {
            id: 1,
            title: 'Morning Workout',
            description: 'Cardio and upper body training',
            start: new Date(new Date().setHours(8, 0, 0)),
            end: new Date(new Date().setHours(9, 0, 0)),
            type: 'workout'
          },
          {
            id: 2,
            title: 'Evening Run',
            description: '5K run in the park',
            start: new Date(new Date().setHours(18, 0, 0)),
            end: new Date(new Date().setHours(19, 0, 0)),
            type: 'workout'
          },
          {
            id: 3,
            title: 'Nutrition Consultation',
            description: 'Meeting with nutritionist',
            start: new Date(new Date().setDate(new Date().getDate() + 1)),
            end: new Date(new Date().setDate(new Date().getDate() + 1)),
            type: 'nutrition'
          }
        ];
        
        setEvents(sampleEvents);
        
        // Save the sample events to localStorage
        try {
          const serializedEvents = serializeEventsForStorage(sampleEvents);
          localStorage.setItem(storageKey, JSON.stringify(serializedEvents));
          console.log("Sample events saved successfully:", serializedEvents);
        } catch (error) {
          console.error("Error saving sample events:", error);
        }
      }
    } catch (error) {
      console.error("Error in loading events:", error);
      setEvents([]);
    }
  }, [getEventsStorageKey]);
  
  // Save events to localStorage whenever they change
  useEffect(() => {
    if (events.length === 0) return;
    
    const storageKey = getEventsStorageKey();
    if (!storageKey) {
      console.error("No user email found, cannot save events");
      return;
    }
    
    try {
      const serializedEvents = serializeEventsForStorage(events);
      localStorage.setItem(storageKey, JSON.stringify(serializedEvents));
      console.log("Events saved successfully:", serializedEvents);
    } catch (error) {
      console.error("Error saving events to localStorage:", error);
    }
  }, [events, getEventsStorageKey]);
  
  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (event) => {
      const storageKey = getEventsStorageKey();
      if (event.storageArea === localStorage && event.key === storageKey) {
        console.log("Detected storage change from another tab...");
        try {
          if (event.newValue) {
            const parsedEvents = JSON.parse(event.newValue).map(ev => ({
              ...ev,
              start: new Date(ev.start),
              end: new Date(ev.end)
            }));
            setEvents(parsedEvents);
            console.log("Events updated from storage change:", parsedEvents);
          } else {
            // Handle case where events might be cleared
            setEvents([]);
            console.log("Events cleared due to storage change.");
          }
        } catch (error) {
          console.error("Error processing storage change event:", error);
          // Optionally keep old state or set to empty
          // setEvents([]); 
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
    // Rerun this effect if the storage key calculation changes (e.g., user logs out/in)
  }, [getEventsStorageKey]); 
  
  // Format the current time
  const formatTime = (date) => {
    if (!(date instanceof Date)) {
      console.error("Invalid date provided to formatTime:", date);
      return "";
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  // Format the current date
  const formatDate = (date) => {
    if (!(date instanceof Date)) {
      console.error("Invalid date provided to formatDate:", date);
      return "";
    }
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };
  
  // Format date for calendar header
  const formatMonthYear = (date) => {
    if (!(date instanceof Date)) {
      console.error("Invalid date provided to formatMonthYear:", date);
      return "";
    }
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  // Get day name of week (Su, Mo, etc)
  const getDayOfWeek = (dayIndex) => {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    return days[dayIndex];
  };
  
  // Generate calendar days for current month view
  const generateCalendarDays = () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      // First day of the month
      const firstDay = new Date(year, month, 1);
      // Last day of the month
      const lastDay = new Date(year, month + 1, 0);
      
      // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
      const firstDayOfWeek = firstDay.getDay();
      
      // Calculate days from previous month to show
      const daysFromPrevMonth = firstDayOfWeek;
      
      // Get the last day of the previous month
      const lastDayPrevMonth = new Date(year, month, 0).getDate();
      
      // Calculate days from next month to show
      const daysInMonth = lastDay.getDate();
      const totalCells = 42; // 6 rows of 7 days
      const daysFromNextMonth = totalCells - daysInMonth - daysFromPrevMonth;
      
      let days = [];
      
      // Add days from previous month
      for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
        const day = lastDayPrevMonth - i;
        days.push({
          day,
          month: month - 1,
          year,
          currentMonth: false,
          date: new Date(year, month - 1, day)
        });
      }
      
      // Add days from current month
      for (let i = 1; i <= daysInMonth; i++) {
        days.push({
          day: i,
          month,
          year,
          currentMonth: true,
          date: new Date(year, month, i)
        });
      }
      
      // Add days from next month
      for (let i = 1; i <= daysFromNextMonth; i++) {
        days.push({
          day: i,
          month: month + 1,
          year,
          currentMonth: false,
          date: new Date(year, month + 1, i)
        });
      }
      
      return days;
    } catch (error) {
      console.error("Error generating calendar days:", error);
      return [];
    }
  };
  
  // Check if a date has events
  const hasEvents = (date) => {
    if (!(date instanceof Date)) return false;
    
    return events.some(event => {
      try {
        const eventStart = event.start instanceof Date ? event.start : new Date(event.start);
        return eventStart.getDate() === date.getDate() &&
               eventStart.getMonth() === date.getMonth() &&
               eventStart.getFullYear() === date.getFullYear();
      } catch (error) {
        console.error("Error in hasEvents check:", error);
        return false;
      }
    });
  };
  
  // Get events for a specific date
  const getEventsForDate = (date) => {
    if (!(date instanceof Date)) return [];
    
    return events.filter(event => {
      try {
        const eventStart = event.start instanceof Date ? event.start : new Date(event.start);
        return eventStart.getDate() === date.getDate() &&
               eventStart.getMonth() === date.getMonth() &&
               eventStart.getFullYear() === date.getFullYear();
      } catch (error) {
        console.error("Error in getEventsForDate:", error);
        return false;
      }
    });
  };
  
  // Handle month navigation
  const changeMonth = (increment) => {
    try {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + increment);
      setCurrentDate(newDate);
    } catch (error) {
      console.error("Error changing month:", error);
    }
  };
  
  // Handle date selection
  const handleDateClick = (date) => {
    if (!(date instanceof Date)) {
      console.error("Invalid date provided to handleDateClick:", date);
      return;
    }
    setSelectedDate(date);
    setShowCalendarModal(false);
  };
  
  // Open modal to add new event
  const handleAddEvent = () => {
    try {
      // Create default end time 1 hour after start
      const startDate = new Date(selectedDate);
      const endDate = new Date(selectedDate);
      endDate.setHours(startDate.getHours() + 1);
      
      setCurrentEvent({
        id: null, // Set to null for new events
        title: "",
        description: "",
        start: startDate,
        end: endDate,
        type: "workout"
      });
      setShowEventModal(true);
    } catch (error) {
      console.error("Error in handleAddEvent:", error);
    }
  };
  
  // Open modal to edit existing event
  const handleEditEvent = (event) => {
    try {
      const eventToEdit = {
        ...event,
        start: event.start instanceof Date ? event.start : new Date(event.start),
        end: event.end instanceof Date ? event.end : new Date(event.end)
      };
      setCurrentEvent(eventToEdit);
      setShowEventModal(true);
    } catch (error) {
      console.error("Error in handleEditEvent:", error);
    }
  };
  
  // Save event (add new or update existing)
  const handleSaveEvent = () => {
    try {
      if (currentEvent.title.trim() === "") {
        alert("Event title cannot be empty");
        return;
      }
      
      // Ensure start and end are valid dates
      const startDate = currentEvent.start instanceof Date 
        ? currentEvent.start 
        : new Date(currentEvent.start);
      
      const endDate = currentEvent.end instanceof Date 
        ? currentEvent.end 
        : new Date(currentEvent.end);
        
      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        alert("Invalid date values");
        return;
      }
      
      // Create the event with validated dates
      const eventToSave = {
        ...currentEvent,
        start: startDate,
        end: endDate
      };
      
      if (currentEvent.id) {
        // Update existing event
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === currentEvent.id ? eventToSave : event
          )
        );
        console.log("Updated event:", eventToSave);
      } else {
        // Add new event with a new ID
        const newEvent = {...eventToSave, id: Date.now()};
        setEvents(prevEvents => [...prevEvents, newEvent]);
        console.log("Added new event:", newEvent);
      }
      
      setShowEventModal(false);
    } catch (error) {
      console.error("Error saving event:", error);
      alert("There was an error saving your event. Please try again.");
    }
  };
  
  // Delete an event
  const handleDeleteEvent = (eventId) => {
    try {
      if (!eventId) {
        console.error("No event ID provided for deletion");
        return;
      }
      
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      console.log("Deleted event with ID:", eventId);
      setShowEventModal(false);
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("There was an error deleting your event. Please try again.");
    }
  };
  
  // Handle input changes for event form
  const handleEventInputChange = (e) => {
    try {
      const { name, value } = e.target;
      setCurrentEvent(prevEvent => ({
        ...prevEvent,
        [name]: value
      }));
    } catch (error) {
      console.error("Error in handleEventInputChange:", error);
    }
  };
  
  // Handle time input changes, ensuring valid dates
  const handleTimeChange = (e, fieldName) => {
    try {
      const { value } = e.target;
      const [hours, minutes] = value.split(':');
      
      if (fieldName === 'startTime' || fieldName === 'endTime') {
        const dateField = fieldName === 'startTime' ? 'start' : 'end';
        const currentDateTime = currentEvent[dateField] instanceof Date 
          ? new Date(currentEvent[dateField]) 
          : new Date(currentEvent[dateField]);
          
        if (!isNaN(currentDateTime)) {
          currentDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
          
          setCurrentEvent(prev => ({
            ...prev,
            [dateField]: currentDateTime
          }));
        }
      }
    } catch (error) {
      console.error(`Error setting ${fieldName}:`, error);
    }
  };
  
  // Handle multiple event selection
  const handleEventSelection = (event, eventId) => {
    event.stopPropagation(); // Prevent opening edit modal
    setSelectedEvents(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(eventId)) {
        newSelection.delete(eventId);
      } else {
        newSelection.add(eventId);
      }
      return newSelection;
    });
  };

  // Delete multiple events
  const handleDeleteMultipleEvents = () => {
    if (selectedEvents.size === 0) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedEvents.size} event${selectedEvents.size > 1 ? 's' : ''}?`
    );

    if (confirmDelete) {
      setEvents(prevEvents => 
        prevEvents.filter(event => !selectedEvents.has(event.id))
      );
      setSelectedEvents(new Set());
    }
  };
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome to Your FitForge Dashboard</h1>
          <p>Track your fitness journey, access workouts, and monitor your progress.</p>
        </div>
        <div className="time-section">
          <div className="real-time-clock">
            <h2>{formatTime(currentTime)}</h2>
            <p>{formatDate(currentTime)}</p>
          </div>
        </div>
      </div>
      
      <div className="calendar-section">
        <h2>Your Fitness Calendar</h2>
        
        <div className="calendar-container">
          <div className="calendar-header">
            <button className="calendar-today-btn" onClick={() => setSelectedDate(new Date())}>
              {selectedDate instanceof Date ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : "Today"}
            </button>
            <div className="calendar-buttons">
              <button className="calendar-toggle-btn" onClick={() => setShowCalendarModal(true)}>
                Open Calendar
              </button>
              <button className="calendar-toggle-btn view-all" onClick={() => setShowAllEventsModal(true)}>
                View All Events
              </button>
            </div>
          </div>
          
          <div className="selected-date-events">
            <div className="date-events-header">
              <h3>Events for {selectedDate instanceof Date ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "Today"}</h3>
              <button className="add-event-btn" onClick={handleAddEvent}>+ Add Event</button>
            </div>
            
            <div className="event-list">
              {getEventsForDate(selectedDate).length > 0 ? (
                getEventsForDate(selectedDate).map(event => (
                  <div key={event.id} className={`event-item event-type-${event.type}`} onClick={() => handleEditEvent(event)}>
                    <h4>{event.title}</h4>
                    <p className="event-time">
                      {event.start instanceof Date 
                        ? event.start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) 
                        : new Date(event.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                      } - 
                      {event.end instanceof Date 
                        ? event.end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) 
                        : new Date(event.end).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                      }
                    </p>
                    <p className="event-description">{event.description}</p>
                    <div className="event-type-badge">{event.type}</div>
                  </div>
                ))
              ) : (
                <div className="no-events-message">
                  <p>No events scheduled for this day.</p>
                  <button className="add-event-btn secondary" onClick={handleAddEvent}>Schedule a workout</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Calendar Modal */}
      {showCalendarModal && (
        <div className="calendar-modal-overlay">
          <div className="calendar-modal">
            <div className="calendar-modal-header">
              <h3>Select Date</h3>
              <button className="modal-close-btn" onClick={() => setShowCalendarModal(false)}>×</button>
            </div>
            
            <div className="purple-calendar">
              <div className="calendar-month-header">
                <h3>{formatMonthYear(currentDate)}</h3>
                <div className="calendar-nav">
                  <button onClick={() => changeMonth(-1)}>▲</button>
                  <button onClick={() => changeMonth(1)}>▼</button>
                </div>
              </div>
              
              <div className="calendar-grid">
                <div className="calendar-weekdays">
                  {[0, 1, 2, 3, 4, 5, 6].map(day => (
                    <div key={day} className="calendar-weekday">{getDayOfWeek(day)}</div>
                  ))}
                </div>
                
                <div className="calendar-days">
                  {generateCalendarDays().map((day, index) => {
                    const isToday = 
                      day.day === new Date().getDate() && 
                      day.month === new Date().getMonth() && 
                      day.year === new Date().getFullYear();
                    
                    const isSelected = selectedDate instanceof Date && (
                      day.day === selectedDate.getDate() && 
                      day.month === selectedDate.getMonth() && 
                      day.year === selectedDate.getFullYear()
                    );
                    
                    return (
                      <div 
                        key={index} 
                        className={`calendar-day ${!day.currentMonth ? 'other-month' : ''} 
                                   ${isToday ? 'today' : ''} 
                                   ${isSelected ? 'selected' : ''} 
                                   ${hasEvents(day.date) ? 'has-events' : ''}`}
                        onClick={() => handleDateClick(day.date)}
                      >
                        {day.day}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Event creation/editing modal */}
      {showEventModal && (
        <div className="event-modal-overlay">
          <div className="event-modal">
            <div className="modal-header">
              <h3>{currentEvent.id ? "Edit Event" : "Add New Event"}</h3>
              <button className="modal-close-btn" onClick={() => setShowEventModal(false)}>×</button>
            </div>
            
            <div className="event-form">
              <div className="form-group">
                <label>Title</label>
                <input 
                  type="text" 
                  name="title" 
                  value={currentEvent.title} 
                  onChange={handleEventInputChange} 
                  placeholder="Event title"
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  name="description" 
                  value={currentEvent.description} 
                  onChange={handleEventInputChange} 
                  placeholder="Event description"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input 
                    type="time" 
                    name="startTime" 
                    value={(currentEvent.start instanceof Date 
                      ? currentEvent.start 
                      : new Date(currentEvent.start)).toTimeString().substring(0, 5)} 
                    onChange={(e) => handleTimeChange(e, 'startTime')} 
                  />
                </div>
                
                <div className="form-group">
                  <label>End Time</label>
                  <input 
                    type="time" 
                    name="endTime" 
                    value={(currentEvent.end instanceof Date 
                      ? currentEvent.end 
                      : new Date(currentEvent.end)).toTimeString().substring(0, 5)} 
                    onChange={(e) => handleTimeChange(e, 'endTime')} 
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Event Type</label>
                <select 
                  name="type" 
                  value={currentEvent.type} 
                  onChange={handleEventInputChange}
                >
                  <option value="workout">Workout</option>
                  <option value="nutrition">Nutrition</option>
                  <option value="rest">Rest</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowEventModal(false)}>Cancel</button>
              {currentEvent.id && (
                <button className="delete-btn" onClick={() => handleDeleteEvent(currentEvent.id)}>Delete</button>
              )}
              <button className="save-btn" onClick={handleSaveEvent}>Save</button>
            </div>
          </div>
        </div>
      )}
      </div>
  );
}

// Export the Dashboard component as default
export default Dashboard;