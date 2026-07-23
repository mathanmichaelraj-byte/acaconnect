import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axios';

export default function HRDashboard({ onBackToParent }) {
  const { logout } = useContext(AuthContext);
  const [stats, setStats] = useState({ total: 0, pending: 0, allocated: 0 });
  const [events, setEvents] = useState([]);
  const [activeView, setActiveView] = useState('overview');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [volunteerForm, setVolunteerForm] = useState({
    allocated_volunteers: [],
    allocated_judges: []
  });
  const [volunteerPool, setVolunteerPool] = useState([]);
  const [newVolunteer, setNewVolunteer] = useState({ name: '', department: '', contact: '' });

  const handleBackToOverview = () => {
    setActiveView('overview');
    setSelectedEvent(null);
    setVolunteerForm({ allocated_volunteers: [], allocated_judges: [] });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchVolunteerPool = async () => {
    try {
      const response = await axios.get('/scheduling/volunteer-pool');
      setVolunteerPool(response.data.volunteers || []);
    } catch (error) {
      console.error('Failed to fetch volunteer pool:', error);
    }
  };

  const handleAddVolunteerToPool = async () => {
    if (!newVolunteer.name || !newVolunteer.department) {
      alert('Name and Department are required');
      return;
    }
    try {
      await axios.post('/scheduling/volunteer-pool', newVolunteer);
      setNewVolunteer({ name: '', department: '', contact: '' });
      fetchVolunteerPool();
    } catch (error) {
      alert('Failed to add volunteer: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleRemoveVolunteerFromPool = async (id) => {
    if (window.confirm('Remove this volunteer from the pool?')) {
      try {
        await axios.delete(`/scheduling/volunteer-pool/${id}`);
        fetchVolunteerPool();
      } catch (error) {
        alert('Failed to remove volunteer: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/hr/events');
      setEvents(response.data);
      
      const total = response.data.length;
      const pending = response.data.filter(e => !e.hr?.requirements_acknowledged).length;
      const allocated = response.data.filter(e => e.hr?.volunteers_allocated).length;
      
      setStats({ total, pending, allocated });
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const handleAcknowledgeRequirements = async (eventId) => {
    try {
      await axios.post(`/hr/acknowledge/${eventId}`);
      alert('Requirements acknowledged successfully!');
      fetchEvents();
    } catch (error) {
      alert('Failed to acknowledge requirements: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleAllocateVolunteers = (event) => {
    setSelectedEvent(event);
    setVolunteerForm({
      allocated_volunteers: event.hr?.allocated_volunteers || [],
      allocated_judges: event.hr?.allocated_judges || []
    });
    setActiveView('allocate');
  };

  const addVolunteer = () => {
    setVolunteerForm({
      ...volunteerForm,
      allocated_volunteers: [
        ...volunteerForm.allocated_volunteers,
        { volunteer_name: '', volunteer_contact: '', volunteer_role: '', volunteer_department: '' }
      ]
    });
  };

  const removeVolunteer = (index) => {
    setVolunteerForm({
      ...volunteerForm,
      allocated_volunteers: volunteerForm.allocated_volunteers.filter((_, i) => i !== index)
    });
  };

  const updateVolunteer = (index, field, value) => {
    const updated = [...volunteerForm.allocated_volunteers];
    updated[index][field] = value;
    setVolunteerForm({ ...volunteerForm, allocated_volunteers: updated });
  };

  const addJudge = () => {
    setVolunteerForm({
      ...volunteerForm,
      allocated_judges: [
        ...volunteerForm.allocated_judges,
        { judge_name: '', judge_contact: '', judge_expertise: '', judge_designation: '' }
      ]
    });
  };

  const removeJudge = (index) => {
    setVolunteerForm({
      ...volunteerForm,
      allocated_judges: volunteerForm.allocated_judges.filter((_, i) => i !== index)
    });
  };

  const updateJudge = (index, field, value) => {
    const updated = [...volunteerForm.allocated_judges];
    updated[index][field] = value;
    setVolunteerForm({ ...volunteerForm, allocated_judges: updated });
  };

  const handleSubmitAllocation = async () => {
    try {
      await axios.put(`/hr/allocate/${selectedEvent._id}`, volunteerForm);
      alert('Volunteers allocated successfully!');
      fetchEvents();
      setActiveView('overview');
    } catch (error) {
      alert('Failed to allocate volunteers: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleAutoAllocate = async (event) => {
    try {
      const res = await axios.post('/scheduling/auto-allocate-volunteers', { eventId: event._id });
      if (res.data.success) {
        // Submit the auto-allocated volunteers directly
        await axios.put(`/hr/allocate/${event._id}`, {
          allocated_volunteers: res.data.allocated_volunteers,
          allocated_judges: event.hr?.allocated_judges || []
        });
        alert(`Auto-allocated ${res.data.total_allocated}/${res.data.total_needed} volunteers (${res.data.total_available} available, ${res.data.busy_count} busy)`);
        fetchEvents();
      }
    } catch (error) {
      alert('Auto-allocation failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteAllocation = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this volunteer allocation?')) {
      try {
        await axios.delete(`/hr/allocate/${eventId}`);
        alert('Volunteer allocation deleted successfully!');
        fetchEvents();
      } catch (error) {
        alert('Failed to delete allocation: ' + (error.response?.data?.message || 'Unknown error'));
      }
    }
  };

  const renderOverview = () => (
    <div className="card-grid fade-in">
      <div className="card">
        <h3 className="card-title">HR Overview</h3>
        <div className="card-content">
          <p><strong>Total Events:</strong> {stats.total}</p>
          <p><strong>Pending Acknowledgment:</strong> {stats.pending}</p>
          <p><strong>Volunteers Allocated:</strong> {stats.allocated}</p>
        </div>
      </div>
      <div className="card">
        <h3 className="card-title">Actions</h3>
        <div className="card-content">
          <button 
            className="btn btn-primary"
            onClick={() => setActiveView('requirements')}
            style={{ margin: '0.25rem', width: '100%' }}
          >
            View Requirements
          </button>
          <button 
            className="btn btn-success"
            onClick={() => setActiveView('allocated')}
            style={{ margin: '0.25rem', width: '100%' }}
          >
            Allocated Volunteers
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => { setActiveView('pool'); fetchVolunteerPool(); }}
            style={{ margin: '0.25rem', width: '100%' }}
          >
            Volunteer List
          </button>
        </div>
      </div>
    </div>
  );

  const renderRequirements = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Volunteer Requirements</h3>
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
      
      <div className="events-grid">
        {events.filter(e => !e.hr?.volunteers_allocated).map(event => (
          <div key={event._id} className="card">
            <div className="card-header">
              <h4 className="card-title">{event.title}</h4>
              <div className="event-meta">
                <span className="event-type">{event.type}</span>
                <span className="event-date">{new Date(event.date).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="card-content">
              <p><strong>Expected Participants:</strong> {event.expected_participants}</p>
              <p><strong>Duration:</strong> {event.duration_hours} hours</p>
              <p><strong>Volunteers Needed:</strong> {event.requirements?.volunteers_needed || 0}</p>
              <p><strong>Judges Needed:</strong> {event.requirements?.judges_needed ? `Yes (${event.requirements?.judges_count || 1})` : 'No'}</p>
              
              <div style={{ marginTop: '1rem' }}>
                {!event.hr?.requirements_acknowledged ? (
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleAcknowledgeRequirements(event._id)}
                    style={{ width: '100%', marginBottom: '0.5rem' }}
                  >
                    Acknowledge Requirements
                  </button>
                ) : (
                  <div>
                    <p style={{ color: '#4CAF50', marginBottom: '0.5rem' }}>✓ Requirements Acknowledged</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleAutoAllocate(event)}
                      style={{ width: '100%', marginBottom: '0.5rem' }}
                    >
                      Auto-Allocate Volunteers
                    </button>
                    <button 
                      className="btn btn-success"
                      onClick={() => handleAllocateVolunteers(event)}
                      style={{ width: '100%' }}
                    >
                      Allocate Manually
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAllocate = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Allocate Volunteers - {selectedEvent?.title}</h3>
        <button 
          onClick={() => setActiveView('requirements')}
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
          ← Back to Requirements
        </button>
      </div>

      <div className="card">
        <h3 className="card-title">Volunteer Allocation</h3>
        <div className="card-content">
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4>Volunteers ({selectedEvent?.requirements?.volunteers_needed || 0} needed)</h4>
              <button className="btn btn-secondary" onClick={addVolunteer}>Add Volunteer</button>
            </div>
            
            {volunteerForm.allocated_volunteers.map((volunteer, index) => (
              <div key={index} style={{ 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '8px', 
                padding: '1rem', 
                marginBottom: '1rem',
                background: 'rgba(255,255,255,0.05)'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <input
                    type="text"
                    placeholder="Volunteer Name"
                    className="form-input"
                    value={volunteer.volunteer_name}
                    onChange={(e) => updateVolunteer(index, 'volunteer_name', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Contact Number"
                    className="form-input"
                    value={volunteer.volunteer_contact}
                    onChange={(e) => updateVolunteer(index, 'volunteer_contact', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Role/Responsibility"
                    className="form-input"
                    value={volunteer.volunteer_role}
                    onChange={(e) => updateVolunteer(index, 'volunteer_role', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Department"
                    className="form-input"
                    value={volunteer.volunteer_department}
                    onChange={(e) => updateVolunteer(index, 'volunteer_department', e.target.value)}
                  />
                </div>
                <button 
                  className="btn btn-danger"
                  onClick={() => removeVolunteer(index)}
                  style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {selectedEvent?.requirements?.judges_needed && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4>Judges ({selectedEvent?.requirements?.judges_count || 1} needed)</h4>
                <button className="btn btn-secondary" onClick={addJudge}>Add Judge</button>
              </div>
              
              {volunteerForm.allocated_judges.map((judge, index) => (
                <div key={index} style={{ 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '8px', 
                  padding: '1rem', 
                  marginBottom: '1rem',
                  background: 'rgba(255,255,255,0.05)'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <input
                      type="text"
                      placeholder="Judge Name"
                      className="form-input"
                      value={judge.judge_name}
                      onChange={(e) => updateJudge(index, 'judge_name', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Contact Number"
                      className="form-input"
                      value={judge.judge_contact}
                      onChange={(e) => updateJudge(index, 'judge_contact', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Expertise Area"
                      className="form-input"
                      value={judge.judge_expertise}
                      onChange={(e) => updateJudge(index, 'judge_expertise', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Designation"
                      className="form-input"
                      value={judge.judge_designation}
                      onChange={(e) => updateJudge(index, 'judge_designation', e.target.value)}
                    />
                  </div>
                  <button 
                    className="btn btn-danger"
                    onClick={() => removeJudge(index)}
                    style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button 
              className="btn btn-success"
              onClick={handleSubmitAllocation}
              style={{ flex: 1 }}
            >
              Submit Allocation
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setActiveView('requirements')}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAllocated = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Allocated Volunteers</h3>
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
      
      <div className="events-grid">
        {events.filter(e => e.hr?.volunteers_allocated).map(event => (
          <div key={event._id} className="card">
            <div className="card-header">
              <h4 className="card-title">{event.title}</h4>
              <div className="event-meta">
                <span className="event-type">{event.type}</span>
                <span className="event-date">{new Date(event.date).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="card-content">
              <p><strong>Status:</strong> <span style={{ color: '#4CAF50' }}>Volunteers Allocated</span></p>
              
              {event.hr.allocated_volunteers?.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h5>Volunteers:</h5>
                  {event.hr.allocated_volunteers.map((volunteer, idx) => (
                    <div key={idx} style={{ marginLeft: '1rem', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      • <strong>{volunteer.volunteer_name}</strong> - {volunteer.volunteer_role}
                      <br />  {volunteer.volunteer_department} | {volunteer.volunteer_contact}
                    </div>
                  ))}
                </div>
              )}
              
              {event.hr.allocated_judges?.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h5>Judges:</h5>
                  {event.hr.allocated_judges.map((judge, idx) => (
                    <div key={idx} style={{ marginLeft: '1rem', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      • <strong>{judge.judge_name}</strong> - {judge.judge_expertise}
                      <br />  {judge.judge_designation} | {judge.judge_contact}
                    </div>
                  ))}
                </div>
              )}
              
              <div style={{ marginTop: '1rem' }}>
                <button 
                  className="btn btn-warning"
                  onClick={() => handleAllocateVolunteers(event)}
                  style={{ marginRight: '0.5rem' }}
                >
                  Edit Allocation
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleDeleteAllocation(event._id)}
                >
                  Delete Allocation
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVolunteerPool = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Volunteer List ({volunteerPool.length})</h3>
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

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 className="card-title">Add New Volunteer</h3>
        <div className="card-content">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Name"
              className="form-input"
              value={newVolunteer.name}
              onChange={(e) => setNewVolunteer({ ...newVolunteer, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Department"
              className="form-input"
              value={newVolunteer.department}
              onChange={(e) => setNewVolunteer({ ...newVolunteer, department: e.target.value })}
            />
            <input
              type="text"
              placeholder="Contact"
              className="form-input"
              value={newVolunteer.contact}
              onChange={(e) => setNewVolunteer({ ...newVolunteer, contact: e.target.value })}
            />
          </div>
          <button className="btn btn-primary" onClick={handleAddVolunteerToPool}>
            Add Volunteer
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Available Volunteers</h3>
        <div className="card-content">
          {volunteerPool.length === 0 ? (
            <p style={{ color: '#B8B6D8' }}>No volunteers in pool. Add volunteers above.</p>
          ) : (
            <div className="table-container">
              <table className="table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#B8B6D8' }}>#</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#B8B6D8' }}>Name</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#B8B6D8' }}>Department</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#B8B6D8' }}>Contact</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#B8B6D8' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteerPool.map((v, idx) => (
                    <tr key={v._id}>
                      <td style={{ padding: '0.75rem', color: '#F5F7FF' }}>{idx + 1}</td>
                      <td style={{ padding: '0.75rem', color: '#F5F7FF' }}>{v.name}</td>
                      <td style={{ padding: '0.75rem', color: '#F5F7FF' }}>{v.department}</td>
                      <td style={{ padding: '0.75rem', color: '#F5F7FF' }}>{v.contact || '-'}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleRemoveVolunteerFromPool(v._id)}
                          style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {activeView === 'overview' && renderOverview()}
      {activeView === 'requirements' && renderRequirements()}
      {activeView === 'allocate' && renderAllocate()}
      {activeView === 'allocated' && renderAllocated()}
      {activeView === 'pool' && renderVolunteerPool()}
    </div>
  );
}