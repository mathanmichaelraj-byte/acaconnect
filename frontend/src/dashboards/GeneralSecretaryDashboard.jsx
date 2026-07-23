import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axios';

export default function GeneralSecretaryDashboard() {
  const [stats, setStats] = useState({ pendingApproval: 0, approved: 0, rejected: 0 });
  const [events, setEvents] = useState([]);
  const [activeView, setActiveView] = useState('overview');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [previousView, setPreviousView] = useState('overview');

  const handleBackToOverview = () => {
    setActiveView('overview');
    setSelectedEvent(null);
    setEditingEvent(null);
  };

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const fetchPendingEvents = async () => {
    try {
      const response = await axios.get('/events');
      const allEvents = response.data;
      setEvents(allEvents);
      
      const pending = allEvents.filter(e => e.status === 'TREASURER_APPROVED').length;
      const approved = allEvents.filter(e => ['GENSEC_APPROVED', 'CHAIRPERSON_APPROVED', 'PUBLISHED'].includes(e.status)).length;
      const rejected = allEvents.filter(e => e.status === 'REJECTED').length;
      
      setStats({ pendingApproval: pending, approved, rejected });
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const handleApproval = async (eventId, action) => {
    try {
      const requestBody = {
        approved: action === 'approve',
        comments: action === 'reject' ? 'Rejected by General Secretary' : 'Approved by General Secretary'
      };
      
      await axios.put(`/events/${eventId}/gen-sec-approve`, requestBody);
      alert(`✅ Event ${action}d successfully!`);
      fetchPendingEvents();
      setActiveView('overview');
      setSelectedEvent(null);
      setEditingEvent(null);
    } catch (error) {
      alert(`❌ Failed to ${action}: ` + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleViewEvent = (event) => {
    setPreviousView(activeView);
    setSelectedEvent(event);
    setActiveView('view');
  };

  const handleEditEvent = (event) => {
    setEditingEvent({...event});
    setActiveView('edit');
  };

  const handleSaveEdit = async () => {
    try {
      const requestBody = {
        approved: true,
        comments: 'Updated and approved by General Secretary',
        updates: {
          title: editingEvent.title,
          type: editingEvent.type,
          date: editingEvent.date,
          time: editingEvent.time,
          duration_hours: editingEvent.duration_hours,
          expected_participants: editingEvent.expected_participants,
          description: editingEvent.description,
          volunteers_needed: editingEvent.volunteers_needed,
          rooms_needed: editingEvent.rooms_needed,
          refreshments_needed: editingEvent.refreshments_needed,
          stationary_needed: editingEvent.stationary_needed,
          goodies_needed: editingEvent.goodies_needed,
          certificates_needed: editingEvent.certificates_needed,
          trophies_needed: editingEvent.trophies_needed
        }
      };
      
      await axios.put(`/events/${editingEvent._id}/gen-sec-approve`, requestBody);
      alert('Event updated and approved successfully!');
      fetchPendingEvents();
      setActiveView('overview');
      setEditingEvent(null);
    } catch (error) {
      alert('Failed to update event: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const renderOverview = () => (
    <div className="card-grid fade-in">
      <div className="card">
        <h3 className="card-title">General Secretary Review</h3>
        <div className="card-content">
          <p><strong>Pending Approval:</strong> {stats.pendingApproval}</p>
          <p><strong>Approved:</strong> {stats.approved}</p>
          <p><strong>Rejected:</strong> {stats.rejected}</p>
        </div>
      </div>
      <div className="card">
        <h3 className="card-title">Actions</h3>
        <div className="card-content">
          <button className="btn btn-primary" onClick={() => setActiveView('pending')} style={{ margin: '0.25rem', width: '100%' }}>
            Review Pending Events
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveView('approved')} style={{ margin: '0.25rem', width: '100%' }}>
            View Approved Events
          </button>
        </div>
      </div>
    </div>
  );

  const renderPending = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Pending General Secretary Approvals</h3>
        <button 
          onClick={handleBackToOverview}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#00E5FF', 
            fontSize: '0.85rem', 
            cursor: 'pointer',
            padding: '0.25rem 0',
            pointerEvents: 'auto',
            zIndex: 10,
            position: 'relative'
          }}
        >
          ← Back to Overview
        </button>
      </div>
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
              }}>Event</th>
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
              }}>Prize Pool</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#B8B6D8'
              }}>Total Budget</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#B8B6D8'
              }}>Status</th>
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
            {events.filter(e => e.status === 'TREASURER_APPROVED').map(event => (
              <tr key={event._id}>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.title}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.type}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>{new Date(event.date).toLocaleDateString()}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>₹{event.prize_pool || 0}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>₹{event.registration_fee || 0}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>₹{event.total_budget || 'Not set'}</td>
                <td style={{ padding: '1rem' }}><span className="status-badge status-pending">PENDING REVIEW</span></td>
                <td style={{ padding: '1rem' }}>
                  <button className="btn btn-info" onClick={() => handleViewEvent(event)} style={{ margin: '0.25rem' }}>
                    View
                  </button>
                  <button className="btn btn-warning" onClick={() => handleEditEvent(event)} style={{ margin: '0.25rem' }}>
                    Edit
                  </button>
                  <button className="btn btn-success" onClick={() => handleApproval(event._id, 'approve')} style={{ margin: '0.25rem' }}>
                    Approve
                  </button>
                  <button className="btn btn-danger" onClick={() => handleApproval(event._id, 'reject')} style={{ margin: '0.25rem' }}>
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderViewEvent = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Event Details</h3>
        <button 
          onClick={() => setActiveView(previousView)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#00E5FF', 
            fontSize: '0.85rem', 
            cursor: 'pointer',
            padding: '0.25rem 0',
            pointerEvents: 'auto',
            zIndex: 10,
            position: 'relative'
          }}
        >
          ← Back to {previousView === 'pending' ? 'Pending' : 'Approved'}
        </button>
      </div>
      <div className="card">
        <div className="card-content">
          {selectedEvent.cover_photo && (
            <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
              <img 
                src={`http://localhost:5000/${selectedEvent.cover_photo}`} 
                alt="Event Cover" 
                style={{ maxWidth: '300px', maxHeight: '200px', borderRadius: '8px' }}
              />
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div><strong>Event Name:</strong> {selectedEvent.title}</div>
            <div><strong>Type:</strong> {selectedEvent.type}</div>
            <div><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</div>
            <div><strong>Time:</strong> {selectedEvent.time}</div>
            <div><strong>Duration:</strong> {selectedEvent.duration_hours} hours</div>
            <div><strong>Expected Participants:</strong> {selectedEvent.expected_participants}</div>
            <div><strong>Prize Pool:</strong> ₹{selectedEvent.prize_pool || 0}</div>
            <div><strong>Registration Fee:</strong> ₹{selectedEvent.registration_fee || 0}</div>
            <div><strong>Total Budget:</strong> ₹{selectedEvent.total_budget || 'Not set'}</div>
            <div style={{ gridColumn: '1 / -1' }}><strong>Description:</strong> {selectedEvent.description}</div>
            <div><strong>Volunteers Needed:</strong> {selectedEvent.requirements?.volunteers_needed || selectedEvent.volunteers_needed}</div>
            
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <strong>Refreshments:</strong> {selectedEvent.requirements?.refreshments_needed ? 'Yes' : 'No'}
              {selectedEvent.requirements?.refreshments_needed && selectedEvent.requirements?.refreshment_items?.length > 0 && (
                <div style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                  <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Refreshment Items:</p>
                  {selectedEvent.requirements.refreshment_items.map((item, index) => (
                    <p key={index} style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.2rem 0' }}>
                      • {item.item_name}: {item.quantity}
                    </p>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <strong>Stationery:</strong> {selectedEvent.requirements?.stationary_needed ? 'Yes' : 'No'}
              {selectedEvent.requirements?.stationary_needed && selectedEvent.requirements?.stationary_items?.length > 0 && (
                <div style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                  <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Stationery Items:</p>
                  {selectedEvent.requirements.stationary_items.map((item, index) => (
                    <p key={index} style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.2rem 0' }}>
                      • {item.item_name}: {item.quantity}
                    </p>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <strong>Technical Equipment:</strong> {selectedEvent.requirements?.technical_needed ? 'Yes' : 'No'}
              {selectedEvent.requirements?.technical_needed && selectedEvent.requirements?.technical_items?.length > 0 && (
                <div style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                  <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Technical Items:</p>
                  {selectedEvent.requirements.technical_items.map((item, index) => (
                    <p key={index} style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.2rem 0' }}>
                      • {item.item_name}: {item.quantity}
                    </p>
                  ))}
                </div>
              )}
            </div>
            
            <div><strong>Goodies:</strong> {selectedEvent.requirements?.goodies_needed ? 'Yes' : 'No'}</div>
            <div><strong>Physical Certificates:</strong> {selectedEvent.requirements?.physical_certificate ? 'Yes' : 'No'}</div>
            <div><strong>Trophies:</strong> {selectedEvent.requirements?.trophies_needed ? 'Yes' : 'No'}</div>
            
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <strong>Venue Allocation:</strong> {selectedEvent?.hospitality?.venue_allocated ? (
                <span style={{ color: '#4CAF50' }}> Allocated</span>
              ) : (
                <span style={{ color: '#FF9800' }}> Pending</span>
              )}
              {selectedEvent?.hospitality?.venue_allocated && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  {selectedEvent.hospitality.allocated_rooms?.length > 0 && (
                    <div>
                      <strong>Rooms:</strong> {selectedEvent.hospitality.allocated_rooms.map(room => `${room.room_number} - ${room.room_name}`).join(', ')}
                    </div>
                  )}
                  {selectedEvent.hospitality.lab_allocated && (
                    <div><strong>Lab:</strong> {selectedEvent.hospitality.lab_allocated}</div>
                  )}
                  <div><strong>Complete Venue:</strong> {selectedEvent.hospitality.venue_details}</div>
                </div>
              )}
            </div>
            
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <strong>Volunteer Allocation:</strong> {selectedEvent?.hr?.volunteers_allocated ? (
                <span style={{ color: '#4CAF50' }}> Allocated</span>
              ) : (
                <span style={{ color: '#FF9800' }}> Pending</span>
              )}
              {selectedEvent?.hr?.volunteers_allocated && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  {selectedEvent.hr.allocated_volunteers?.length > 0 && (
                    <div>
                      <strong>Volunteers:</strong>
                      {selectedEvent.hr.allocated_volunteers.map((vol, idx) => (
                        <div key={idx} style={{ marginLeft: '1rem', marginTop: '0.3rem', padding: '0.4rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                          <div>{vol.volunteer_name} ({vol.volunteer_role})</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {vol.volunteer_contact} | {vol.volunteer_department}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedEvent.hr.allocated_judges?.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong>Judges:</strong>
                      {selectedEvent.hr.allocated_judges.map((judge, idx) => (
                        <div key={idx} style={{ marginLeft: '1rem', marginTop: '0.3rem', padding: '0.4rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                          <div>{judge.judge_name} ({judge.judge_expertise})</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {judge.judge_contact} | {judge.judge_designation}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {previousView === 'pending' && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-warning" onClick={() => handleEditEvent(selectedEvent)}>
                Edit Event
              </button>
              <button className="btn btn-success" onClick={() => handleApproval(selectedEvent._id, 'approve')}>
                Approve
              </button>
              <button className="btn btn-danger" onClick={() => handleApproval(selectedEvent._id, 'reject')}>
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderEditEvent = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Edit Event</h3>
        <button 
          onClick={() => setActiveView('pending')}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#00E5FF', 
            fontSize: '0.85rem', 
            cursor: 'pointer',
            padding: '0.25rem 0',
            pointerEvents: 'auto',
            zIndex: 10,
            position: 'relative'
          }}
        >
          ← Back to Pending
        </button>
      </div>
      <div className="card">
        <div className="card-content">
          {editingEvent.cover_photo && (
            <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
              <img 
                src={`http://localhost:5000/${editingEvent.cover_photo}`} 
                alt="Event Cover" 
                style={{ maxWidth: '300px', maxHeight: '200px', borderRadius: '8px' }}
              />
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ color: '#F5F7FF', display: 'block', marginBottom: '0.5rem' }}>Event Name:</label>
              <input 
                type="text" 
                value={editingEvent.title} 
                onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})}
                className="form-input"
              />
            </div>
            <div>
              <label style={{ color: '#F5F7FF', display: 'block', marginBottom: '0.5rem' }}>Type:</label>
              <select 
                value={editingEvent.type} 
                onChange={(e) => setEditingEvent({...editingEvent, type: e.target.value})}
                className="form-input"
              >
                <option value="Technical">Technical</option>
                <option value="Non-Technical">Non-Technical</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Seminar">Seminar</option>
                <option value="Workshop">Workshop</option>
              </select>
            </div>
            <div>
              <label style={{ color: '#F5F7FF', display: 'block', marginBottom: '0.5rem' }}>Date:</label>
              <input 
                type="date" 
                value={editingEvent.date?.split('T')[0]} 
                onChange={(e) => setEditingEvent({...editingEvent, date: e.target.value})}
                className="form-input"
              />
            </div>
            <div>
              <label style={{ color: '#F5F7FF', display: 'block', marginBottom: '0.5rem' }}>Time:</label>
              <input 
                type="time" 
                value={editingEvent.time} 
                onChange={(e) => setEditingEvent({...editingEvent, time: e.target.value})}
                className="form-input"
              />
            </div>
            <div>
              <label style={{ color: '#F5F7FF', display: 'block', marginBottom: '0.5rem' }}>Duration (hours):</label>
              <input 
                type="number" 
                value={editingEvent.duration_hours} 
                onChange={(e) => setEditingEvent({...editingEvent, duration_hours: parseInt(e.target.value)})}
                className="form-input"
              />
            </div>
            <div>
              <label style={{ color: '#F5F7FF', display: 'block', marginBottom: '0.5rem' }}>Expected Participants:</label>
              <input 
                type="number" 
                value={editingEvent.expected_participants} 
                onChange={(e) => setEditingEvent({...editingEvent, expected_participants: parseInt(e.target.value)})}
                className="form-input"
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: '#F5F7FF', display: 'block', marginBottom: '0.5rem' }}>Description:</label>
              <textarea 
                value={editingEvent.description} 
                onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
                className="form-input"
                rows="3"
              />
            </div>
            <div>
              <label style={{ color: '#F5F7FF', display: 'block', marginBottom: '0.5rem' }}>Volunteers Needed:</label>
              <input 
                type="number" 
                value={editingEvent.requirements?.volunteers_needed || editingEvent.volunteers_needed || 0} 
                onChange={(e) => setEditingEvent({...editingEvent, volunteers_needed: parseInt(e.target.value)})}
                className="form-input"
              />
            </div>
            <div>
              <label style={{ color: '#F5F7FF', display: 'block', marginBottom: '0.5rem' }}>Refreshments:</label>
              <input 
                type="number" 
                value={editingEvent.requirements?.refreshments_needed || editingEvent.refreshments_needed || 0} 
                onChange={(e) => setEditingEvent({...editingEvent, refreshments_needed: parseInt(e.target.value)})}
                className="form-input"
              />
            </div>
            <div>
              <label style={{ color: '#F5F7FF', display: 'block', marginBottom: '0.5rem' }}>Stationary:</label>
              <input 
                type="number" 
                value={editingEvent.requirements?.stationary_needed || editingEvent.stationary_needed || 0} 
                onChange={(e) => setEditingEvent({...editingEvent, stationary_needed: parseInt(e.target.value)})}
                className="form-input"
              />
            </div>
            <div>
              <label style={{ color: '#F5F7FF', display: 'block', marginBottom: '0.5rem' }}>Goodies:</label>
              <input 
                type="number" 
                value={editingEvent.requirements?.goodies_needed || editingEvent.goodies_needed || 0} 
                onChange={(e) => setEditingEvent({...editingEvent, goodies_needed: parseInt(e.target.value)})}
                className="form-input"
              />
            </div>
            <div>
              <label style={{ color: '#F5F7FF', display: 'block', marginBottom: '0.5rem' }}>Certificates:</label>
              <input 
                type="number" 
                value={editingEvent.requirements?.certificates_needed || editingEvent.certificates_needed || 0} 
                onChange={(e) => setEditingEvent({...editingEvent, certificates_needed: parseInt(e.target.value)})}
                className="form-input"
              />
            </div>
            <div>
              <label style={{ color: '#F5F7FF', display: 'block', marginBottom: '0.5rem' }}>Trophies:</label>
              <input 
                type="number" 
                value={editingEvent.requirements?.trophies_needed || editingEvent.trophies_needed || 0} 
                onChange={(e) => setEditingEvent({...editingEvent, trophies_needed: parseInt(e.target.value)})}
                className="form-input"
              />
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={handleSaveEdit}>
              Save & Approve
            </button>
            <button className="btn btn-danger" onClick={() => handleApproval(editingEvent._id, 'reject')}>
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApproved = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Approved Events</h3>
        <button 
          onClick={handleBackToOverview}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#00E5FF', 
            fontSize: '0.85rem', 
            cursor: 'pointer',
            padding: '0.25rem 0',
            pointerEvents: 'auto',
            zIndex: 10,
            position: 'relative'
          }}
        >
          ← Back to Overview
        </button>
      </div>
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
              }}>Event</th>
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
              }}>Prize Pool</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#B8B6D8'
              }}>Total Budget</th>
              <th style={{
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#B8B6D8'
              }}>Status</th>
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
            {events.filter(e => ['GENSEC_APPROVED', 'CHAIRPERSON_APPROVED', 'PUBLISHED'].includes(e.status)).map(event => (
              <tr key={event._id}>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.title}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.type}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>{new Date(event.date).toLocaleDateString()}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>₹{event.prize_pool || 0}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>₹{event.registration_fee || 0}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>₹{event.total_budget || 'Not set'}</td>
                <td style={{ padding: '1rem' }}>
                  <span className={`status-badge ${
                    event.status === 'PUBLISHED' ? 'status-published' : 
                    event.status === 'CHAIRPERSON_APPROVED' ? 'status-approved' : 'status-gensec-approved'
                  }`}>
                    {event.status === 'PUBLISHED' ? 'PUBLISHED' : 
                     event.status === 'CHAIRPERSON_APPROVED' ? 'CHAIRPERSON APPROVED' : 'GENSEC APPROVED'}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button className="btn btn-info" onClick={() => handleViewEvent(event)} style={{ margin: '0.25rem' }}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      {activeView === 'overview' && renderOverview()}
      {activeView === 'pending' && renderPending()}
      {activeView === 'approved' && renderApproved()}
      {activeView === 'view' && renderViewEvent()}
      {activeView === 'edit' && renderEditEvent()}
    </div>
  );
}