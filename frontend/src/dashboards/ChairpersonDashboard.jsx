import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axios';
import ParticipantsModal from '../components/ParticipantsModal';

export default function ChairpersonDashboard() {
  const [stats, setStats] = useState({ pendingApproval: 0, published: 0, rejected: 0 });
  const [events, setEvents] = useState([]);
  const [activeView, setActiveView] = useState('overview');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [previousView, setPreviousView] = useState('overview');
  const [workflowView, setWorkflowView] = useState(null);
  const [workflowStats, setWorkflowStats] = useState({});
  const [selectedEventForParticipants, setSelectedEventForParticipants] = useState(null);

  const handleBackToOverview = () => {
    setActiveView('overview');
    setSelectedEvent(null);
    setEditingEvent(null);
    setPreviousView('overview');
    setWorkflowView(null);
  };

  const handleViewEvent = (event) => {
    setPreviousView(activeView);
    setSelectedEvent(event);
    setActiveView('view');
  };

  const handleEditEvent = (event) => {
    setPreviousView(activeView);
    setEditingEvent({...event});
    setActiveView('edit');
  };

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const fetchPendingEvents = async () => {
    try {
      const response = await axios.get('/events');
      const allEvents = response.data;
      setEvents(allEvents);
      
      const pending = allEvents.filter(e => e.status === 'GENSEC_APPROVED').length;
      const published = allEvents.filter(e => e.status === 'PUBLISHED').length;
      const rejected = allEvents.filter(e => e.status === 'REJECTED').length;
      
      setStats({ pendingApproval: pending, published, rejected });
      
      // Calculate workflow statistics
      const workflow = {
        draft: allEvents.filter(e => e.status === 'DRAFT').length,
        submitted: allEvents.filter(e => e.status === 'SUBMITTED').length,
        underReview: allEvents.filter(e => e.status === 'UNDER_REVIEW').length,
        treasurerPending: allEvents.filter(e => e.status === 'UNDER_REVIEW').length,
        treasurerApproved: allEvents.filter(e => e.status === 'TREASURER_APPROVED').length,
        genSecPending: allEvents.filter(e => e.status === 'TREASURER_APPROVED').length,
        genSecApproved: allEvents.filter(e => e.status === 'GENSEC_APPROVED').length,
        chairpersonPending: allEvents.filter(e => e.status === 'GENSEC_APPROVED').length,
        published: published,
        rejected: rejected
      };
      setWorkflowStats(workflow);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this published event? This action cannot be undone.')) {
      try {
        await axios.delete(`/events/${eventId}`);
        alert('Event deleted successfully!');
        fetchPendingEvents();
      } catch (error) {
        alert('Failed to delete event: ' + (error.response?.data?.message || 'Unknown error'));
      }
    }
  };

  const handleApproval = async (eventId, action) => {
    try {
      const requestBody = {
        approved: action === 'approve',
        comments: action === 'reject' ? 'Rejected by Chairperson' : 'Approved and published by Chairperson'
      };
      
      console.log('Sending approval request:', requestBody);
      const response = await axios.put(`/events/${eventId}/chairperson-approve`, requestBody);
      console.log('Approval response:', response.data);
      
      alert(`Event ${action === 'approve' ? 'published' : 'rejected'} successfully!`);
      await fetchPendingEvents(); // Ensure data refresh
      setActiveView('overview');
      setSelectedEvent(null);
      setEditingEvent(null);
    } catch (error) {
      console.error('Approval error:', error);
      alert(`Failed to ${action}: ` + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleSaveEdit = async () => {
    try {
      const requestBody = {
        approved: true,
        comments: 'Updated and published by Chairperson',
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
      
      await axios.put(`/events/${editingEvent._id}/chairperson-approve`, requestBody);
      alert('Event updated and published successfully!');
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
        <h3 className="card-title">Chairperson Review</h3>
        <div className="card-content">
          <p><strong>Pending Final Approval:</strong> {stats.pendingApproval}</p>
          <p><strong>Published Events:</strong> {stats.published}</p>
          <p><strong>Rejected:</strong> {stats.rejected}</p>
        </div>
      </div>
      <div className="card">
        <h3 className="card-title">Actions</h3>
        <div className="card-content">
          <button className="btn btn-primary" onClick={() => setActiveView('pending')} style={{ margin: '0.25rem', width: '100%' }}>
            Review Pending Events
          </button>
          <button className="btn btn-success" onClick={() => setActiveView('approved')} style={{ margin: '0.25rem', width: '100%' }}>
            View Published Events
          </button>
          <button className="btn btn-success" onClick={() => setActiveView('workflow')} style={{ margin: '0.25rem', width: '100%' }}>
            Workflow Status Overview
          </button>
        </div>
      </div>
    </div>
  );

  const renderPending = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Pending Final Approvals</h3>
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
              <th>Event</th>
              <th>Type</th>
              <th>Date</th>
              <th>Participants</th>
              <th>Prize Pool</th>
              <th>Total Budget</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.filter(e => e.status === 'GENSEC_APPROVED').map(event => (
              <tr key={event._id}>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.title}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.type}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>{new Date(event.date).toLocaleDateString()}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.expected_participants}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>₹{event.prize_pool || 0}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>₹{event.registration_fee || 0}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>₹{event.total_budget || 'Not set'}</td>
                <td style={{ padding: '1rem' }}><span className="status-badge status-pending">PENDING FINAL APPROVAL</span></td>
                <td style={{ padding: '1rem' }}>
                  <button className="btn btn-info" onClick={() => handleViewEvent(event)} style={{ margin: '0.25rem' }}>
                    View
                  </button>
                  <button className="btn btn-warning" onClick={() => handleEditEvent(event)} style={{ margin: '0.25rem' }}>
                    Edit
                  </button>
                  <button className="btn btn-success" onClick={() => handleApproval(event._id, 'approve')} style={{ margin: '0.25rem' }}>
                    Publish
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

  const renderPublished = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Published Events</h3>
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
              <th>Event</th>
              <th>Type</th>
              <th>Date</th>
              <th>Participants</th>
              <th>Prize Pool</th>
              <th>Total Budget</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.filter(e => e.status === 'PUBLISHED').map(event => (
              <tr key={event._id}>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.title}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.type}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>{new Date(event.date).toLocaleDateString()}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.expected_participants}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>₹{event.prize_pool || 0}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>₹{event.registration_fee || 0}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>₹{event.total_budget || 'Not set'}</td>
                <td style={{ padding: '1rem' }}><span className="status-badge status-published">PUBLISHED</span></td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-info" onClick={() => handleViewEvent(event)} style={{ margin: '0' }}>
                      View Details
                    </button>
                    <button className="btn btn-secondary" onClick={() => setSelectedEventForParticipants(event)} style={{ margin: '0' }}>
                      👥 Participants
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleDeleteEvent(event._id)}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', margin: '0' }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderApproved = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Published Events</h3>
        <button onClick={handleBackToOverview} style={{ background: 'none', border: 'none', color: '#00E5FF', fontSize: '0.85rem', cursor: 'pointer', padding: '0.25rem 0', pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>
          ← Back to Overview
        </button>
      </div>
      <div className="table-container" style={{ background: 'rgba(28, 26, 46, 0.85)', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse', background: 'transparent' }}>
          <thead style={{ background: 'rgba(15, 14, 34, 0.8)' }}>
            <tr>
              <th>Event</th><th>Type</th><th>Date</th><th>Participants</th><th>Prize Pool</th><th>Total Budget</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.filter(e => e.status === 'PUBLISHED').map(event => (
              <tr key={event._id}>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.title}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.type}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>{new Date(event.date).toLocaleDateString()}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.expected_participants}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>₹{event.prize_pool || 0}</td>
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>₹{event.total_budget || 'Not set'}</td>
                <td style={{ padding: '1rem' }}><span className="status-badge status-published">PUBLISHED</span></td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-info" onClick={() => handleViewEvent(event)} style={{ margin: '0' }}>
                      View Details
                    </button>
                    <button className="btn btn-secondary" onClick={() => setSelectedEventForParticipants(event)} style={{ margin: '0' }}>
                      👥 Participants
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDeleteEvent(event._id)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', margin: '0' }}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderWorkflowStatus = () => {
    if (workflowView) {
      const getEventsForView = () => {
        switch(workflowView) {
          case 'eventteam-draft': return events.filter(e => e.status === 'DRAFT');
          case 'eventteam-submitted': return events.filter(e => e.status === 'SUBMITTED');
          case 'treasurer-pending': return events.filter(e => e.status === 'UNDER_REVIEW');
          case 'treasurer-approved': return events.filter(e => e.status === 'TREASURER_APPROVED');
          case 'gensec-pending': return events.filter(e => e.status === 'TREASURER_APPROVED');
          case 'gensec-approved': return events.filter(e => e.status === 'GENSEC_APPROVED');
          case 'chairperson-pending': return events.filter(e => e.status === 'GENSEC_APPROVED');
          case 'chairperson-published': return events.filter(e => e.status === 'PUBLISHED');
          case 'chairperson-rejected': return events.filter(e => e.status === 'REJECTED');
          default: return [];
        }
      };
      
      return (
        <div className="fade-in">
          <div className="nav-header">
            <h3 className="nav-title">{workflowView.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Events</h3>
            <button onClick={() => setWorkflowView(null)} style={{ background: 'none', border: 'none', color: '#00E5FF', fontSize: '0.85rem', cursor: 'pointer', padding: '0.25rem 0', pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>
              ← Back to Workflow Overview
            </button>
          </div>
          <div className="table-container" style={{ background: 'rgba(28, 26, 46, 0.85)', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', background: 'transparent' }}>
              <thead style={{ background: 'rgba(15, 14, 34, 0.8)' }}>
                <tr><th>Event</th><th>Type</th><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {getEventsForView().map(event => (
                  <tr key={event._id}>
                    <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.title}</td>
                    <td style={{ padding: '1rem', color: '#F5F7FF' }}>{event.type}</td>
                    <td style={{ padding: '1rem', color: '#F5F7FF' }}>{new Date(event.date).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}><span className="status-badge">{event.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    
    return (
      <div className="fade-in">
        <div className="nav-header">
          <h3 className="nav-title">Workflow Status Overview</h3>
          <button onClick={handleBackToOverview} style={{ background: 'none', border: 'none', color: '#00E5FF', fontSize: '0.85rem', cursor: 'pointer', padding: '0.25rem 0', pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>
            ← Back to Overview
          </button>
        </div>
        <div className="card-grid">
          <div className="card">
            <h3 className="card-title">Event Team Status</h3>
            <div className="card-content">
              <p style={{ cursor: 'pointer', color: '#00E5FF' }} onClick={() => setWorkflowView('eventteam-draft')}><strong>Draft Events:</strong> {workflowStats.draft || 0}</p>
              <p style={{ cursor: 'pointer', color: '#00E5FF' }} onClick={() => setWorkflowView('eventteam-submitted')}><strong>Submitted Events:</strong> {workflowStats.submitted || 0}</p>
            </div>
          </div>
          <div className="card">
            <h3 className="card-title">Treasurer Status</h3>
            <div className="card-content">
              <p style={{ cursor: 'pointer', color: '#00E5FF' }} onClick={() => setWorkflowView('treasurer-pending')}><strong>Pending Review:</strong> {workflowStats.treasurerPending || 0}</p>
              <p style={{ cursor: 'pointer', color: '#00E5FF' }} onClick={() => setWorkflowView('treasurer-approved')}><strong>Approved by Treasurer:</strong> {workflowStats.treasurerApproved || 0}</p>
            </div>
          </div>
          <div className="card">
            <h3 className="card-title">General Secretary Status</h3>
            <div className="card-content">
              <p style={{ cursor: 'pointer', color: '#00E5FF' }} onClick={() => setWorkflowView('gensec-pending')}><strong>Pending Review:</strong> {workflowStats.genSecPending || 0}</p>
              <p style={{ cursor: 'pointer', color: '#00E5FF' }} onClick={() => setWorkflowView('gensec-approved')}><strong>Approved by Gen Sec:</strong> {workflowStats.genSecApproved || 0}</p>
            </div>
          </div>
          <div className="card">
            <h3 className="card-title">Chairperson Status</h3>
            <div className="card-content">
              <p style={{ cursor: 'pointer', color: '#00E5FF' }} onClick={() => setWorkflowView('chairperson-pending')}><strong>Pending Final Approval:</strong> {workflowStats.chairpersonPending || 0}</p>
              <p style={{ cursor: 'pointer', color: '#00E5FF' }} onClick={() => setWorkflowView('chairperson-published')}><strong>Published Events:</strong> {workflowStats.published || 0}</p>
              <p style={{ cursor: 'pointer', color: '#00E5FF' }} onClick={() => setWorkflowView('chairperson-rejected')}><strong>Rejected Events:</strong> {workflowStats.rejected || 0}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderViewEvent = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Event Details</h3>
        <button onClick={() => setActiveView(previousView)} style={{ background: 'none', border: 'none', color: '#00E5FF', fontSize: '0.85rem', cursor: 'pointer', padding: '0.25rem 0', pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>
          ← Back to {previousView === 'pending' ? 'Pending' : 'Published'}
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
          <div className="card-grid">
            <div className="card">
              <h3 className="card-title">Event Information</h3>
              <div className="card-content">
                <p><strong>Event Name:</strong> {selectedEvent.title}</p>
                <p><strong>Type:</strong> {selectedEvent.type}</p>
                <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {selectedEvent.time}</p>
                <p><strong>Duration:</strong> {selectedEvent.duration_hours} hours</p>
                <p><strong>Expected Participants:</strong> {selectedEvent.expected_participants}</p>
                <p><strong>Description:</strong> {selectedEvent.description}</p>
              </div>
            </div>
            
            <div className="card">
              <h3 className="card-title">Budget Details</h3>
              <div className="card-content">
                <p><strong>Prize Pool:</strong> ₹{selectedEvent.prize_pool || 0}</p>
                <p><strong>Registration Fee:</strong> ₹{selectedEvent.registration_fee || 0}</p>
                <p><strong>Total Budget:</strong> ₹{selectedEvent.total_budget || 'Not set'}</p>
                <p><strong>Status:</strong> <span className={`status-badge ${
                  selectedEvent.status === 'PUBLISHED' ? 'status-published' : 
                  selectedEvent.status === 'GENSEC_APPROVED' ? 'status-pending' : 'status-approved'
                }`}>{selectedEvent.status.replace(/_/g, ' ')}</span></p>
              </div>
            </div>
            
            <div className="card">
              <h3 className="card-title">Requirements</h3>
              <div className="card-content">
                <p><strong>Volunteers:</strong> {selectedEvent?.requirements?.volunteers_needed || 0}</p>
                
                <div style={{ marginTop: '1rem' }}>
                  <p><strong>Refreshments:</strong> {selectedEvent?.requirements?.refreshments_needed ? 'Yes' : 'No'}</p>
                  {selectedEvent?.requirements?.refreshments_needed && selectedEvent?.requirements?.refreshment_items?.length > 0 && (
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
                
                <div style={{ marginTop: '1rem' }}>
                  <p><strong>Stationery:</strong> {selectedEvent?.requirements?.stationary_needed ? 'Yes' : 'No'}</p>
                  {selectedEvent?.requirements?.stationary_needed && selectedEvent?.requirements?.stationary_items?.length > 0 && (
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
                
                <div style={{ marginTop: '1rem' }}>
                  <p><strong>Technical Equipment:</strong> {selectedEvent?.requirements?.technical_needed ? 'Yes' : 'No'}</p>
                  {selectedEvent?.requirements?.technical_needed && selectedEvent?.requirements?.technical_items?.length > 0 && (
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
                
                <div style={{ marginTop: '1rem' }}>
                  <p><strong>Goodies:</strong> {selectedEvent?.requirements?.goodies_needed ? 'Yes' : 'No'}</p>
                  <p><strong>Physical Certificates:</strong> {selectedEvent?.requirements?.physical_certificate ? 'Yes' : 'No'}</p>
                  <p><strong>Trophies:</strong> {selectedEvent?.requirements?.trophies_needed ? 'Yes' : 'No'}</p>
                </div>
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
          {previousView === 'approved' && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-danger" onClick={() => handleDeleteEvent(selectedEvent._id)}>
                Delete Event
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
        <button onClick={() => setActiveView(previousView)} style={{ background: 'none', border: 'none', color: '#00E5FF', fontSize: '0.85rem', cursor: 'pointer', padding: '0.25rem 0', pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>
          ← Back to {previousView === 'pending' ? 'Pending' : 'Published'}
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
              <input type="text" value={editingEvent.title} onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})} className="form-input" />
            </div>
            <div>
              <label style={{ color: '#F5F7FF', display: 'block', marginBottom: '0.5rem' }}>Type:</label>
              <select value={editingEvent.type} onChange={(e) => setEditingEvent({...editingEvent, type: e.target.value})} className="form-input">
                <option value="Technical">Technical</option>
                <option value="Non-Technical">Non-Technical</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Seminar">Seminar</option>
                <option value="Workshop">Workshop</option>
              </select>
            </div>
            <div>
              <label style={{ color: '#F5F7FF', display: 'block', marginBottom: '0.5rem' }}>Date:</label>
              <input type="date" value={editingEvent.date?.split('T')[0]} onChange={(e) => setEditingEvent({...editingEvent, date: e.target.value})} className="form-input" />
            </div>
            <div>
              <label style={{ color: '#F5F7FF', display: 'block', marginBottom: '0.5rem' }}>Time:</label>
              <input type="time" value={editingEvent.time} onChange={(e) => setEditingEvent({...editingEvent, time: e.target.value})} className="form-input" />
            </div>
            <div>
              <label style={{ color: '#F5F7FF', display: 'block', marginBottom: '0.5rem' }}>Duration (hours):</label>
              <input type="number" value={editingEvent.duration_hours} onChange={(e) => setEditingEvent({...editingEvent, duration_hours: parseInt(e.target.value)})} className="form-input" />
            </div>
            <div>
              <label style={{ color: '#F5F7FF', display: 'block', marginBottom: '0.5rem' }}>Expected Participants:</label>
              <input type="number" value={editingEvent.expected_participants} onChange={(e) => setEditingEvent({...editingEvent, expected_participants: parseInt(e.target.value)})} className="form-input" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: '#F5F7FF', display: 'block', marginBottom: '0.5rem' }}>Description:</label>
              <textarea value={editingEvent.description} onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})} className="form-input" rows="3" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: '#F5F7FF', display: 'block', marginBottom: '0.5rem' }}>Volunteers Needed:</label>
              <input type="number" value={editingEvent.volunteers_needed} onChange={(e) => setEditingEvent({...editingEvent, volunteers_needed: parseInt(e.target.value)})} className="form-input" />
            </div>
            <div>
              <label style={{ color: '#F5F7FF', display: 'block', marginBottom: '0.5rem' }}>Refreshments:</label>
              <input type="number" value={editingEvent.refreshments_needed} onChange={(e) => setEditingEvent({...editingEvent, refreshments_needed: parseInt(e.target.value)})} className="form-input" />
            </div>
            <div>
              <label style={{ color: '#F5F7FF', display: 'block', marginBottom: '0.5rem' }}>Stationary:</label>
              <input type="number" value={editingEvent.stationary_needed} onChange={(e) => setEditingEvent({...editingEvent, stationary_needed: parseInt(e.target.value)})} className="form-input" />
            </div>
            <div>
              <label style={{ color: '#F5F7FF', display: 'block', marginBottom: '0.5rem' }}>Goodies:</label>
              <input type="number" value={editingEvent.goodies_needed} onChange={(e) => setEditingEvent({...editingEvent, goodies_needed: parseInt(e.target.value)})} className="form-input" />
            </div>
            <div>
              <label style={{ color: '#F5F7FF', display: 'block', marginBottom: '0.5rem' }}>Certificates:</label>
              <input type="number" value={editingEvent.certificates_needed} onChange={(e) => setEditingEvent({...editingEvent, certificates_needed: parseInt(e.target.value)})} className="form-input" />
            </div>
            <div>
              <label style={{ color: '#F5F7FF', display: 'block', marginBottom: '0.5rem' }}>Trophies:</label>
              <input type="number" value={editingEvent.trophies_needed} onChange={(e) => setEditingEvent({...editingEvent, trophies_needed: parseInt(e.target.value)})} className="form-input" />
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={handleSaveEdit}>
              Save & Publish
            </button>
            <button className="btn btn-danger" onClick={() => handleApproval(editingEvent._id, 'reject')}>
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {activeView === 'overview' && renderOverview()}
      {activeView === 'pending' && renderPending()}
      {activeView === 'approved' && renderApproved()}
      {activeView === 'workflow' && renderWorkflowStatus()}
      {activeView === 'view' && renderViewEvent()}
      {activeView === 'edit' && renderEditEvent()}
      
      {selectedEventForParticipants && (
        <ParticipantsModal
          event={selectedEventForParticipants}
          onClose={() => setSelectedEventForParticipants(null)}
        />
      )}
    </div>
  );
}