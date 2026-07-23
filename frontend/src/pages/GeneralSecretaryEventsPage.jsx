import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import GeneralSecretaryDashboard from '../dashboards/GeneralSecretaryDashboard';

export default function GeneralSecretaryEventsPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showAlumni, setShowAlumni] = useState(false);
  const [alumniMembers, setAlumniMembers] = useState([]);

  useEffect(() => {
    fetchEvents();
    fetchNotifications();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/events');
      const publishedEvents = response.data.filter(e => e.status === 'PUBLISHED');
      setEvents(publishedEvents);
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

  return (
    <div className="niral-home">
      <header className="niral-header">
        <div className="niral-nav-content">
          <div className="nav-left">
            <img src="/nirallogo.png" alt="NIRAL Logo" className="nav-logo" />
            <span style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: '600', marginLeft: '1rem' }}>
              Welcome, {user?.name} (General Secretary)
            </span>
          </div>
          
          <div className="nav-right">
            <div style={{ position: 'relative', marginRight: '1rem' }}>
              <button className="btn-back" onClick={() => setShowNotifications(!showNotifications)} style={{ position: 'relative' }}>
                🔔 Notifications
                {notifications.length > 0 && (
                  <span style={{
                    position: 'absolute', top: '-5px', right: '-5px', background: 'var(--accent-danger)',
                    color: 'white', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {notifications.length}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div style={{
                  position: 'absolute', top: '100%', right: '0', background: 'var(--bg-glass)',
                  border: '1px solid var(--border-soft)', borderRadius: '12px', padding: '1rem',
                  minWidth: '300px', maxHeight: '400px', overflowY: 'auto', backdropFilter: 'blur(16px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.4)', zIndex: 1000
                }}>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Notifications</h4>
                  {notifications.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No notifications</p>
                  ) : (
                    notifications.map((notif, index) => (
                      <div key={index} style={{
                        padding: '0.75rem', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.05)',
                        borderRadius: '8px', borderLeft: '3px solid var(--accent-gold)'
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
            
            <button className="btn-back" onClick={async () => {
              try {
                const res = await axios.get('/alumni');
                setAlumniMembers(res.data);
              } catch (e) { console.error('Failed to fetch alumni:', e); }
              setShowAlumni(true);
              setShowDashboard(false);
            }} style={{ marginRight: '1rem' }}>
              View Alumni
            </button>
            
            <button className="btn-back" onClick={() => { setShowDashboard(true); setShowAlumni(false); }} style={{ marginRight: '1rem' }}>
              📊 Dashboard
            </button>
            
            <button className="btn-back" onClick={logout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <div style={{ padding: '140px 60px 80px', background: 'var(--bg-main)', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {showAlumni ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '40px', fontWeight: '700', background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0' }}>
                  Alumni Members ({alumniMembers.length})
                </h1>
                <button className="btn-back" onClick={() => setShowAlumni(false)}>← Back to Events</button>
              </div>
              {alumniMembers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <p>No alumni members found.</p>
                </div>
              ) : (
                <div style={{ background: 'rgba(28, 26, 46, 0.85)', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'rgba(15, 14, 34, 0.8)' }}>
                      <tr>
                        {['Name', 'Contact', 'Email', 'Batch', 'Location', 'Organization', 'Position'].map(h => (
                          <th key={h} style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#B8B6D8' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {alumniMembers.map(m => (
                        <tr key={m._id}>
                          <td style={{ padding: '1rem', color: '#F5F7FF' }}>
                            <div style={{ fontWeight: '600' }}>{m.name}</div>
                            {m.linkedin && <a href={m.linkedin} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#00E5FF' }}>LinkedIn</a>}
                          </td>
                          <td style={{ padding: '1rem', color: '#F5F7FF' }}>{m.contact}</td>
                          <td style={{ padding: '1rem', color: '#F5F7FF', fontSize: '0.9rem' }}>{m.email}</td>
                          <td style={{ padding: '1rem', color: '#F5F7FF' }}>{m.batch}</td>
                          <td style={{ padding: '1rem', color: '#F5F7FF' }}>{m.location || '-'}</td>
                          <td style={{ padding: '1rem', color: '#F5F7FF' }}>{m.organization || '-'}</td>
                          <td style={{ padding: '1rem', color: '#F5F7FF' }}>{m.position || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : !showDashboard ? (
            <>
              <h1 style={{ 
                fontSize: '40px', fontWeight: '700', 
                background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)', 
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', 
                margin: '0' 
              }}>
                Published Events
              </h1>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                {events.filter(event => !event.event_finished).map(event => (
                  <div key={event._id} style={{ 
                    background: 'var(--bg-glass)', border: '1px solid var(--border-soft)', 
                    borderRadius: '18px', padding: '1.5rem', backdropFilter: 'blur(16px)', 
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ 
                          background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)', 
                          color: 'var(--bg-main)', padding: '0.4rem 0.8rem', borderRadius: '20px', 
                          fontSize: '0.75rem', fontWeight: '600' 
                        }}>
                          {event.type}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          {event.duration_hours}h
                        </span>
                      </div>
                      {event.hospitality?.venue_allocated && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                          📍 <strong>Venue:</strong> {event.hospitality.venue_details}
                        </div>
                      )}
                      {event.hr?.volunteers_allocated && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                          👥 <strong>Volunteers Allocated:</strong>
                          {event.hr.allocated_volunteers?.length > 0 && (
                            <div style={{ marginLeft: '1rem', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                              {event.hr.allocated_volunteers.map((vol, idx) => (
                                <div key={idx}>• {vol.volunteer_name} - {vol.volunteer_role}</div>
                              ))}
                            </div>
                          )}
                          {event.hr.allocated_judges?.length > 0 && (
                            <div style={{ marginLeft: '1rem', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                              <strong>Judges:</strong>
                              {event.hr.allocated_judges.map((judge, idx) => (
                                <div key={idx}>• {judge.judge_name} - {judge.judge_expertise}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                        💰 Prize Pool: ₹{event.prize_pool || 0}
                      </span>
                      <span style={{ 
                        background: 'var(--bg-secondary)', color: 'var(--text-primary)', 
                        padding: '8px 16px', borderRadius: '999px', fontSize: '0.85rem' 
                      }}>
                        Published
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {events.filter(e => !e.event_finished).length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <p>No active events at the moment.</p>
                </div>
              )}

              {events.filter(e => e.event_finished).length > 0 && (
                <>
                  <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '3rem', marginBottom: '1.5rem' }}>Past Events</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                    {events.filter(e => e.event_finished).map(event => (
                      <div key={event._id} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-soft)', borderRadius: '18px', padding: '1.5rem', backdropFilter: 'blur(16px)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', opacity: 0.75 }}>
                        {event.cover_photo && (
                          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                            <img src={`http://localhost:5000/${event.cover_photo}`} alt="Event Cover" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px' }} />
                          </div>
                        )}
                        <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{event.title}</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{new Date(event.date).toLocaleDateString()}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{event.time}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)', color: 'var(--bg-main)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>{event.type}</span>
                          <span style={{ background: 'linear-gradient(135deg, #6b7280, #4b5563)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>Event Finished</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ 
                  fontSize: '40px', fontWeight: '700', 
                  background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)', 
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0'
                }}>
                  General Secretary Dashboard
                </h1>
                <button className="btn-back" onClick={() => setShowDashboard(false)}>
                  ← Back to Events
                </button>
              </div>
              <GeneralSecretaryDashboard onBackToParent={() => setShowDashboard(false)} />
            </>
          )}
        </div>
      </div>

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
