import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const TechopsDashboard = ({ onBackToEvents }) => {
  const [activeView, setActiveView] = useState('overview');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [onsiteForm, setOnsiteForm] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    department: '',
    year: '',
    selectedEvents: []
  });
  const [onsiteRegistrations, setOnsiteRegistrations] = useState([]);
  const [onsiteStats, setOnsiteStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    rejected: 0
  });
  const [stats, setStats] = useState({
    totalEvents: 0,
    todayEvents: 0,
    totalParticipants: 0,
    uniqueParticipants: 0,
    attendanceMarked: 0
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/techops/events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setEvents(response.data.events);
        await calculateStats(response.data.events);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      alert('Failed to fetch events');
    }
  };

  const calculateStats = async (eventsList) => {
    const today = new Date().toDateString();
    const todayEvents = eventsList.filter(event => 
      new Date(event.date).toDateString() === today
    );

    let totalParticipants = 0;
    let attendanceMarked = 0;
    const uniqueParticipantIds = new Set();
    
    try {
      const token = localStorage.getItem('token');
      for (const event of eventsList) {
        const response = await axios.get(`/techops/events/${event._id}/participants`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          totalParticipants += response.data.total_registered || 0;
          attendanceMarked += response.data.total_present || 0;
          
          // Add unique participant IDs to set
          response.data.participants?.forEach(p => {
            uniqueParticipantIds.add(p.participant_id);
          });
        }
      }
    } catch (error) {
      console.error('Error calculating stats:', error);
    }

    setStats({
      totalEvents: eventsList.length,
      todayEvents: todayEvents.length,
      totalParticipants,
      uniqueParticipants: uniqueParticipantIds.size,
      attendanceMarked
    });
  };

  const fetchEventParticipants = async (eventId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/techops/events/${eventId}/participants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setParticipants(response.data.participants);
        setStats(prev => ({
          ...prev,
          totalParticipants: response.data.total_registered,
          attendanceMarked: response.data.total_present
        }));
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
      alert('Failed to fetch participants');
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (participantId, status, notes = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/techops/events/${selectedEvent._id}/attendance`, {
        participantId,
        attendanceStatus: status,
        notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        fetchEventParticipants(selectedEvent._id);
        alert(`Attendance marked as ${status}`);
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to mark attendance');
      }
    }
  };

  const bulkMarkAttendance = async (attendanceData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/techops/events/${selectedEvent._id}/attendance/bulk`, {
        attendanceData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        fetchEventParticipants(selectedEvent._id);
        alert('Bulk attendance marking completed');
      }
    } catch (error) {
      console.error('Error in bulk attendance marking:', error);
      alert('Failed to mark bulk attendance');
    }
  };

  const submitOnsiteRegistration = async () => {
    if (!onsiteForm.name || !onsiteForm.email || !onsiteForm.phone || onsiteForm.selectedEvents.length === 0) {
      alert('Please fill all required fields and select at least one event');
      return;
    }

    try {
      console.log('Submitting onsite registration...');
      console.log('Form data:', onsiteForm);
      
      const token = localStorage.getItem('token');
      console.log('Token present:', !!token);
      
      const requestData = {
        participantDetails: {
          name: onsiteForm.name,
          email: onsiteForm.email,
          phone: onsiteForm.phone,
          college: onsiteForm.college,
          department: onsiteForm.department,
          year: onsiteForm.year
        },
        eventIds: onsiteForm.selectedEvents
      };
      
      console.log('Request data:', requestData);
      
      const response = await axios.post('/techops/onsite-registration', requestData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Response:', response.data);
      
      if (response.data.success) {
        alert('Onsite registration submitted successfully! Awaiting treasurer confirmation.');
        setOnsiteForm({
          name: '',
          email: '',
          phone: '',
          college: '',
          department: '',
          year: '',
          selectedEvents: []
        });
      }
    } catch (error) {
      console.error('Error submitting onsite registration:', error);
      console.error('Error response:', error.response);
      alert(error.response?.data?.message || 'Failed to submit onsite registration');
    }
  };

  const fetchOnsiteRegistrations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/techops/onsite-registrations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setOnsiteRegistrations(response.data.registrations);
      }
    } catch (error) {
      console.error('Error fetching onsite registrations:', error);
      alert('Failed to fetch onsite registrations');
    }
  };

  const fetchOnsiteStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/techops/onsite-registrations/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setOnsiteStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching onsite stats:', error);
    }
  };

  const updateOnsiteRegistrationStatus = async (registrationId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/techops/onsite-registrations/${registrationId}/status`, {
        status
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        alert(`Registration status updated to ${status}`);
        fetchOnsiteRegistrations();
        fetchOnsiteStats();
      }
    } catch (error) {
      console.error('Error updating registration status:', error);
      alert('Failed to update registration status');
    }
  };

  const handleEventSelection = (eventId) => {
    setOnsiteForm(prev => ({
      ...prev,
      selectedEvents: prev.selectedEvents.includes(eventId)
        ? prev.selectedEvents.filter(id => id !== eventId)
        : [...prev.selectedEvents, eventId]
    }));
  };

  const isEventToday = (eventDate) => {
    const today = new Date().toDateString();
    return new Date(eventDate).toDateString() === today;
  };

  const renderOverview = () => (
    <div className="fade-in">
      <h2 className="nav-title">Techops Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Events</h3>
          <div className="stat-number">{stats.totalEvents}</div>
        </div>
        <div className="stat-card">
          <h3>Today's Events</h3>
          <div className="stat-number">{stats.todayEvents}</div>
        </div>
        <div className="stat-card">
          <h3>Total Registrations</h3>
          <div className="stat-number">{stats.totalParticipants}</div>
        </div>
        <div className="stat-card">
          <h3>Unique Participants</h3>
          <div className="stat-number">{stats.uniqueParticipants}</div>
        </div>
      </div>

      <div className="actions-section">
        <h3>Actions</h3>
        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => setActiveView('events')}
            style={{ zIndex: 1001, position: 'relative', cursor: 'pointer' }}
          >
            View All Events
          </button>
          <button 
            className="btn btn-success"
            onClick={() => setActiveView('today')}
            style={{ zIndex: 1001, position: 'relative', cursor: 'pointer' }}
          >
            Today's Events & Attendance
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setActiveView('onsite')}
            style={{ zIndex: 1001, position: 'relative', cursor: 'pointer' }}
          >
            Onsite Registration
          </button>
          <button 
            className="btn btn-success"
            onClick={() => {
              setActiveView('onsiteHistory');
              fetchOnsiteRegistrations();
              fetchOnsiteStats();
            }}
            style={{ zIndex: 1001, position: 'relative', cursor: 'pointer' }}
          >
            View Onsite Registration History
          </button>
        </div>
      </div>
    </div>
  );

  const renderOnsiteRegistration = () => (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="nav-title">Onsite Registration</h2>
        <button 
          className="btn btn-back"
          onClick={() => setActiveView('overview')}
          style={{ zIndex: 999999, position: 'relative' }}
        >
          Back to Overview
        </button>
      </div>

      <div style={{
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-soft)',
        borderRadius: '18px',
        padding: '2rem',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
        maxWidth: '600px',
        width: '90%',
        margin: '0 auto'
      }}>
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Name *</label>
          <input
            className="form-input"
            type="text"
            value={onsiteForm.name}
            onChange={(e) => setOnsiteForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter participant name"
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-soft)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Email *</label>
          <input
            className="form-input"
            type="email"
            value={onsiteForm.email}
            onChange={(e) => setOnsiteForm(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Enter email address"
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-soft)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Phone *</label>
          <input
            className="form-input"
            type="tel"
            value={onsiteForm.phone}
            onChange={(e) => setOnsiteForm(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="Enter phone number"
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-soft)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>College</label>
          <input
            className="form-input"
            type="text"
            value={onsiteForm.college}
            onChange={(e) => setOnsiteForm(prev => ({ ...prev, college: e.target.value }))}
            placeholder="Enter college name"
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-soft)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Department</label>
          <input
            className="form-input"
            type="text"
            value={onsiteForm.department}
            onChange={(e) => setOnsiteForm(prev => ({ ...prev, department: e.target.value }))}
            placeholder="Enter department"
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-soft)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Year</label>
          <select
            className="form-input"
            value={onsiteForm.year}
            onChange={(e) => setOnsiteForm(prev => ({ ...prev, year: e.target.value }))}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-soft)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
          >
            <option value="">Select Year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label className="form-label" style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '600', marginBottom: '1rem', display: 'block' }}>Select Events *</label>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-soft)',
            borderRadius: '12px',
            padding: '1rem',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {events.map(event => (
              <div key={event._id} style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={onsiteForm.selectedEvents.includes(event._id)}
                    onChange={() => handleEventSelection(event._id)}
                    style={{ marginRight: '0.75rem', accentColor: 'var(--accent-gold)' }}
                  />
                  <span>{event.title} - ₹{event.registration_fee || 0}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setActiveView('overview')}
            style={{
              flex: 1,
              padding: '12px',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-soft)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Cancel
          </button>
          <button
            onClick={submitOnsiteRegistration}
            className="btn-register-now"
            style={{
              flex: 1,
              padding: '14px 24px',
              background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)',
              color: 'var(--bg-main)',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(255, 140, 0, 0.4)'
            }}
          >
            Submit Registration
          </button>
        </div>
      </div>
    </div>
  );

  const renderAttendance = () => (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="nav-title">
          Mark Attendance - {selectedEvent?.title}
        </h2>
        <button 
          className="btn btn-back"
          onClick={() => setActiveView('events')}
          style={{ zIndex: 999999, position: 'relative' }}
        >
          Back to Events
        </button>
      </div>

      {!isEventToday(selectedEvent?.date) && (
        <div className="alert alert-warning">
          <p>Attendance can only be marked on the event day ({new Date(selectedEvent?.date).toLocaleDateString()})</p>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading participants...</div>
      ) : (
        <>
          <div className="attendance-actions">
            <button
              className="btn btn-success"
              onClick={() => {
                const presentData = participants.map(p => ({
                  participantId: p.participant_id,
                  attendanceStatus: 'PRESENT',
                  notes: ''
                }));
                bulkMarkAttendance(presentData);
              }}
              style={{ cursor: 'pointer', zIndex: 1001, position: 'relative' }}
            >
              Mark All Present
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                const absentData = participants.map(p => ({
                  participantId: p.participant_id,
                  attendanceStatus: 'ABSENT',
                  notes: ''
                }));
                bulkMarkAttendance(absentData);
              }}
              style={{ cursor: 'pointer', zIndex: 1001, position: 'relative' }}
            >
              Mark All Absent
            </button>
          </div>

          <div className="attendance-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>College</th>
                  <th>Current Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {participants.map(participant => (
                  <tr key={participant.participant_id}>
                    <td>{participant.participant_name}</td>
                    <td>{participant.participant_email}</td>
                    <td>{participant.participant_college}</td>
                    <td>
                      <span className={`badge ${participant.attendance_status === 'PRESENT' ? 'badge-success' : 'badge-secondary'}`}>
                        {participant.attendance_status}
                      </span>
                    </td>
                    <td>
                      <div className="attendance-buttons">
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => markAttendance(participant.participant_id, 'PRESENT')}
                          disabled={!isEventToday(selectedEvent?.date) || participant.attendance_status === 'PRESENT'}
                        >
                          Present
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => markAttendance(participant.participant_id, 'ABSENT')}
                          disabled={!isEventToday(selectedEvent?.date) || participant.attendance_status === 'ABSENT'}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {participants.length === 0 && (
            <div className="no-data">
              <p>No participants registered for this event.</p>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderOnsiteHistory = () => (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="nav-title">Onsite Registration History</h2>
        <button 
          className="btn btn-back"
          onClick={() => setActiveView('overview')}
          style={{ zIndex: 999999, position: 'relative' }}
        >
          Back to Overview
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <h3>Total Registrations</h3>
          <div className="stat-number">{onsiteStats.total}</div>
        </div>
        <div className="stat-card">
          <h3>Pending Payment</h3>
          <div className="stat-number" style={{ color: '#ffa500' }}>{onsiteStats.pending}</div>
        </div>
        <div className="stat-card">
          <h3>Payment Confirmed</h3>
          <div className="stat-number" style={{ color: '#4ade80' }}>{onsiteStats.confirmed}</div>
        </div>
        <div className="stat-card">
          <h3>Rejected</h3>
          <div className="stat-number" style={{ color: '#ef4444' }}>{onsiteStats.rejected}</div>
        </div>
      </div>

      {/* Registrations Table */}
      <div style={{
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-soft)',
        borderRadius: '18px',
        padding: '1.5rem',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
      }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>All Onsite Registrations</h3>
        
        {onsiteRegistrations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No onsite registrations found
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-primary)' }}>Participant</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-primary)' }}>Contact</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-primary)' }}>Events</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-primary)' }}>Total Fee</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-primary)' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-primary)' }}>Registered By</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-primary)' }}>Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-primary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {onsiteRegistrations.map(registration => (
                  <tr key={registration._id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                          {registration.participant_details.name}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          {registration.participant_details.college || 'Walk-in'}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        <div>{registration.participant_details.email}</div>
                        <div>{registration.participant_details.phone}</div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        {registration.events.map(event => (
                          <div key={event.event_id} style={{ marginBottom: '0.25rem' }}>
                            {event.event_title} (₹{event.registration_fee})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ color: 'var(--accent-gold)', fontWeight: '600' }}>
                        ₹{registration.total_fee}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        background: registration.status === 'PAYMENT_CONFIRMED' ? '#4ade80' : 
                                   registration.status === 'PENDING_PAYMENT' ? '#ffa500' : '#ef4444',
                        color: 'white'
                      }}>
                        {registration.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      {registration.registered_by?.name || 'N/A'}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      {new Date(registration.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {registration.status === 'PENDING_PAYMENT' ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                          Awaiting treasurer confirmation
                        </div>
                      ) : registration.status === 'REJECTED' ? (
                        <button
                          onClick={() => updateOnsiteRegistrationStatus(registration._id, 'PENDING_PAYMENT')}
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: '#ffa500',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          Reactivate
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          Payment confirmed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="nav-title">All Events</h2>
        <button 
          className="btn btn-back"
          onClick={() => setActiveView('overview')}
          style={{ zIndex: 999999, position: 'relative' }}
        >
          Back to Overview
        </button>
      </div>

      <div className="events-grid">
        {events.map(event => (
          <div key={event._id} className="event-card">
            <div className="event-header">
              <h3>{event.title}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isEventToday(event.date) && (
                  <span style={{
                    background: '#4ade80',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    TODAY
                  </span>
                )}
                <span className={`event-status ${event.status.toLowerCase()}`}>
                  {event.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div className="event-details">
              <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {event.time}</p>
              <p><strong>Type:</strong> {event.type}</p>
              <p><strong>Expected Participants:</strong> {event.expected_participants}</p>
              {event.hospitality?.venue_allocated && (
                <p><strong>Venue:</strong> {event.hospitality.venue_details}</p>
              )}
            </div>
            <div className="event-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedEvent(event);
                  fetchEventParticipants(event._id);
                  setActiveView('participants');
                }}
                style={{ cursor: 'pointer', zIndex: 1001, position: 'relative' }}
              >
                View Participants
              </button>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="no-data">
          <p>No events found.</p>
        </div>
      )}
    </div>
  );

  const renderTodayEvents = () => {
    const todayEvents = events.filter(event => isEventToday(event.date));
    
    return (
      <div className="fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="nav-title">Today's Events & Attendance</h2>
          <button 
            className="btn btn-back"
            onClick={() => setActiveView('overview')}
            style={{ zIndex: 999999, position: 'relative' }}
          >
            Back to Overview
          </button>
        </div>

        {todayEvents.length === 0 ? (
          <div className="no-data">
            <p>No events scheduled for today.</p>
          </div>
        ) : (
          <div className="events-grid">
            {todayEvents.map(event => (
              <div key={event._id} className="event-card today-event">
                <div className="event-header">
                  <h3>{event.title}</h3>
                  <span className="today-badge">TODAY</span>
                </div>
                <div className="event-details">
                  <p><strong>Time:</strong> {event.time}</p>
                  <p><strong>Type:</strong> {event.type}</p>
                  <p><strong>Expected Participants:</strong> {event.expected_participants}</p>
                  {event.hospitality?.venue_allocated && (
                    <p><strong>Venue:</strong> {event.hospitality.venue_details}</p>
                  )}
                </div>
                <div className="event-actions">
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      setSelectedEvent(event);
                      fetchEventParticipants(event._id);
                      setActiveView('attendance');
                    }}
                    style={{ cursor: 'pointer', zIndex: 1001, position: 'relative' }}
                  >
                    Mark Attendance
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderParticipants = () => (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="nav-title">
          Participants - {selectedEvent?.title}
        </h2>
        <button 
          className="btn btn-back"
          onClick={() => setActiveView('events')}
          style={{ zIndex: 999999, position: 'relative' }}
        >
          Back to Events
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading participants...</div>
      ) : (
        <>
          <div className="participants-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>College</th>
                  <th>Registration Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {participants.map(participant => (
                  <tr key={participant.participant_id}>
                    <td>{participant.participant_name}</td>
                    <td>{participant.participant_email}</td>
                    <td>{participant.participant_college}</td>
                    <td>{new Date(participant.registration_date).toLocaleDateString()}</td>
                    <td>
                      <span className="badge badge-success">
                        Registered
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {participants.length === 0 && (
            <div className="no-data">
              <p>No participants registered for this event.</p>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="dashboard-container">
      {activeView === 'overview' && renderOverview()}
      {activeView === 'events' && renderEvents()}
      {activeView === 'today' && renderTodayEvents()}
      {activeView === 'participants' && renderParticipants()}
      {activeView === 'onsite' && renderOnsiteRegistration()}
      {activeView === 'onsiteHistory' && renderOnsiteHistory()}
      {activeView === 'attendance' && renderAttendance()}
    </div>
  );
};

export default TechopsDashboard;