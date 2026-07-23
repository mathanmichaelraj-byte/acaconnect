import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axios';
import ParticipantsModal from '../components/ParticipantsModal';

export default function GenSecDashboard() {
  const { logout } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [publishedEvents, setPublishedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [eventForm, setEventForm] = useState({});
  const [comments, setComments] = useState('');
  const [selectedEventForParticipants, setSelectedEventForParticipants] = useState(null);

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const fetchPendingEvents = async () => {
    try {
      const response = await axios.get('/events');
      const pending = response.data.filter(e => e.status === 'PENDING_GEN_SEC');
      const published = response.data.filter(e => e.status === 'PUBLISHED');
      setEvents(pending);
      setPublishedEvents(published);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const handleReview = (event) => {
    setSelectedEvent(event);
    setEventForm({
      expected_participants: event.expected_participants,
      prize_pool: event.prize_pool,
      requirements: { ...event.requirements }
    });
    setEditMode(false);
  };

  const handleApproval = async (approved) => {
    try {
      const updates = editMode ? eventForm : null;
      await axios.put(`/events/${selectedEvent._id}/gen-sec-approve`, {
        approved,
        comments,
        updates
      });
      alert(approved ? '✅ Event approved!' : '❌ Event rejected');
      setSelectedEvent(null);
      setComments('');
      setEditMode(false);
      fetchPendingEvents();
    } catch (error) {
      alert('Failed to process approval: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const renderEventDetails = () => (
    <div className="card" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 className="card-title">📋 Event Details</h3>
        <button
          className="btn btn-secondary"
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? '👁️ View Mode' : '✏️ Edit Mode'}
        </button>
      </div>
      <div className="card-content">
        <p><strong>Event Name:</strong> {selectedEvent.title}</p>
        <p><strong>Type:</strong> {selectedEvent.type}</p>
        <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()} at {selectedEvent.time}</p>
        
        {editMode ? (
          <>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Expected Participants</label>
              <input
                type="number"
                className="form-input"
                value={eventForm.expected_participants}
                onChange={(e) => setEventForm({...eventForm, expected_participants: parseInt(e.target.value)})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Prize Pool (₹)</label>
              <input
                type="number"
                className="form-input"
                value={eventForm.prize_pool}
                onChange={(e) => setEventForm({...eventForm, prize_pool: parseInt(e.target.value)})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Volunteers Needed</label>
              <input
                type="number"
                className="form-input"
                value={eventForm.requirements.volunteers_needed}
                onChange={(e) => setEventForm({...eventForm, requirements: {...eventForm.requirements, volunteers_needed: parseInt(e.target.value)}})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Rooms Needed</label>
              <input
                type="number"
                className="form-input"
                value={eventForm.requirements.rooms_needed}
                onChange={(e) => setEventForm({...eventForm, requirements: {...eventForm.requirements, rooms_needed: parseInt(e.target.value)}})}
              />
            </div>
          </>
        ) : (
          <>
            <p><strong>Expected Participants:</strong> {selectedEvent.expected_participants}</p>
            <p><strong>Prize Pool:</strong> ₹{selectedEvent.prize_pool || 0}</p>
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Requirements:</strong></p>
              <p>👥 Volunteers: {selectedEvent.requirements?.volunteers_needed || 0}</p>
              <p>🏢 Rooms: {selectedEvent.requirements?.rooms_needed || 0}</p>
              <p>🍽️ Refreshments: {selectedEvent.requirements?.refreshments_needed ? 'Yes' : 'No'}</p>
              <p>📝 Stationary: {selectedEvent.requirements?.stationary_needed ? 'Yes' : 'No'}</p>
              <p>🎁 Goodies: {selectedEvent.requirements?.goodies_needed ? 'Yes' : 'No'}</p>
              <p>📜 Physical Certificate: {selectedEvent.requirements?.physical_certificate ? 'Yes' : 'No'}</p>
              <p>🏆 Trophies: {selectedEvent.requirements?.trophies_needed ? 'Yes' : 'No'}</p>
            </div>
          </>
        )}
        
        {selectedEvent.treasurer_comments && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px' }}>
            <p><strong>Treasurer Comments:</strong></p>
            <p>{selectedEvent.treasurer_comments}</p>
          </div>
        )}
        
        <div className="form-group" style={{ marginTop: '2rem' }}>
          <label className="form-label">Your Comments</label>
          <textarea
            className="form-input"
            rows="4"
            placeholder="Add your comments..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            className="btn btn-success"
            style={{ flex: 1 }}
            onClick={() => handleApproval(true)}
          >
            ✅ Approve {editMode && '& Update'}
          </button>
          <button
            className="btn btn-danger"
            style={{ flex: 1 }}
            onClick={() => handleApproval(false)}
          >
            ❌ Reject
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">📝 General Secretary Dashboard</h1>
        <button className="btn btn-logout" onClick={logout}>
          🚪 Logout
        </button>
      </div>

      <div className="card fade-in">
        <h3 className="card-title">📊 Pending Approvals ({events.length})</h3>
        <div className="table-container" style={{
          background: 'rgba(28, 26, 46, 0.85)',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <table className="table" style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'transparent'
          }}>
            <thead style={{
              background: 'rgba(15, 14, 34, 0.8)'
            }}>
              <tr>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#B8B6D8'
                }}>Event Name</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#B8B6D8'
                }}>Type</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#B8B6D8'
                }}>Date</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#B8B6D8'
                }}>Participants</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#B8B6D8'
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ 
                    textAlign: 'center', 
                    padding: '2rem', 
                    color: '#B8B6D8'
                  }}>
                    ✅ No pending approvals
                  </td>
                </tr>
              ) : (
                events.map(event => (
                  <tr key={event._id}>
                    <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.title}</td>
                    <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.type}</td>
                    <td style={{ padding: '1rem', color: '#F5F7FF' }}>{new Date(event.date).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.expected_participants}</td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        onClick={() => handleReview(event)}
                      >
                        👁️ Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEvent && renderEventDetails()}
      
      <div className="card fade-in" style={{ marginTop: '2rem' }}>
        <h3 className="card-title">📚 Published Events ({publishedEvents.length})</h3>
        <div className="table-container" style={{
          background: 'rgba(28, 26, 46, 0.85)',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <table className="table" style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'transparent'
          }}>
            <thead style={{
              background: 'rgba(15, 14, 34, 0.8)'
            }}>
              <tr>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#B8B6D8'
                }}>Event Name</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#B8B6D8'
                }}>Type</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#B8B6D8'
                }}>Date</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#B8B6D8'
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {publishedEvents.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ 
                    textAlign: 'center', 
                    padding: '2rem', 
                    color: '#B8B6D8'
                  }}>
                    No published events
                  </td>
                </tr>
              ) : (
                publishedEvents.map(event => (
                  <tr key={event._id}>
                    <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.title}</td>
                    <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.type}</td>
                    <td style={{ padding: '1rem', color: '#F5F7FF' }}>{new Date(event.date).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        onClick={() => setSelectedEventForParticipants(event)}
                      >
                        👥 Participants
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {selectedEventForParticipants && (
        <ParticipantsModal
          event={selectedEventForParticipants}
          onClose={() => setSelectedEventForParticipants(null)}
        />
      )}
    </div>
  );
}
