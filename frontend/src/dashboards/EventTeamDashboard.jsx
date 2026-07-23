import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axios';
import ParticipantsModal from '../components/ParticipantsModal';

export default function EventTeamDashboard({ onBackToParent }) {
  const { logout } = useContext(AuthContext);
  const [stats, setStats] = useState({ created: 0, pending: 0, published: 0 });
  const [events, setEvents] = useState([]);
  const [stationeryItems, setStationeryItems] = useState([]);
  const [technicalItems] = useState([
    { name: 'Projector', _id: 'tech_1' },
    { name: 'Laptop', _id: 'tech_2' },
    { name: '2 Cordless Microphones', _id: 'tech_3' },
    { name: 'Speakers', _id: 'tech_4' },
    { name: 'HDMI / VGA cables', _id: 'tech_5' },
    { name: 'Extension boards', _id: 'tech_6' },
    { name: 'Power strips', _id: 'tech_7' },
    { name: 'Power backup (UPS / Inverter)', _id: 'tech_8' }
  ]);
  
  const [refreshmentItems] = useState([
    { name: 'Water bottles', _id: 'ref_1' },
    { name: 'Tea', _id: 'ref_2' },
    { name: 'Coffee', _id: 'ref_3' },
    { name: 'Milk', _id: 'ref_4' },
    { name: 'Biscuits', _id: 'ref_5' },
    { name: 'Samosa / Puff / Cutlet', _id: 'ref_6' },
    { name: 'Chips', _id: 'ref_7' },
    { name: 'Cake', _id: 'ref_8' },
    { name: 'Fruit plates', _id: 'ref_9' },
    { name: 'Banana / Apple / Orange', _id: 'ref_10' },
    { name: 'Juice packets', _id: 'ref_11' },
    { name: 'Packed snacks', _id: 'ref_12' },
    { name: 'Soft drinks', _id: 'ref_13' },
    { name: 'Mineral water bottles', _id: 'ref_14' },
    { name: 'Paper cups', _id: 'ref_15' },
    { name: 'Disposable glasses', _id: 'ref_16' },
    { name: 'Plates', _id: 'ref_17' },
    { name: 'Tissues / Napkins', _id: 'ref_18' },
    { name: 'Trash bags', _id: 'ref_19' }
  ]);
  
  const eventTypes = ['Technical', 'Non-Technical', 'Hackathon', 'Seminar', 'Workshop'];
  
  const technicalTags = [
    'Programming & Coding',
    'Competitive Coding', 
    'Database & SQL',
    'DSA & Problem Solving',
    'Debugging & Logic',
    'Cyber Security',
    'Web Development',
    'UI/UX Design',
    'Project & Presentation',
    'Technical Quiz'
  ];
  
  const nonTechnicalTags = [
    'General Quiz',
    'Management & Strategy',
    'Creative & Marketing',
    'Photography & Media',
    'Fun & Engagement',
    'Communication & Voice'
  ];
  
  const getDefaultRequirements = (eventType) => {
    switch (eventType) {
      case 'Technical':
        return {
          volunteers_needed: 5,
          rooms_needed: 2,
          refreshments_needed: true,
          stationary_needed: true,
          goodies_needed: false,
          physical_certificate: true,
          trophies_needed: true
        };
      case 'Non-Technical':
        return {
          volunteers_needed: 3,
          rooms_needed: 1,
          refreshments_needed: true,
          stationary_needed: false,
          goodies_needed: true,
          physical_certificate: true,
          trophies_needed: true
        };
      case 'Hackathon':
        return {
          volunteers_needed: 8,
          rooms_needed: 3,
          refreshments_needed: true,
          stationary_needed: true,
          goodies_needed: true,
          physical_certificate: true,
          trophies_needed: true
        };
      case 'Seminar':
        return {
          volunteers_needed: 2,
          rooms_needed: 1,
          refreshments_needed: true,
          stationary_needed: true,
          goodies_needed: false,
          physical_certificate: true,
          trophies_needed: false
        };
      case 'Workshop':
        return {
          volunteers_needed: 4,
          rooms_needed: 2,
          refreshments_needed: true,
          stationary_needed: true,
          goodies_needed: false,
          physical_certificate: true,
          trophies_needed: false
        };
      default:
        return {
          volunteers_needed: 0,
          rooms_needed: 0,
          refreshments_needed: false,
          stationary_needed: false,
          goodies_needed: false,
          physical_certificate: false,
          trophies_needed: false
        };
    }
  };
  
  const getAvailableTags = (eventType) => {
    if (eventType === 'Technical' || eventType === 'Hackathon') {
      return technicalTags;
    } else if (eventType === 'Non-Technical') {
      return nonTechnicalTags;
    } else {
      // For Seminar and Workshop, show all tags
      return [...technicalTags, ...nonTechnicalTags];
    }
  };
  const [activeView, setActiveView] = useState('overview');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    type: '',
    description: '',
    cover_photo: null,
    tags: [],
    date: '',
    time: '',
    duration_hours: '',
    venue: '',
    expected_participants: '',
    prize_pool: '',
    prize_pool_required: false,
    registration_fee_required: false,
    requirements: {
      volunteers_needed: 0,
      rooms_needed: 0,
      computer_labs_needed: false,
      computer_labs_count: 0,
      system_per_participant: false,
      internet_needed: false,
      judges_needed: false,
      judges_count: 0,
      refreshments_needed: false,
      refreshment_items: [],
      custom_refreshment_items: '',
      stationary_needed: false,
      stationary_items: [],
      custom_stationary_items: '',
      technical_needed: false,
      technical_items: [],
      custom_technical_items: '',
      goodies_needed: false,
      physical_certificate: false,
      trophies_needed: false
    }
  });
  const [scheduleCheck, setScheduleCheck] = useState(null);
  const [checkingSchedule, setCheckingSchedule] = useState(false);

  const handleCheckSchedule = async () => {
    if (!eventForm.date || !eventForm.time || !eventForm.duration_hours || !eventForm.type || !eventForm.expected_participants) {
      alert('Please fill in Date, Time, Duration, Event Type, and Expected Participants first.');
      return;
    }

    setCheckingSchedule(true);
    try {
      const res = await axios.post('/scheduling/check-conflict', {
        date: eventForm.date,
        time: eventForm.time,
        duration_hours: parseInt(eventForm.duration_hours),
        type: eventForm.type,
        expected_participants: parseInt(eventForm.expected_participants),
        prize_pool: parseInt(eventForm.prize_pool) || 0,
        registration_fee: 0
      });

      setScheduleCheck(res.data);
    } catch (error) {
      console.error('Schedule check error:', error);
      alert('Failed to check schedule: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setCheckingSchedule(false);
    }
  };

  const handleBackToOverview = () => {
    console.log('Back button clicked, current view:', activeView);
    setActiveView('overview');
  };

  useEffect(() => {
    fetchMyEvents();
    fetchStationeryItems();
  }, []);

  useEffect(() => {
    console.log('Stationery items loaded:', stationeryItems);
  }, [stationeryItems]);

  const fetchMyEvents = async () => {
    try {
      const response = await axios.get('/events');
      const myEvents = response.data;
      setEvents(myEvents);
      
      const created = myEvents.length;
      const pending = myEvents.filter(e => ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'TREASURER_APPROVED', 'GENSEC_APPROVED', 'CHAIRPERSON_APPROVED'].includes(e.status)).length;
      const published = myEvents.filter(e => e.status === 'PUBLISHED').length;
      
      setStats({ created, pending, published });
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const fetchStationeryItems = async () => {
    try {
      const response = await axios.get('/stationery');
      setStationeryItems(response.data);
    } catch (error) {
      console.error('Failed to fetch stationery items:', error);
    }
  };

  const handleTagToggle = (tag) => {
    setEventForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };
  
  const handleTypeChange = (selectedType) => {
    // Set default requirements based on event type
    const defaultRequirements = getDefaultRequirements(selectedType);
    
    setEventForm(prev => ({
      ...prev,
      type: selectedType,
      tags: [], // Reset tags when type changes
      requirements: defaultRequirements // Set default requirements
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventForm({...eventForm, cover_photo: file});
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(eventForm).forEach(key => {
        if (key === 'cover_photo' && eventForm[key]) {
          formData.append(key, eventForm[key]);
        } else if (key === 'tags') {
          formData.append(key, JSON.stringify(eventForm[key]));
        } else if (key === 'requirements') {
          formData.append(key, JSON.stringify(eventForm[key]));
        } else {
          formData.append(key, eventForm[key]);
        }
      });
      
      // Add stationery items separately
      formData.append('stationery_items', JSON.stringify(eventForm.requirements.stationary_items));
      
      await axios.post('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Event created successfully!');
      setEventForm({
        title: '', type: '', description: '', cover_photo: null, tags: [], date: '', time: '', duration_hours: '', venue: '', expected_participants: '', prize_pool: '', prize_pool_required: false, registration_fee_required: false,
        requirements: {
          volunteers_needed: 0, rooms_needed: 0, computer_labs_needed: false, computer_labs_count: 0, system_per_participant: false, internet_needed: false, judges_needed: false, judges_count: 0, refreshments_needed: false, refreshment_items: [], custom_refreshment_items: '',
          stationary_needed: false, stationary_items: [], custom_stationary_items: '', 
          technical_needed: false, technical_items: [], custom_technical_items: '', goodies_needed: false, physical_certificate: false, trophies_needed: false
        }
      });
      setActiveView('overview');
      fetchMyEvents();
    } catch (error) {
      console.error('Event creation error:', error.response?.data);
      alert('Failed to create event: ' + (error.response?.data?.message || error.message || 'Unknown error'));
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setActiveView('eventDetails');
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await axios.delete(`/events/${eventId}`);
        alert('Event deleted successfully!');
        fetchMyEvents();
        if (selectedEvent && selectedEvent._id === eventId) {
          setActiveView('events');
        }
      } catch (error) {
        alert('Failed to delete event: ' + (error.response?.data?.message || 'Unknown error'));
      }
    }
  };

  const handleSubmitForApproval = async (eventId) => {
    try {
      const response = await axios.put(`/events/${eventId}/submit`);
      alert('Event submitted for approval!');
      fetchMyEvents();
    } catch (error) {
      alert('Failed to submit: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const renderOverview = () => (
    <div className="card-grid fade-in">
      <div className="card">
        <h3 className="card-title">My Events</h3>
        <div className="card-content">
          <p><strong>Created:</strong> {stats.created}</p>
          <p><strong>Pending Approval:</strong> {stats.pending}</p>
          <p><strong>Published:</strong> {stats.published}</p>
        </div>
      </div>
      <div className="card">
        <h3 className="card-title">Actions</h3>
        <div className="card-content">
          <button 
            className="btn btn-primary"
            onClick={() => setActiveView('create')}
            style={{ margin: '0.25rem', width: '100%' }}
          >
            Create New Event
          </button>
          <button 
            className="btn btn-success"
            onClick={() => setActiveView('events')}
            style={{ margin: '0.25rem', width: '100%' }}
          >
            View My Events
          </button>
        </div>
      </div>
    </div>
  );

  const renderCreateEvent = () => (
    <div className="fade-in" style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0', minHeight: '100vh', alignItems: 'flex-start' }}>
      <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
        <div className="nav-header">
          <h3 className="nav-title">Create New Event</h3>
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
        
        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea 
            className="form-input"
            placeholder="Enter event description"
            required
            rows="3"
            value={eventForm.description}
            onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Cover Photo</label>
          <input 
            type="file" 
            className="form-input"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input 
              type="date" 
              className="form-input"
              required
              min={new Date().toISOString().split('T')[0]}
              value={eventForm.date}
              onChange={(e) => {
                setEventForm({...eventForm, date: e.target.value});
                setScheduleCheck(null); // Reset check when date changes
              }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Time *</label>
            <input 
              type="time" 
              className="form-input"
              required
              value={eventForm.time}
              onChange={(e) => {
                setEventForm({...eventForm, time: e.target.value});
                setScheduleCheck(null); // Reset check when time changes
              }}
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
            onChange={(e) => {
              setEventForm({...eventForm, duration_hours: e.target.value});
              setScheduleCheck(null); // Reset check when duration changes
            }}
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
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">Event Tags</label>
          {eventForm.type && (
            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
              {getAvailableTags(eventForm.type).map(tag => (
                <label key={tag} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={eventForm.tags.includes(tag)}
                    onChange={() => handleTagToggle(tag)}
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
          )}
          {!eventForm.type && (
            <p style={{ color: '#B8B6D8', fontStyle: 'italic' }}>Please select an event type first to see available tags</p>
          )}
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
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={eventForm.prize_pool_required}
                onChange={(e) => setEventForm({...eventForm, prize_pool_required: e.target.checked, prize_pool: e.target.checked ? eventForm.prize_pool : ''})}
              />
              <span>Prize Pool Required</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={eventForm.registration_fee_required}
              onChange={(e) => setEventForm({...eventForm, registration_fee_required: e.target.checked})}
            />
            <span>Registration Fee Required</span>
          </label>
          {eventForm.registration_fee_required && (
            <p style={{ color: '#B8B6D8', fontSize: '0.9rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
              Note: The registration fee amount will be set by the Treasurer during approval.
            </p>
          )}
        </div>

        {/* Schedule Conflict Check Section */}
        {eventForm.date && eventForm.time && eventForm.duration_hours && eventForm.type && eventForm.expected_participants && (
          <div className="card" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            <h3 className="card-title">Schedule Conflict Check</h3>
            <div className="card-content">
              <button 
                type="button"
                onClick={handleCheckSchedule}
                disabled={checkingSchedule}
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: scheduleCheck ? '1rem' : '0' }}
              >
                {checkingSchedule ? 'Checking...' : 'Check Schedule Conflicts'}
              </button>

              {scheduleCheck && (
                <div style={{ marginTop: '1rem' }}>
                  {scheduleCheck.hasConflicts ? (
                    <div className="card" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                      <div className="card-content">
                        <h4 style={{ color: '#ef4444', marginBottom: '0.75rem' }}>Schedule Conflicts Detected</h4>
                        {scheduleCheck.conflicts.map((conflict, idx) => (
                          <div key={idx} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                            <strong>{conflict.title}</strong> ({conflict.type})<br/>
                            <span style={{ fontSize: '0.9rem', color: '#B8B6D8' }}>
                              Time: {conflict.time} | Duration: {conflict.duration}h
                            </span>
                          </div>
                        ))}
                        
                        {scheduleCheck.suggestions.length > 0 && (
                          <div style={{ marginTop: '1rem' }}>
                            <h5 style={{ color: '#22c55e', marginBottom: '0.5rem' }}>Suggested Alternative Times:</h5>
                            {scheduleCheck.suggestions.map((sug, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setEventForm({...eventForm, time: sug.time});
                                  setScheduleCheck(null);
                                }}
                                className="btn btn-secondary"
                                style={{ display: 'block', width: '100%', marginBottom: '0.5rem', textAlign: 'left' }}
                              >
                                {sug.time} - {sug.reason} ({sug.availableVenues} venues available)
                              </button>
                            ))}
                          </div>
                        )}
                        
                        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#B8B6D8', fontStyle: 'italic' }}>
                          You can still proceed with your chosen time, but conflicts may need to be resolved.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="card" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                      <div className="card-content">
                        <h4 style={{ color: '#22c55e', marginBottom: '0.5rem' }}>No Conflicts Found</h4>
                        <p style={{ fontSize: '0.9rem', color: '#B8B6D8' }}>
                          Your selected time slot is available. You can proceed with event creation.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#667eea' }}>Requirements</h4>
        
        <div className="form-group">
          <label className="form-label">Volunteers Needed</label>
          <input 
            type="number" 
            className="form-input"
            value={eventForm.requirements.volunteers_needed || ''}
            onChange={(e) => setEventForm({...eventForm, requirements: {...eventForm.requirements, volunteers_needed: parseInt(e.target.value) || 0}})}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={eventForm.requirements.system_per_participant}
              onChange={(e) => setEventForm({...eventForm, requirements: {...eventForm.requirements, system_per_participant: e.target.checked}})}
            />
            <span>System Per Participant</span>
          </label>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={eventForm.requirements.judges_needed}
              onChange={(e) => {
                const isChecked = e.target.checked;
                setEventForm({...eventForm, requirements: {
                  ...eventForm.requirements, 
                  judges_needed: isChecked,
                  judges_count: isChecked ? eventForm.requirements.judges_count : 0
                }});
              }}
            />
            <span>Judges Needed</span>
          </label>
          {eventForm.requirements.judges_needed && (
            <div className="form-group">
              <label className="form-label">Number of Judges</label>
              <input 
                type="number" 
                className="form-input"
                min="1"
                value={eventForm.requirements.judges_count || ''}
                onChange={(e) => setEventForm({...eventForm, requirements: {...eventForm.requirements, judges_count: parseInt(e.target.value) || 0}})}
              />
            </div>
          )}
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={eventForm.requirements.internet_needed}
              onChange={(e) => setEventForm({...eventForm, requirements: {...eventForm.requirements, internet_needed: e.target.checked}})}
            />
            <span>Internet Needed</span>
          </label>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={eventForm.requirements.refreshments_needed}
              onChange={(e) => {
                const isChecked = e.target.checked;
                setEventForm({...eventForm, requirements: {
                  ...eventForm.requirements, 
                  refreshments_needed: isChecked,
                  refreshment_items: isChecked ? eventForm.requirements.refreshment_items : [],
                  custom_refreshment_items: isChecked ? eventForm.requirements.custom_refreshment_items : ''
                }});
              }}
            />
            <span>Refreshments Needed</span>
          </label>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={eventForm.requirements.stationary_needed}
              onChange={(e) => {
                const isChecked = e.target.checked;
                setEventForm({...eventForm, requirements: {
                  ...eventForm.requirements, 
                  stationary_needed: isChecked,
                  stationary_items: isChecked ? eventForm.requirements.stationary_items : [],
                  custom_stationary_items: isChecked ? eventForm.requirements.custom_stationary_items : ''
                }});
              }}
            />
            <span>Stationary Needed</span>
          </label>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={eventForm.requirements.technical_needed}
              onChange={(e) => {
                const isChecked = e.target.checked;
                setEventForm({...eventForm, requirements: {
                  ...eventForm.requirements, 
                  technical_needed: isChecked,
                  technical_items: isChecked ? eventForm.requirements.technical_items : [],
                  custom_technical_items: isChecked ? eventForm.requirements.custom_technical_items : ''
                }});
              }}
            />
            <span>Technical Items Needed</span>
          </label>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={eventForm.requirements.goodies_needed}
              onChange={(e) => setEventForm({...eventForm, requirements: {...eventForm.requirements, goodies_needed: e.target.checked}})}
            />
            <span>Goodies Needed</span>
          </label>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={eventForm.requirements.physical_certificate}
              onChange={(e) => setEventForm({...eventForm, requirements: {...eventForm.requirements, physical_certificate: e.target.checked}})}
            />
            <span>Physical Certificate</span>
          </label>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={eventForm.requirements.trophies_needed}
              onChange={(e) => setEventForm({...eventForm, requirements: {...eventForm.requirements, trophies_needed: e.target.checked}})}
            />
            <span>Trophies Needed</span>
          </label>
          
        </div>

        {eventForm.requirements.stationary_needed && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '1.5rem', 
            background: 'rgba(0, 229, 255, 0.05)', 
            borderRadius: '12px', 
            border: '1px solid rgba(0, 229, 255, 0.2)',
            gridColumn: '1 / -1'
          }}>
            <h5 style={{ marginBottom: '1.5rem', color: '#00E5FF', fontSize: '1.1rem' }}>Select Stationery Items</h5>
            {stationeryItems.length === 0 ? (
              <p style={{ color: '#B8B6D8', fontStyle: 'italic' }}>Loading stationery items...</p>
            ) : (
              <>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                  gap: '0.75rem',
                  marginBottom: '1.5rem'
                }}>
                  {stationeryItems && stationeryItems.length > 0 ? stationeryItems.map(item => {
                    const selectedItem = eventForm.requirements.stationary_items && eventForm.requirements.stationary_items.find(si => si.item_id === item._id);
                    return (
                      <div key={item._id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        padding: '0.75rem', 
                        background: 'rgba(255,255,255,0.08)', 
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.2s ease'
                      }}>
                        <input 
                          type="checkbox" 
                          checked={!!selectedItem}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEventForm({...eventForm, requirements: {
                                ...eventForm.requirements,
                                stationary_items: [...(eventForm.requirements.stationary_items || []), {
                                  item_id: item._id,
                                  item_name: item.name,
                                  quantity: 1
                                }]
                              }});
                            } else {
                              setEventForm({...eventForm, requirements: {
                                ...eventForm.requirements,
                                stationary_items: (eventForm.requirements.stationary_items || []).filter(si => si.item_id !== item._id)
                              }});
                            }
                          }}
                          style={{ 
                            marginRight: '0.75rem',
                            transform: 'scale(1.1)'
                          }}
                        />
                        <span style={{ 
                          flex: 1, 
                          color: '#F5F7FF',
                          fontSize: '0.95rem',
                          fontWeight: '500'
                        }}>{item.name}</span>
                        {selectedItem && (
                          <input 
                            type="number" 
                            min="1" 
                            value={selectedItem.quantity}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value) || 1;
                              setEventForm({...eventForm, requirements: {
                                ...eventForm.requirements,
                                stationary_items: (eventForm.requirements.stationary_items || []).map(si => 
                                  si.item_id === item._id ? {...si, quantity: newQuantity} : si
                                )
                              }});
                            }}
                            style={{ 
                              width: '70px', 
                              marginLeft: '0.75rem',
                              padding: '0.4rem 0.6rem',
                              background: 'rgba(255,255,255,0.15)',
                              border: '1px solid rgba(0, 229, 255, 0.3)',
                              borderRadius: '6px',
                              color: '#F5F7FF',
                              fontSize: '0.9rem',
                              textAlign: 'center'
                            }}
                          />
                        )}
                      </div>
                    );
                  }) : (
                    <p style={{ color: '#B8B6D8', fontStyle: 'italic' }}>Loading stationery items...</p>
                  )}}
                </div>
                
                <div style={{ 
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <label className="form-label" style={{ 
                    marginBottom: '0.75rem',
                    color: '#00E5FF',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}>Additional Items</label>
                  <textarea 
                    className="form-input"
                    placeholder="Enter any additional stationery items not listed above (e.g., Markers - 5, Scissors - 2, etc.)"
                    rows="3"
                    value={eventForm.requirements.custom_stationary_items}
                    onChange={(e) => setEventForm({...eventForm, requirements: {
                      ...eventForm.requirements, 
                      custom_stationary_items: e.target.value
                    }})}
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(0, 229, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#F5F7FF',
                      fontSize: '0.95rem',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </>
            )}
          </div>
        )}
        
        {eventForm.requirements.technical_needed && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '1.5rem', 
            background: 'rgba(103, 126, 234, 0.05)', 
            borderRadius: '12px', 
            border: '1px solid rgba(103, 126, 234, 0.2)',
            gridColumn: '1 / -1'
          }}>
            <h5 style={{ marginBottom: '1.5rem', color: '#667eea', fontSize: '1.1rem' }}>Select Technical Items</h5>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              {technicalItems.map(item => {
                const selectedItem = eventForm.requirements.technical_items && eventForm.requirements.technical_items.find(ti => ti.item_id === item._id);
                return (
                  <div key={item._id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0.75rem', 
                    background: 'rgba(255,255,255,0.08)', 
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.2s ease'
                  }}>
                    <input 
                      type="checkbox" 
                      checked={!!selectedItem}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEventForm({...eventForm, requirements: {
                            ...eventForm.requirements,
                            technical_items: [...(eventForm.requirements.technical_items || []), {
                              item_id: item._id,
                              item_name: item.name,
                              quantity: 1
                            }]
                          }});
                        } else {
                          setEventForm({...eventForm, requirements: {
                            ...eventForm.requirements,
                            technical_items: (eventForm.requirements.technical_items || []).filter(ti => ti.item_id !== item._id)
                          }});
                        }
                      }}
                      style={{ 
                        marginRight: '0.75rem',
                        transform: 'scale(1.1)'
                      }}
                    />
                    <span style={{ 
                      flex: 1, 
                      color: '#F5F7FF',
                      fontSize: '0.95rem',
                      fontWeight: '500'
                    }}>{item.name}</span>
                    {selectedItem && (
                      <input 
                        type="number" 
                        min="1" 
                        value={selectedItem.quantity}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value) || 1;
                          setEventForm({...eventForm, requirements: {
                            ...eventForm.requirements,
                            technical_items: (eventForm.requirements.technical_items || []).map(ti => 
                              ti.item_id === item._id ? {...ti, quantity: newQuantity} : ti
                            )
                          }});
                        }}
                        style={{ 
                          width: '70px', 
                          marginLeft: '0.75rem',
                          padding: '0.4rem 0.6rem',
                          background: 'rgba(255,255,255,0.15)',
                          border: '1px solid rgba(103, 126, 234, 0.3)',
                          borderRadius: '6px',
                          color: '#F5F7FF',
                          fontSize: '0.9rem',
                          textAlign: 'center'
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            
            <div style={{ 
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <label className="form-label" style={{ 
                marginBottom: '0.75rem',
                color: '#667eea',
                fontSize: '1rem',
                fontWeight: '500'
              }}>Additional Technical Items</label>
              <textarea 
                className="form-input"
                placeholder="Enter any additional technical items not listed above (e.g., Wireless Mouse - 2, Laser Pointer - 1, etc.)"
                rows="3"
                value={eventForm.requirements.custom_technical_items}
                onChange={(e) => setEventForm({...eventForm, requirements: {
                  ...eventForm.requirements, 
                  custom_technical_items: e.target.value
                }})}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(103, 126, 234, 0.2)',
                  borderRadius: '8px',
                  color: '#F5F7FF',
                  fontSize: '0.95rem',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>
        )}
        
        {eventForm.requirements.refreshments_needed && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '1.5rem', 
            background: 'rgba(34, 197, 94, 0.05)', 
            borderRadius: '12px', 
            border: '1px solid rgba(34, 197, 94, 0.2)',
            gridColumn: '1 / -1'
          }}>
            <h5 style={{ marginBottom: '1.5rem', color: '#22c55e', fontSize: '1.1rem' }}>Select Refreshment Items</h5>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              {refreshmentItems.map(item => {
                const selectedItem = eventForm.requirements.refreshment_items && eventForm.requirements.refreshment_items.find(ri => ri.item_id === item._id);
                return (
                  <div key={item._id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0.75rem', 
                    background: 'rgba(255,255,255,0.08)', 
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.2s ease'
                  }}>
                    <input 
                      type="checkbox" 
                      checked={!!selectedItem}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEventForm({...eventForm, requirements: {
                            ...eventForm.requirements,
                            refreshment_items: [...(eventForm.requirements.refreshment_items || []), {
                              item_id: item._id,
                              item_name: item.name,
                              quantity: 1
                            }]
                          }});
                        } else {
                          setEventForm({...eventForm, requirements: {
                            ...eventForm.requirements,
                            refreshment_items: (eventForm.requirements.refreshment_items || []).filter(ri => ri.item_id !== item._id)
                          }});
                        }
                      }}
                      style={{ 
                        marginRight: '0.75rem',
                        transform: 'scale(1.1)'
                      }}
                    />
                    <span style={{ 
                      flex: 1, 
                      color: '#F5F7FF',
                      fontSize: '0.95rem',
                      fontWeight: '500'
                    }}>{item.name}</span>
                    {selectedItem && (
                      <input 
                        type="number" 
                        min="1" 
                        value={selectedItem.quantity}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value) || 1;
                          setEventForm({...eventForm, requirements: {
                            ...eventForm.requirements,
                            refreshment_items: (eventForm.requirements.refreshment_items || []).map(ri => 
                              ri.item_id === item._id ? {...ri, quantity: newQuantity} : ri
                            )
                          }});
                        }}
                        style={{ 
                          width: '70px', 
                          marginLeft: '0.75rem',
                          padding: '0.4rem 0.6rem',
                          background: 'rgba(255,255,255,0.15)',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          borderRadius: '6px',
                          color: '#F5F7FF',
                          fontSize: '0.9rem',
                          textAlign: 'center'
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            
            <div style={{ 
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <label className="form-label" style={{ 
                marginBottom: '0.75rem',
                color: '#22c55e',
                fontSize: '1rem',
                fontWeight: '500'
              }}>Additional Refreshment Items</label>
              <textarea 
                className="form-input"
                placeholder="Enter any additional refreshment items not listed above (e.g., Ice cream - 50, Sandwiches - 30, etc.)"
                rows="3"
                value={eventForm.requirements.custom_refreshment_items}
                onChange={(e) => setEventForm({...eventForm, requirements: {
                  ...eventForm.requirements, 
                  custom_refreshment_items: e.target.value
                }})}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: '8px',
                  color: '#F5F7FF',
                  fontSize: '0.95rem',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>
        )}

        <button 
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', padding: '1rem', marginTop: '2rem' }}
        >
          Create Event
        </button>
        </form>
      </div>
    </div>
  );

  const renderMyEvents = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">My Events</h3>
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
              }}>Title</th>
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
            {events.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ 
                  textAlign: 'center', 
                  padding: '2rem', 
                  color: '#B8B6D8'
                }}>
                  No events created yet. Click "Create New Event" to get started!
                </td>
              </tr>
            ) : (
              events.map(event => (
                <tr key={event._id}>
                  <td style={{ padding: '1rem', color: '#F5F7FF' }}>
                    <button 
                      className="btn-link"
                      onClick={() => handleEventClick(event)}
                      style={{ background: 'none', border: 'none', color: '#00E5FF', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      {event.title}
                    </button>
                  </td>
                  <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.type}</td>
                  <td style={{ padding: '1rem', color: '#F5F7FF' }}>{new Date(event.date).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.expected_participants}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`status-badge ${
                      event.status === 'PUBLISHED' ? 'status-published' : 
                      event.status === 'DRAFT' ? 'status-created' : 
                      event.status === 'REJECTED' ? 'status-rejected' : 'status-pending'
                    }`}>
                      {event.status === 'TREASURER_APPROVED' ? 'APPROVED BY TREASURER' :
                       event.status === 'GENSEC_APPROVED' ? 'APPROVED BY GEN SEC' :
                       event.status === 'CHAIRPERSON_APPROVED' ? 'APPROVED BY CHAIRPERSON' :
                       event.status === 'UNDER_REVIEW' ? 'UNDER REVIEW' :
                       event.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {event.status === 'DRAFT' && (
                      <>
                        <button 
                          className="btn btn-success"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', marginRight: '0.5rem' }}
                          onClick={() => handleSubmitForApproval(event._id)}
                        >
                          Submit
                        </button>
                        <button 
                          className="btn btn-danger"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                          onClick={() => handleDeleteEvent(event._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {event.status === 'PUBLISHED' && (
                      <button 
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', marginRight: '0.5rem' }}
                        onClick={() => {
                          setSelectedEvent(event);
                          setActiveView('participants');
                        }}
                      >
                        View Participants
                      </button>
                    )}
                    {event.status !== 'DRAFT' && event.status !== 'PUBLISHED' && (
                      <button 
                        className="btn btn-danger"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        onClick={() => handleDeleteEvent(event._id)}
                      >
                        Delete
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
  );

  const renderEventDetails = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Event Details - {selectedEvent?.title}</h3>
        <button 
          onClick={() => setActiveView('events')}
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
          ← Back to Events
        </button>
      </div>
      
      <div className="card-grid">
        <div className="card">
          <h3 className="card-title">Event Information</h3>
          <div className="card-content">
            <p><strong>Title:</strong> {selectedEvent?.title}</p>
            <p><strong>Type:</strong> {selectedEvent?.type}</p>
            <p><strong>Description:</strong> {selectedEvent?.description}</p>
            <p><strong>Date:</strong> {new Date(selectedEvent?.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {selectedEvent?.time}</p>
            <p><strong>Duration:</strong> {selectedEvent?.duration_hours} hours</p>
            <p><strong>Venue:</strong> {selectedEvent?.venue || 'To be allocated by Hospitality Team'}</p>
            <p><strong>Expected Participants:</strong> {selectedEvent?.expected_participants}</p>
            {selectedEvent?.cover_photo && (
              <div style={{ marginTop: '1rem' }}>
                <strong>Cover Photo:</strong>
                <img 
                  src={`http://localhost:5000/${selectedEvent.cover_photo.replace(/\\/g, '/')}`} 
                  alt="Event Cover" 
                  style={{ width: '100%', maxWidth: '300px', height: 'auto', marginTop: '0.5rem', borderRadius: '8px' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <p style={{ display: 'none', color: '#B8B6D8', fontStyle: 'italic' }}>Image not available</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="card">
          <h3 className="card-title">Event Tags (Internal)</h3>
          <div className="card-content">
            {selectedEvent?.tags && selectedEvent.tags.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {selectedEvent.tags.map(tag => (
                  <span key={tag} style={{
                    background: 'rgba(0, 229, 255, 0.1)',
                    color: '#00E5FF',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    border: '1px solid rgba(0, 229, 255, 0.3)'
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p>No tags assigned</p>
            )}
          </div>
        </div>
        
        <div className="card">
          <h3 className="card-title">Budget & Prizes</h3>
          <div className="card-content">
            <p><strong>Prize Pool Required:</strong> {selectedEvent?.prize_pool_required ? 'Yes' : 'No'}</p>
            {selectedEvent?.prize_pool > 0 && (
              <p><strong>Prize Pool:</strong> ₹{selectedEvent?.prize_pool}</p>
            )}
            <p><strong>Registration Fee Required:</strong> {selectedEvent?.registration_fee_required ? 'Yes' : 'No'}</p>
            {selectedEvent?.registration_fee > 0 && (
              <p><strong>Registration Fee:</strong> ₹{selectedEvent?.registration_fee}</p>
            )}
            {selectedEvent?.total_budget > 0 && (
              <p><strong>Approved Budget:</strong> ₹{selectedEvent?.total_budget}</p>
            )}
          </div>
        </div>
        
        <div className="card">
          <h3 className="card-title">Requirements</h3>
          <div className="card-content">
            <p><strong>Volunteers:</strong> {selectedEvent?.requirements?.volunteers_needed || 0}</p>
            <p><strong>System Per Participant:</strong> {selectedEvent?.requirements?.system_per_participant ? 'Yes' : 'No'}</p>
            <p><strong>Internet:</strong> {selectedEvent?.requirements?.internet_needed ? 'Yes' : 'No'}</p>
            <p><strong>Judges:</strong> {selectedEvent?.requirements?.judges_needed ? `Yes (${selectedEvent?.requirements?.judges_count || 0} judges)` : 'No'}</p>
            <p><strong>Refreshments:</strong> {selectedEvent?.requirements?.refreshments_needed ? 'Yes' : 'No'}</p>
            {selectedEvent?.requirements?.refreshments_needed && selectedEvent?.requirements?.refreshment_items?.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Refreshment Items:</strong>
                <ul style={{ marginTop: '0.25rem', paddingLeft: '1rem' }}>
                  {selectedEvent.requirements.refreshment_items.map((item, index) => (
                    <li key={index} style={{ color: '#B8B6D8', fontSize: '0.9rem' }}>
                      {item.item_name} - Quantity: {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selectedEvent?.requirements?.custom_refreshment_items && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Additional Refreshment Items:</strong>
                <p style={{ color: '#B8B6D8', fontSize: '0.9rem', marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>
                  {selectedEvent.requirements.custom_refreshment_items}
                </p>
              </div>
            )}
            <p><strong>Stationary:</strong> {selectedEvent?.requirements?.stationary_needed ? 'Yes' : 'No'}</p>
            {selectedEvent?.requirements?.stationary_needed && selectedEvent?.requirements?.stationary_items?.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Stationery Items:</strong>
                <ul style={{ marginTop: '0.25rem', paddingLeft: '1rem' }}>
                  {selectedEvent.requirements.stationary_items.map((item, index) => (
                    <li key={index} style={{ color: '#B8B6D8', fontSize: '0.9rem' }}>
                      {item.item_name} - Quantity: {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selectedEvent?.requirements?.custom_stationary_items && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Additional Stationery Items:</strong>
                <p style={{ color: '#B8B6D8', fontSize: '0.9rem', marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>
                  {selectedEvent.requirements.custom_stationary_items}
                </p>
              </div>
            )}
            <p><strong>Technical Items:</strong> {selectedEvent?.requirements?.technical_needed ? 'Yes' : 'No'}</p>
            {selectedEvent?.requirements?.technical_needed && selectedEvent?.requirements?.technical_items?.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Technical Items:</strong>
                <ul style={{ marginTop: '0.25rem', paddingLeft: '1rem' }}>
                  {selectedEvent.requirements.technical_items.map((item, index) => (
                    <li key={index} style={{ color: '#B8B6D8', fontSize: '0.9rem' }}>
                      {item.item_name} - Quantity: {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selectedEvent?.requirements?.custom_technical_items && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Additional Technical Items:</strong>
                <p style={{ color: '#B8B6D8', fontSize: '0.9rem', marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>
                  {selectedEvent.requirements.custom_technical_items}
                </p>
              </div>
            )}
            <p><strong>Goodies:</strong> {selectedEvent?.requirements?.goodies_needed ? 'Yes' : 'No'}</p>
            <p><strong>Physical Certificate:</strong> {selectedEvent?.requirements?.physical_certificate ? 'Yes' : 'No'}</p>
            <p><strong>Trophies:</strong> {selectedEvent?.requirements?.trophies_needed ? 'Yes' : 'No'}</p>
          </div>
        </div>
        
        <div className="card">
          <h3 className="card-title">Status & Comments</h3>
          <div className="card-content">
            <p><strong>Current Status:</strong> 
              <span className={`status-badge ${
                selectedEvent?.status === 'PUBLISHED' ? 'status-published' : 
                selectedEvent?.status === 'DRAFT' ? 'status-created' : 
                selectedEvent?.status === 'REJECTED' ? 'status-rejected' : 'status-pending'
              }`} style={{ marginLeft: '0.5rem' }}>
                {selectedEvent?.status === 'TREASURER_APPROVED' ? 'APPROVED BY TREASURER' :
                 selectedEvent?.status === 'GENSEC_APPROVED' ? 'APPROVED BY GEN SEC' :
                 selectedEvent?.status === 'CHAIRPERSON_APPROVED' ? 'APPROVED BY CHAIRPERSON' :
                 selectedEvent?.status === 'UNDER_REVIEW' ? 'UNDER REVIEW' :
                 selectedEvent?.status?.replace(/_/g, ' ')}
              </span>
            </p>
            {selectedEvent?.treasurer_comments && (
              <p><strong>Treasurer Comments:</strong> {selectedEvent.treasurer_comments}</p>
            )}
            {selectedEvent?.gen_sec_comments && (
              <p><strong>Gen Sec Comments:</strong> {selectedEvent.gen_sec_comments}</p>
            )}
            {selectedEvent?.chairperson_comments && (
              <p><strong>Chairperson Comments:</strong> {selectedEvent.chairperson_comments}</p>
            )}
          </div>
        </div>
        
        <div className="card">
          <h3 className="card-title">Venue Allocation</h3>
          <div className="card-content">
            {selectedEvent?.hospitality?.venue_allocated ? (
              <div>
                <p><strong>Status:</strong> <span style={{ color: '#4CAF50' }}>Allocated</span></p>
                {selectedEvent.hospitality.allocated_rooms?.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <p><strong>Allocated Rooms:</strong></p>
                    {selectedEvent.hospitality.allocated_rooms.map((room, idx) => (
                      <p key={idx} style={{ marginLeft: '1rem', fontSize: '0.9rem' }}>
                        • {room.room_number} - {room.room_name}
                      </p>
                    ))}
                  </div>
                )}
                {selectedEvent.hospitality.lab_allocated && (
                  <p><strong>Lab:</strong> {selectedEvent.hospitality.lab_allocated}</p>
                )}
                <p><strong>Complete Venue:</strong> {selectedEvent.hospitality.venue_details}</p>
              </div>
            ) : (
              <p><strong>Status:</strong> <span style={{ color: '#FF9800' }}>Pending Allocation</span></p>
            )}
          </div>
        </div>
        
        <div className="card">
          <h3 className="card-title">Volunteer Allocation</h3>
          <div className="card-content">
            {selectedEvent?.hr?.volunteers_allocated ? (
              <div>
                <p><strong>Status:</strong> <span style={{ color: '#4CAF50' }}>Allocated</span></p>
                {selectedEvent.hr.allocated_volunteers?.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <p><strong>Allocated Volunteers:</strong></p>
                    {selectedEvent.hr.allocated_volunteers.map((vol, idx) => (
                      <div key={idx} style={{ marginLeft: '1rem', fontSize: '0.9rem', marginBottom: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                        <div>• <strong>{vol.volunteer_name}</strong> - {vol.volunteer_role}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {vol.volunteer_contact} | {vol.volunteer_department}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedEvent.hr.allocated_judges?.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <p><strong>Allocated Judges:</strong></p>
                    {selectedEvent.hr.allocated_judges.map((judge, idx) => (
                      <div key={idx} style={{ marginLeft: '1rem', fontSize: '0.9rem', marginBottom: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                        <div>• <strong>{judge.judge_name}</strong> - {judge.judge_expertise}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {judge.judge_contact} | {judge.judge_designation}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p><strong>Status:</strong> <span style={{ color: '#FF9800' }}>Pending Allocation</span></p>
            )}
          </div>
        </div>
      </div>
      
      {selectedEvent?.status === 'PUBLISHED' && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3 className="card-title">Registration Control</h3>
          <div className="card-content">
            <p style={{ marginBottom: '1rem' }}>
              <strong>Current Status:</strong>{' '}
              <span style={{ 
                color: selectedEvent?.registration_status === 'OPEN' ? '#4CAF50' : 
                       selectedEvent?.registration_status === 'PAUSED' ? '#FF9800' : '#ef4444'
              }}>
                {selectedEvent?.registration_status || 'OPEN'}
              </span>
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {selectedEvent?.registration_status !== 'OPEN' && !selectedEvent?.event_finished && (
                <button 
                  className="btn btn-success"
                  onClick={async () => {
                    try {
                      await axios.put(`/events/${selectedEvent._id}/registration-status`, { registration_status: 'OPEN' });
                      alert('Registration opened!');
                      setSelectedEvent({ ...selectedEvent, registration_status: 'OPEN' });
                      fetchMyEvents();
                    } catch (error) {
                      alert('Failed: ' + (error.response?.data?.message || error.message));
                    }
                  }}
                  style={{ flex: 1 }}
                >
                  Open Registration
                </button>
              )}
              {selectedEvent?.registration_status !== 'PAUSED' && !selectedEvent?.event_finished && (
                <button 
                  className="btn btn-danger"
                  onClick={async () => {
                    try {
                      await axios.put(`/events/${selectedEvent._id}/registration-status`, { registration_status: 'PAUSED' });
                      alert('Registration paused!');
                      setSelectedEvent({ ...selectedEvent, registration_status: 'PAUSED' });
                      fetchMyEvents();
                    } catch (error) {
                      alert('Failed: ' + (error.response?.data?.message || error.message));
                    }
                  }}
                  style={{ flex: 1 }}
                >
                  Pause Registration
                </button>
              )}
              {selectedEvent?.registration_status !== 'CLOSED' && !selectedEvent?.event_finished && (
                <button 
                  className="btn btn-danger"
                  onClick={async () => {
                    try {
                      await axios.put(`/events/${selectedEvent._id}/registration-status`, { registration_status: 'CLOSED' });
                      alert('Registration closed!');
                      setSelectedEvent({ ...selectedEvent, registration_status: 'CLOSED' });
                      fetchMyEvents();
                    } catch (error) {
                      alert('Failed: ' + (error.response?.data?.message || error.message));
                    }
                  }}
                  style={{ flex: 1 }}
                >
                  Close Registration
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedEvent?.status === 'PUBLISHED' && !selectedEvent?.event_finished && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <h3 className="card-title">Event Status</h3>
          <div className="card-content">
            <button 
              className="btn btn-danger"
              onClick={async () => {
                if (window.confirm('Mark this event as finished? This will close registration and free all resources.')) {
                  try {
                    await axios.put(`/events/${selectedEvent._id}/mark-finished`);
                    alert('Event marked as finished. All resources freed.');
                    setSelectedEvent({ ...selectedEvent, event_finished: true, finished_at: new Date(), registration_status: 'CLOSED' });
                    fetchMyEvents();
                  } catch (error) {
                    alert('Failed: ' + (error.response?.data?.message || error.message));
                  }
                }
              }}
              style={{ width: '100%' }}
            >
              Mark Event as Finished
            </button>
          </div>
        </div>
      )}

      {selectedEvent?.event_finished && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <h3 className="card-title">Event Status</h3>
          <div className="card-content">
            <p><strong>Status:</strong> <span style={{ color: '#4CAF50' }}>Event Finished</span></p>
            <p style={{ color: '#B8B6D8', fontSize: '0.9rem' }}>Finished at: {new Date(selectedEvent.finished_at).toLocaleString()}</p>
            <p style={{ color: '#B8B6D8', fontSize: '0.9rem' }}>All volunteers and venues have been freed.</p>
          </div>
        </div>
      )}
      
      {selectedEvent?.status === 'DRAFT' && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3 className="card-title">Actions</h3>
          <div className="card-content">
            <button 
              className="btn btn-success"
              onClick={() => handleSubmitForApproval(selectedEvent._id)}
              style={{ width: '48%', marginRight: '4%' }}
            >
              Submit for Approval
            </button>
            <button 
              className="btn btn-danger"
              onClick={() => handleDeleteEvent(selectedEvent._id)}
              style={{ width: '48%' }}
            >
              Delete Event
            </button>
          </div>
        </div>
      )}
      
      {selectedEvent?.status !== 'DRAFT' && selectedEvent?.status !== 'PUBLISHED' && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3 className="card-title">Actions</h3>
          <div className="card-content">
            <button 
              className="btn btn-danger"
              onClick={() => handleDeleteEvent(selectedEvent._id)}
              style={{ width: '100%' }}
            >
              Delete Event
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {activeView === 'overview' && renderOverview()}
      {activeView === 'create' && renderCreateEvent()}
      {activeView === 'events' && renderMyEvents()}
      {activeView === 'eventDetails' && renderEventDetails()}
      {activeView === 'participants' && selectedEvent && (
        <ParticipantsModal 
          event={selectedEvent} 
          onClose={() => {
            setActiveView('events');
            setSelectedEvent(null);
          }} 
        />
      )}
    </div>
  );
}