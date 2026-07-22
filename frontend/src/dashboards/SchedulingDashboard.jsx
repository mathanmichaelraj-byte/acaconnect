import { useState, useEffect } from 'react';
import axios from '../api/axios';

export default function SchedulingDashboard() {
  const [events, setEvents] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPublishedEvents();
  }, []);

  const fetchPublishedEvents = async () => {
    try {
      const res = await axios.get('/events');
      console.log('Events response:', res.data);
      
      // Handle different response formats
      const allEvents = res.data.events || res.data || [];
      const published = allEvents.filter(e => 
        e.status === 'PUBLISHED' || e.status === 'CHAIRPERSON_APPROVED'
      );
      
      console.log('Published events:', published.length);
      setEvents(published);
    } catch (error) {
      console.error('Error fetching events:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const generateSchedule = async () => {
    setLoading(true);
    try {
      const eventIds = events.map(e => e._id);
      const res = await axios.post('/scheduling/generate', { eventIds });
      setSchedule(res.data);
      alert(res.data.success ? 'Schedule generated successfully!' : 'Scheduling failed');
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || 'Failed to generate schedule'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Event Scheduling System</h2>
      
      <button 
        onClick={generateSchedule}
        disabled={loading || events.length === 0}
        className="btn btn-primary"
        style={{
          marginBottom: '2rem',
          cursor: loading || events.length === 0 ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Generating...' : `Auto-Generate Schedule (${events.length} events)`}
      </button>

      {schedule && (
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Schedule Results</h3>
          
          {/* Successfully Scheduled */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ color: '#4ade80', marginBottom: '1rem' }}>
              Successfully Scheduled ({schedule.schedule.filter(s => s.venue).length})
            </h4>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {schedule.schedule.filter(s => s.venue).map((assignment, idx) => (
                <div key={idx} className="card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '16px' }}>{assignment.event.title}</strong>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '14px' }}>
                        {assignment.event.expected_participants} participants
                        {assignment.event.prize_pool > 0 && ` | Rs. ${assignment.event.prize_pool}`}
                      </div>
                      <div style={{ color: '#4ade80', marginTop: '0.5rem', fontSize: '14px' }}>
                        {assignment.venueName} ({assignment.utilization}% utilized)
                      </div>
                    </div>
                    <span style={{
                      background: assignment.priority >= 8 ? '#4ade80' : assignment.priority >= 5 ? '#F5B301' : '#ff5a5a',
                      color: '#0B061A',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '12px'
                    }}>
                      Priority: {assignment.priority.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Failed Assignments */}
          {schedule.schedule.filter(s => !s.venue).length > 0 && (
            <div>
              <h4 style={{ color: '#ff5a5a', marginBottom: '1rem' }}>
                Could Not Schedule ({schedule.schedule.filter(s => !s.venue).length})
              </h4>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {schedule.schedule.filter(s => !s.venue).map((assignment, idx) => (
                  <div key={idx} className="card" style={{ padding: '1rem', border: '1px solid #ff5a5a' }}>
                    <strong>{assignment.event.title}</strong>
                    <div style={{ color: '#ff5a5a', marginTop: '0.5rem', fontSize: '14px' }}>
                      {assignment.error}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {schedule.validation && !schedule.validation.valid && (
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ color: '#ff5a5a', marginBottom: '1rem' }}>Validation Errors</h4>
              {schedule.validation.errors.map((error, idx) => (
                <div key={idx} className="card" style={{
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  fontSize: '14px'
                }}>
                  <strong>{error.event}:</strong> {error.error}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {events.length === 0 && (
        <div className="card" style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          color: 'var(--text-secondary)'
        }}>
          <p>No published events found. Events must be published before scheduling.</p>
        </div>
      )}
    </div>
  );
}
