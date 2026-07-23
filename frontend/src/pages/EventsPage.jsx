import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import AdminDashboard from '../dashboards/AdminDashboard';
import EventTeamDashboard from '../dashboards/EventTeamDashboard';
import TreasurerDashboard from '../dashboards/TreasurerDashboard';
import GenSecDashboard from '../dashboards/GenSecDashboard';
import ChairpersonDashboard from '../dashboards/ChairpersonDashboard';

export default function EventsPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  
  // Admin dashboard states
  const [stats, setStats] = useState({ totalEvents: 0, activeUsers: 0, pendingApprovals: 0 });
  const [users, setUsers] = useState([]);
  const [adminEvents, setAdminEvents] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [adminActiveView, setAdminActiveView] = useState('overview');
  
  // Event Team dashboard states
  const [eventTeamStats, setEventTeamStats] = useState({ created: 0, pending: 0, published: 0 });
  const [myEvents, setMyEvents] = useState([]);
  const [eventTeamActiveView, setEventTeamActiveView] = useState('overview');
  const [eventForm, setEventForm] = useState({
    title: '', type: '', date: '', time: '', duration_hours: '', venue: '', expected_participants: '', prize_pool: '',
    requirements: {
      volunteers_needed: 0, rooms_needed: 0, refreshments_needed: false,
      stationary_needed: false, goodies_needed: false, physical_certificate: false, trophies_needed: false
    }
  });

  // Event Team dashboard functions
  const fetchEventTeamStats = async () => {
    try {
      const response = await axios.get('/events');
      const myEvents = response.data;
      setMyEvents(myEvents);
      
      const created = myEvents.length;
      const pending = myEvents.filter(e => ['CREATED', 'PENDING_TREASURER', 'TREASURER_APPROVED', 'PENDING_GEN_SEC', 'GEN_SEC_APPROVED', 'PENDING_CHAIRPERSON'].includes(e.status)).length;
      const published = myEvents.filter(e => e.status === 'PUBLISHED').length;
      
      setEventTeamStats({ created, pending, published });
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const fetchEventTypesForForm = async () => {
    try {
      const response = await axios.get('/events/types/all');
      setEventTypes(response.data);
    } catch (error) {
      console.error('Failed to fetch event types:', error);
    }
  };

  const handleTypeChange = (typeName) => {
    const selectedType = eventTypes.find(t => t.name === typeName);
    if (selectedType && selectedType.default_requirements) {
      setEventForm({
        ...eventForm,
        type: typeName,
        requirements: selectedType.default_requirements
      });
    } else {
      setEventForm({...eventForm, type: typeName});
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/events', eventForm);
      alert('🎉 Event created successfully!');
      setEventForm({
        title: '', type: '', date: '', time: '', duration_hours: '', venue: '', expected_participants: '', prize_pool: '',
        requirements: {
          volunteers_needed: 0, rooms_needed: 0, refreshments_needed: false,
          stationary_needed: false, goodies_needed: false, physical_certificate: false, trophies_needed: false
        }
      });
      setEventTeamActiveView('overview');
      fetchEventTeamStats();
    } catch (error) {
      alert('❌ Failed to create event: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleSubmitForApproval = async (eventId) => {
    try {
      await axios.put(`/events/${eventId}/submit`);
      alert('✅ Event submitted for treasurer approval!');
      fetchEventTeamStats();
    } catch (error) {
      alert('❌ Failed to submit: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchNotifications();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/events/published');
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/notifications');
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    }
  };

  // Admin dashboard functions
  const fetchStats = async () => {
    try {
      const response = await axios.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/admin/users');
      setUsers(response.data);
      setAdminActiveView('users');
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchAdminEvents = async () => {
    try {
      const response = await axios.get('/admin/events');
      setAdminEvents(response.data);
      setAdminActiveView('events');
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const fetchEventTypes = async () => {
    try {
      const response = await axios.get('/events/types/all');
      setEventTypes(response.data);
      setAdminActiveView('eventTypes');
    } catch (error) {
      console.error('Failed to fetch event types:', error);
    }
  };

  const renderOverview = () => (
    <div className="card-grid fade-in">
      <div className="card">
        <h3 className="card-title">📊 System Overview</h3>
        <div className="card-content">
          <p><strong>Total Events:</strong> {stats.totalEvents}</p>
          <p><strong>Active Users:</strong> {stats.activeUsers}</p>
          <p><strong>Pending Approvals:</strong> {stats.pendingApprovals}</p>
        </div>
      </div>
      <div className="card">
        <h3 className="card-title">⚡ Quick Actions</h3>
        <div className="card-content">
          <button className="btn btn-primary" onClick={fetchAdminEvents} style={{ margin: '0.25rem', width: '100%' }}>
            📅 View All Events
          </button>
          <button className="btn btn-success" onClick={fetchUsers} style={{ margin: '0.25rem', width: '100%' }}>
            👥 Manage Users
          </button>
          <button className="btn btn-primary" onClick={fetchEventTypes} style={{ margin: '0.25rem', width: '100%' }}>
            🏷️ Manage Event Types
          </button>
          <button className="btn btn-secondary" onClick={() => setAdminActiveView('settings')} style={{ margin: '0.25rem', width: '100%' }}>
            ⚙️ System Settings
          </button>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">👥 User Management</h3>
        <button className="btn btn-secondary" onClick={() => setAdminActiveView('overview')}>
          ← Back to Overview
        </button>
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td><span className="status-badge status-created">{user.role?.name}</span></td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAdminEvents = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">📅 Event Management</h3>
        <button className="btn btn-secondary" onClick={() => setAdminActiveView('overview')}>
          ← Back to Overview
        </button>
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Created By</th>
            </tr>
          </thead>
          <tbody>
            {adminEvents.map(event => (
              <tr key={event._id}>
                <td>{event.name}</td>
                <td>{event.event_type}</td>
                <td>
                  <span className={`status-badge ${
                    event.status === 'PUBLISHED' ? 'status-published' : 
                    event.status === 'CREATED' ? 'status-created' : 'status-pending'
                  }`}>
                    {event.status}
                  </span>
                </td>
                <td>{event.user?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDashboard = () => {
    switch (user?.role) {
      case "ADMIN":
        // Initialize admin stats when dashboard is first shown
        if (showDashboard && stats.totalEvents === 0) {
          fetchStats();
        }
        return (
          <div>
            {adminActiveView === 'overview' && renderOverview()}
            {adminActiveView === 'users' && renderUsers()}
            {adminActiveView === 'events' && renderAdminEvents()}
            {adminActiveView === 'eventTypes' && (
              <div className="fade-in">
                <div className="nav-header">
                  <h3 className="nav-title">🏷️ Event Type Management</h3>
                  <button className="btn btn-secondary" onClick={() => {
                    setAdminActiveView('overview');
                    fetchStats();
                  }}>
                    ← Back to Overview
                  </button>
                </div>
                <div className="card">
                  <h4>Event Types functionality coming soon...</h4>
                </div>
              </div>
            )}
            {adminActiveView === 'settings' && (
              <div className="fade-in">
                <div className="nav-header">
                  <h3 className="nav-title">⚙️ System Settings</h3>
                  <button className="btn btn-secondary" onClick={() => {
                    setAdminActiveView('overview');
                    fetchStats();
                  }}>
                    ← Back to Overview
                  </button>
                </div>
                <div className="card">
                  <h4>😧 Coming Soon!</h4>
                  <p>Advanced system configuration features</p>
                </div>
              </div>
            )}
          </div>
        );
      case "EVENT_TEAM":
        // Initialize event team stats when dashboard is first shown
        if (showDashboard && eventTeamStats.created === 0) {
          fetchEventTeamStats();
          fetchEventTypesForForm();
        }
        return (
          <div key={`event-team-${eventTeamActiveView}`}>
            {eventTeamActiveView === 'overview' && (
              <div className="card-grid fade-in">
                <div className="card">
                  <h3 className="card-title">📊 My Events</h3>
                  <div className="card-content">
                    <p><strong>Created:</strong> {eventTeamStats.created}</p>
                    <p><strong>Pending Approval:</strong> {eventTeamStats.pending}</p>
                    <p><strong>Published:</strong> {eventTeamStats.published}</p>
                  </div>
                </div>
                <div className="card">
                  <h3 className="card-title">⚡ Actions</h3>
                  <div className="card-content">
                    <button className="btn btn-primary" onClick={() => setEventTeamActiveView('create')} style={{ margin: '0.25rem', width: '100%' }}>
                      ➕ Create New Event
                    </button>
                    <button className="btn btn-success" onClick={() => setEventTeamActiveView('events')} style={{ margin: '0.25rem', width: '100%' }}>
                      📋 View My Events
                    </button>
                  </div>
                </div>
              </div>
            )}
            {eventTeamActiveView === 'create' && (
              <div className="fade-in">
                <div className="nav-header">
                  <h3 className="nav-title">➕ Create New Event</h3>
                  <span 
                    onClick={() => {
                      console.log('Clicked back to overview');
                      setEventTeamActiveView('overview');
                    }}
                    style={{
                      color: '#00E5FF',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: '16px',
                      pointerEvents: 'all',
                      zIndex: 9999,
                      position: 'relative',
                      display: 'inline-block',
                      padding: '5px 10px'
                    }}
                  >
                    ← Back to Overview
                  </span>
                </div>
                <form onSubmit={handleCreateEvent} className="form-container">
                  <div className="form-group">
                    <label className="form-label">Event Name *</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="Enter event name"
                      required
                      value={eventForm.title}
                      onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Date *</label>
                      <input 
                        type="date" 
                        className="form-input"
                        required
                        value={eventForm.date}
                        onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Time *</label>
                      <input 
                        type="time" 
                        className="form-input"
                        required
                        value={eventForm.time}
                        onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Duration (hours) *</label>
                    <input 
                      type="number" 
                      className="form-input"
                      placeholder="e.g., 3"
                      required
                      min="1"
                      value={eventForm.duration_hours || ''}
                      onChange={(e) => setEventForm({...eventForm, duration_hours: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Event Type *</label>
                    <select 
                      className="form-select"
                      required
                      value={eventForm.type}
                      onChange={(e) => handleTypeChange(e.target.value)}
                    >
                      <option value="">Select Event Type</option>
                      {eventTypes.map(type => (
                        <option key={type._id} value={type.name}>{type.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Expected Participants *</label>
                      <input 
                        type="number" 
                        className="form-input"
                        placeholder="e.g., 100"
                        required
                        value={eventForm.expected_participants}
                        onChange={(e) => setEventForm({...eventForm, expected_participants: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Total Prize Pool (₹)</label>
                      <input 
                        type="number" 
                        className="form-input"
                        placeholder="e.g., 50000"
                        value={eventForm.prize_pool}
                        onChange={(e) => setEventForm({...eventForm, prize_pool: e.target.value})}
                      />
                    </div>
                  </div>

                  {eventForm.prize_pool > 0 && (
                    <div className="form-group" style={{ background: 'rgba(245,179,1,0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(245,179,1,0.3)' }}>
                      <label className="form-label">Prize Distribution</label>
                      <p style={{ margin: '0.5rem 0', color: 'var(--text-muted)' }}>
                        🥇 1st Place: ₹{(eventForm.prize_pool * 0.5).toFixed(2)} (50%)<br/>
                        🥈 2nd Place: ₹{(eventForm.prize_pool * 0.3).toFixed(2)} (30%)<br/>
                        🥉 3rd Place: ₹{(eventForm.prize_pool * 0.2).toFixed(2)} (20%)
                      </p>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Venue</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="Enter venue location"
                      value={eventForm.venue}
                      onChange={(e) => setEventForm({...eventForm, venue: e.target.value})}
                    />
                  </div>

                  <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--accent-gold)' }}>📋 Requirements</h4>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Volunteers Needed</label>
                      <input 
                        type="number" 
                        className="form-input"
                        value={eventForm.requirements.volunteers_needed}
                        onChange={(e) => setEventForm({...eventForm, requirements: {...eventForm.requirements, volunteers_needed: parseInt(e.target.value) || 0}})}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Rooms Needed</label>
                      <input 
                        type="number" 
                        className="form-input"
                        value={eventForm.requirements.rooms_needed}
                        onChange={(e) => setEventForm({...eventForm, requirements: {...eventForm.requirements, rooms_needed: parseInt(e.target.value) || 0}})}
                      />
                    </div>
                  </div>

                  <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={eventForm.requirements.refreshments_needed}
                        onChange={(e) => setEventForm({...eventForm, requirements: {...eventForm.requirements, refreshments_needed: e.target.checked}})}
                      />
                      <span>🍽️ Refreshments Needed</span>
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={eventForm.requirements.stationary_needed}
                        onChange={(e) => setEventForm({...eventForm, requirements: {...eventForm.requirements, stationary_needed: e.target.checked}})}
                      />
                      <span>📝 Stationary Needed</span>
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={eventForm.requirements.goodies_needed}
                        onChange={(e) => setEventForm({...eventForm, requirements: {...eventForm.requirements, goodies_needed: e.target.checked}})}
                      />
                      <span>🎁 Goodies Needed</span>
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={eventForm.requirements.physical_certificate}
                        onChange={(e) => setEventForm({...eventForm, requirements: {...eventForm.requirements, physical_certificate: e.target.checked}})}
                      />
                      <span>📜 Physical Certificate</span>
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={eventForm.requirements.trophies_needed}
                        onChange={(e) => setEventForm({...eventForm, requirements: {...eventForm.requirements, trophies_needed: e.target.checked}})}
                      />
                      <span>🏆 Trophies Needed</span>
                    </label>
                  </div>

                  <button 
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '1rem', marginTop: '2rem' }}
                  >
                    🚀 Create Event
                  </button>
                </form>
              </div>
            )}
            {eventTeamActiveView === 'events' && (
              <div className="fade-in">
                <div className="nav-header">
                  <h3 className="nav-title">📋 My Events</h3>
                  <span 
                    onClick={() => {
                      console.log('Clicked back to overview from events');
                      setEventTeamActiveView('overview');
                    }}
                    style={{
                      color: '#00E5FF',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: '16px',
                      pointerEvents: 'all',
                      zIndex: 9999,
                      position: 'relative',
                      display: 'inline-block',
                      padding: '5px 10px'
                    }}
                  >
                    ← Back to Overview
                  </span>
                </div>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Participants</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myEvents.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            📝 No events created yet. Click "Create New Event" to get started!
                          </td>
                        </tr>
                      ) : (
                        myEvents.map(event => (
                          <tr key={event._id}>
                            <td>{event.title}</td>
                            <td>{event.type}</td>
                            <td>{new Date(event.date).toLocaleDateString()}</td>
                            <td>{event.expected_participants}</td>
                            <td>
                              <span className={`status-badge ${
                                event.status === 'PUBLISHED' ? 'status-published' : 
                                event.status === 'CREATED' ? 'status-created' : 
                                event.status === 'REJECTED' ? 'status-rejected' : 'status-pending'
                              }`}>
                                {event.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td>
                              {event.status === 'CREATED' && (
                                <button 
                                  className="btn btn-success"
                                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                  onClick={() => handleSubmitForApproval(event._id)}
                                >
                                  ✅ Submit
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      case "TREASURER":
      case "GENERAL_SECRETARY":
      case "CHAIRPERSON":
        return (
          <div className="card">
            <h3 className="card-title">📊 {user.role.replace('_', ' ')} Dashboard</h3>
            <div className="card-content">
              <p>Dashboard functionality for {user.role.replace('_', ' ')} role coming soon...</p>
              <p>This will include role-specific features like:</p>
              <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
                <li>Event approval workflows</li>
                <li>Budget management</li>
                <li>Status tracking</li>
                <li>Reporting features</li>
              </ul>
            </div>
          </div>
        );
      default:
        return <div>Dashboard not available for your role</div>;
    }
  };

  return (
    <div className="niral-home">
      {/* Header */}
      <header className="niral-header">
        <div className="niral-nav-content">
          <div className="nav-left">
            <img src="/nirallogo.png" alt="NIRAL Logo" className="nav-logo" />
            <span style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: '600', marginLeft: '1rem' }}>
              Welcome, {user?.name}
            </span>
          </div>
          
          <div className="nav-right">
            <div style={{ position: 'relative', marginRight: '1rem' }}>
              <button 
                className="btn-back" 
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ position: 'relative' }}
              >
                🔔 Notifications
                {notifications.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: 'var(--accent-danger)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {notifications.length}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border-soft)',
                  borderRadius: '12px',
                  padding: '1rem',
                  minWidth: '300px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                  zIndex: 1000
                }}>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Notifications</h4>
                  {notifications.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No notifications</p>
                  ) : (
                    notifications.map((notif, index) => (
                      <div key={index} style={{
                        padding: '0.75rem',
                        marginBottom: '0.5rem',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        borderLeft: '3px solid var(--accent-gold)'
                      }}>
                        <p style={{ color: 'var(--text-primary)', fontSize: '14px', margin: '0' }}>
                          {notif.message || 'New notification'}
                        </p>
                        <small style={{ color: 'var(--text-muted)' }}>
                          {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : 'Recent'}
                        </small>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            
            <button className="btn-back" onClick={() => setShowDashboard(true)} style={{ marginRight: '1rem' }}>
              📊 Dashboard
            </button>
            
            <button className="btn-back" onClick={logout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Section */}
      <div style={{ padding: '140px 60px 80px', background: 'var(--bg-main)', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {!showDashboard ? (
            <>
                <h1 style={{ 
                fontSize: '40px', 
                fontWeight: '700', 
                background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent', 
                marginBottom: '2rem', 
                textAlign: 'center' 
              }}>
                Published Events - UPDATED
              </h1>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                {events.map(event => (
                  <div key={event._id} style={{ 
                    background: 'var(--bg-glass)', 
                    border: '1px solid var(--border-soft)', 
                    borderRadius: '18px', 
                    padding: '1.5rem', 
                    backdropFilter: 'blur(16px)', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.4)' 
                  }}>
                    {event.cover_photo && (
                      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                        <img 
                          src={`http://localhost:5000/${event.cover_photo}`} 
                          alt="Event Cover" 
                          style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px' }}
                        />
                      </div>
                    )}
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                      {event.title}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
                      {event.description}
                    </p>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                          📅 {new Date(event.date).toLocaleDateString()}
                        </span>
                        <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                          🕐 {event.time}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ 
                          background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)', 
                          color: 'var(--bg-main)', 
                          padding: '0.4rem 0.8rem', 
                          borderRadius: '20px', 
                          fontSize: '0.75rem', 
                          fontWeight: '600' 
                        }}>
                          {event.type}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          {event.duration_hours}h
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                        📍 <strong>Venue:</strong> {event.hospitality?.venue_details || event.venue || 'Not allocated'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                        💰 Prize Pool: ₹{event.prize_pool || 0}
                      </span>
                      <span style={{ 
                        background: 'var(--bg-secondary)', 
                        color: 'var(--text-primary)', 
                        padding: '8px 16px', 
                        borderRadius: '999px', 
                        fontSize: '0.85rem' 
                      }}>
                        Published
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {events.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <p>No published events available at the moment.</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ 
                  fontSize: '40px', 
                  fontWeight: '700', 
                  background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent', 
                  margin: '0'
                }}>
                  Dashboard
                </h1>
                <button className="btn-back" onClick={() => setShowDashboard(false)}>
                  ← Back to Events
                </button>
              </div>
              {renderDashboard()}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: 'var(--bg-secondary)', padding: '2rem 0', textAlign: 'center', borderTop: '1px solid var(--border-soft)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0' }}>
            © NIRAL 2026
          </p>
        </div>
      </footer>
    </div>
  );
}