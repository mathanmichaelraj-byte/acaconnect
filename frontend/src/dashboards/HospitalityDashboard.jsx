import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';

export default function HospitalityDashboard() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [activeView, setActiveView] = useState('overview');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [venueData, setVenueData] = useState({
    allocated_rooms: [],
    lab_allocated: '',
    venue_details: ''
  });
  const [suggestedVenue, setSuggestedVenue] = useState(null);
  const [venues, setVenues] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  useEffect(() => {
    if (selectedEvent) {
      if (selectedEvent.hospitality?.allocated_rooms) {
        setVenueData({
          allocated_rooms: selectedEvent.hospitality.allocated_rooms || [],
          lab_allocated: selectedEvent.hospitality.lab_allocated || '',
          venue_details: selectedEvent.hospitality.venue_details || ''
        });
      } else {
        setVenueData({
          allocated_rooms: [],
          lab_allocated: '',
          venue_details: ''
        });
      }
    }
  }, [selectedEvent]);

  const handleBackToOverview = () => {
    setActiveView('overview');
    setSelectedEvent(null);
  };

  useEffect(() => {
    fetchEvents();
    fetchVenues();
  }, []);

  const fetchEvents = async () => {
    try {
      console.log('Fetching hospitality events...');
      const response = await axios.get('/hospitality/events');
      console.log('Hospitality events response:', response.data);
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const fetchVenues = async () => {
    try {
      const response = await axios.get('/scheduling/venues');
      setVenues(response.data.venues || []);
    } catch (error) {
      console.error('Failed to fetch venues:', error);
    }
  };

  const handleAutoGenerateVenue = async () => {
    setLoadingSchedule(true);
    try {
      const res = await axios.post('/scheduling/generate', { eventIds: [selectedEvent._id] });
      const assignment = res.data.schedule?.[0];
      
      if (assignment?.venue) {
        const venue = venues.find(v => v._id === assignment.venue);
        setSuggestedVenue({
          ...assignment,
          venueName: venue?.name || assignment.venueName,
          venueType: venue?.type,
          venueCapacity: venue?.capacity
        });
        alert(`✅ Suggested Venue: ${venue?.name || assignment.venueName}\nUtilization: ${assignment.utilization}%\nPriority Score: ${assignment.priority}`);
      } else {
        alert('⚠️ ' + (assignment?.error || 'No suitable venue found'));
      }
    } catch (error) {
      alert('Failed to generate venue suggestion: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (suggestedVenue) {
      setVenueData({
        ...venueData,
        venue_details: suggestedVenue.venueName,
        lab_allocated: suggestedVenue.venueType === 'Computer Lab' ? suggestedVenue.venueName : venueData.lab_allocated
      });
      alert('✅ Venue suggestion accepted! You can modify details before submitting.');
    }
  };

  const handleBulkAutoGenerate = async () => {
    const unallocatedEvents = events.filter(e => !e.hospitality?.venue_allocated);
    if (unallocatedEvents.length === 0) {
      alert('No events need venue allocation.');
      return;
    }
    
    setLoadingSchedule(true);
    try {
      const eventIds = unallocatedEvents.map(e => e._id);
      const res = await axios.post('/scheduling/generate', { eventIds });
      
      const successful = res.data.schedule.filter(s => s.venue).length;
      const failed = res.data.schedule.filter(s => !s.venue).length;
      
      alert(`✅ Bulk scheduling complete!\n\nSuccessful: ${successful}\nFailed: ${failed}\n\nYou can now review and allocate venues individually.`);
      fetchEvents();
    } catch (error) {
      alert('Failed to generate bulk schedule: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleAcknowledgeRequirements = async (eventId) => {
    try {
      await axios.post(`/hospitality/acknowledge/${eventId}`);
      alert('Venue requirements acknowledged successfully!');
      fetchEvents();
    } catch (error) {
      alert('Failed to acknowledge requirements: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleDeleteVenueAllocation = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this venue allocation? This action cannot be undone.')) {
      try {
        await axios.delete(`/hospitality/venue/${eventId}`);
        alert('Venue allocation deleted successfully!');
        fetchEvents();
      } catch (error) {
        alert('Failed to delete venue allocation: ' + (error.response?.data?.message || 'Unknown error'));
      }
    }
  };

  const handleSubmitVenueAllocation = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting venue allocation for event:', selectedEvent._id);
      console.log('Venue data:', venueData);
      
      const response = await axios.post(`/hospitality/venue/${selectedEvent._id}`, venueData);
      
      console.log('Response:', response.data);
      alert('Venue allocated successfully!');
      setActiveView('overview');
      setSelectedEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Error submitting venue allocation:', error);
      alert('Failed to allocate venue: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const addRoom = () => {
    setVenueData({
      ...venueData,
      allocated_rooms: [...venueData.allocated_rooms, { room_number: '', room_name: '' }]
    });
  };

  const removeRoom = (index) => {
    const newRooms = venueData.allocated_rooms.filter((_, i) => i !== index);
    setVenueData({ ...venueData, allocated_rooms: newRooms });
  };

  const updateRoom = (index, field, value) => {
    const newRooms = [...venueData.allocated_rooms];
    newRooms[index][field] = value;
    setVenueData({ ...venueData, allocated_rooms: newRooms });
  };

  const renderOverview = () => (
    <div className="card-grid fade-in">
      <div className="card">
        <h3 className="card-title">Hospitality Overview</h3>
        <div className="card-content">
          <p><strong>Total Events:</strong> {events.length}</p>
          <p><strong>Pending Acknowledgments:</strong> {events.filter(e => !e.hospitality?.requirements_acknowledged).length}</p>
          <p><strong>Pending Venue Allocation:</strong> {events.filter(e => e.hospitality?.requirements_acknowledged && !e.hospitality?.venue_allocated).length}</p>
          <p><strong>Allocated Venues:</strong> {events.filter(e => e.hospitality?.venue_allocated).length}</p>
        </div>
      </div>
      <div className="card">
        <h3 className="card-title">Actions</h3>
        <div className="card-content">
          <button className="btn btn-primary" onClick={() => setActiveView('requirements')} style={{ margin: '0.25rem', width: '100%' }}>
            View Requirements
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveView('allocated')} style={{ margin: '0.25rem', width: '100%' }}>
            Allocated Venues
          </button>
        </div>
      </div>
    </div>
  );

  const renderRequirements = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Venue Requirements</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button 
            onClick={handleBulkAutoGenerate}
            disabled={loadingSchedule || events.filter(e => !e.hospitality?.venue_allocated).length === 0}
            style={{ 
              background: loadingSchedule ? '#666' : 'linear-gradient(135deg, #F5B301, #FF8C00)',
              color: '#0B061A',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              cursor: loadingSchedule ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem'
            }}
          >
            {loadingSchedule ? 'Generating...' : `Auto-Generate All (${events.filter(e => !e.hospitality?.venue_allocated).length})`}
          </button>
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
              zIndex: 999999,
              position: 'relative'
            }}
          >
            ← Back to Overview
          </button>
        </div>
      </div>
      <div className="events-grid">
        {events.filter(event => !event.hospitality?.venue_allocated).map(event => (
          <div key={event._id} className="card">
            <div className="card-header">
              <h4 className="card-title">{event.title}</h4>
              <div className="event-meta">
                <span className="event-type">{event.type}</span>
                <span className="event-date">{new Date(event.date).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="card-content">
              <div className="requirements-section">
                <div className="requirement-group">
                  <h5>Venue Requirements</h5>
                  <div className="requirement-item">
                    <span>Expected Participants</span>
                    <span className="quantity">{event.expected_participants}</span>
                  </div>
                  <div className="requirement-item">
                    <span>Duration</span>
                    <span className="quantity">{event.duration_hours} hours</span>
                  </div>
                  <div className="requirement-item">
                    <span>Event Type</span>
                    <span className="quantity">{event.type}</span>
                  </div>
                  {event.scheduling?.suggested_venue && (
                    <div className="requirement-item" style={{ background: 'rgba(74, 222, 128, 0.1)', padding: '0.5rem', borderRadius: '4px', marginTop: '0.5rem' }}>
                      <span style={{ color: '#4ade80', fontWeight: '600' }}>Priority Score</span>
                      <span className="quantity" style={{ color: '#4ade80' }}>{event.scheduling.priority_score}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="card-actions">
                {!event.hospitality?.requirements_acknowledged ? (
                  <button className="btn btn-success" onClick={() => handleAcknowledgeRequirements(event._id)}>
                    Acknowledge Requirements
                  </button>
                ) : !event.hospitality?.venue_allocated ? (
                  <button className="btn btn-primary" onClick={() => { setSelectedEvent(event); setActiveView('venue'); }}>
                    Allocate Venue
                  </button>
                ) : (
                  <div className="status-badge success">Completed</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVenueForm = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Allocate Venue - {selectedEvent?.title}</h3>
        <button 
          onClick={() => setActiveView('requirements')} 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#00E5FF', 
            fontSize: '0.85rem', 
            cursor: 'pointer',
            zIndex: 999999,
            position: 'relative'
          }}
        >
          ← Back to Requirements
        </button>
      </div>
      <div className="card">
        {/* Auto-Generate Section */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.75rem', color: 'var(--accent-gold)' }}>Venue Suggestion</h4>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleAutoGenerateVenue}
            disabled={loadingSchedule}
            style={{ marginRight: '0.5rem' }}
          >
            {loadingSchedule ? 'Generating...' : 'Auto-Generate Venue'}
          </button>
          {suggestedVenue && (
            <>
              <button 
                type="button" 
                className="btn btn-success" 
                onClick={handleAcceptSuggestion}
                style={{ marginRight: '0.5rem' }}
              >
                Accept Suggestion
              </button>
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(0, 229, 255, 0.1)', borderRadius: '8px', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
                <strong style={{ color: 'var(--accent-cyan)' }}>Suggested: {suggestedVenue.venueName}</strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Type: {suggestedVenue.venueType} | Capacity: {suggestedVenue.venueCapacity} | Utilization: {suggestedVenue.utilization}% | Priority: {suggestedVenue.priority}
                </div>
              </div>
            </>
          )}
        </div>

        <form onSubmit={handleSubmitVenueAllocation} className="form-container">
          <div className="form-section">
            <h4>Room Allocation</h4>
            {venueData.allocated_rooms.map((room, index) => (
              <div key={index} className="form-grid" style={{ gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Room Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={room.room_number}
                    onChange={(e) => updateRoom(index, 'room_number', e.target.value)}
                    placeholder="e.g., 101"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Room Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={room.room_name}
                    onChange={(e) => updateRoom(index, 'room_name', e.target.value)}
                    placeholder="e.g., Conference Hall A"
                  />
                </div>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => removeRoom(index)}
                  style={{ marginTop: '1.5rem', height: 'fit-content' }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-secondary" onClick={addRoom} style={{ marginTop: '0.5rem' }}>
              Add Room
            </button>
          </div>
          
          <div className="form-group">
            <label className="form-label">Lab Allocated</label>
            <input
              type="text"
              className="form-input"
              value={venueData.lab_allocated}
              onChange={(e) => setVenueData({ ...venueData, lab_allocated: e.target.value })}
              placeholder="e.g., Computer Lab 1"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Complete Venue Details</label>
            <textarea
              className="form-input"
              value={venueData.venue_details}
              onChange={(e) => setVenueData({ ...venueData, venue_details: e.target.value })}
              placeholder="e.g., Room 101, Room 102, Computer Lab 1"
              rows="3"
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Allocate Venue
          </button>
        </form>
      </div>
    </div>
  );

  const renderAllocatedVenues = () => (
    <div>
      <div className="nav-header">
        <h3 className="nav-title">Allocated Venues</h3>
        <button 
          onClick={() => setActiveView('overview')}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#00E5FF', 
            fontSize: '0.85rem', 
            cursor: 'pointer',
            padding: '0.25rem 0',
            pointerEvents: 'auto',
            zIndex: 999999,
            position: 'relative'
          }}
        >
          ← Back to Overview
        </button>
      </div>
      <div className="events-grid">
        {events.filter(event => event.hospitality?.venue_allocated).map(event => (
          <div key={event._id} className="card">
            <div className="card-header">
              <h4 className="card-title">{event.title}</h4>
              <div className="event-meta">
                <span className="event-type">{event.type}</span>
                <span className="event-date">{new Date(event.date).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="card-content">
              <div className="venue-summary">
                <h5>Venue Allocation</h5>
                {event.hospitality.allocated_rooms?.length > 0 && (
                  <div className="venue-section">
                    <h6>Allocated Rooms:</h6>
                    {event.hospitality.allocated_rooms.map((room, idx) => (
                      <div key={idx} className="venue-item">
                        <span>{room.room_number}</span>
                        <span>{room.room_name}</span>
                      </div>
                    ))}
                  </div>
                )}
                {event.hospitality.lab_allocated && (
                  <div className="venue-section">
                    <h6>Lab Allocated:</h6>
                    <div className="venue-item">
                      <span>{event.hospitality.lab_allocated}</span>
                    </div>
                  </div>
                )}
                <div className="venue-section">
                  <h6>Complete Venue Details:</h6>
                  <div className="venue-details">
                    {event.hospitality.venue_details}
                  </div>
                </div>
                <div className="allocation-date">
                  <small>Allocated: {new Date(event.hospitality.venue_allocated_at).toLocaleDateString()}</small>
                </div>
              </div>
              <div className="card-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <div className="status-badge success">Venue Allocated</div>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleDeleteVenueAllocation(event._id)}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  Delete Allocation
                </button>
              </div>
            </div>
          </div>
        ))}
        {events.filter(event => event.hospitality?.venue_allocated).length === 0 && (
          <div className="card">
            <div className="card-content">
              <p>No venues allocated yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {activeView === 'overview' && renderOverview()}
      {activeView === 'requirements' && renderRequirements()}
      {activeView === 'venue' && renderVenueForm()}
      {activeView === 'allocated' && renderAllocatedVenues()}
    </div>
  );
}