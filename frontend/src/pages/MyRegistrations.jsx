import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const MyRegistrations = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/registrations/my-registrations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('All registrations:', response.data.registrations);
      // Filter to only show completed payments
      const completedRegistrations = response.data.registrations.filter(
        reg => reg.payment_status === 'COMPLETED'
      );
      console.log('Completed registrations:', completedRegistrations);
      setRegistrations(completedRegistrations);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED': 
        return 'status-badge' + ' ' + 'status-published';
      case 'PENDING': 
        return 'status-badge' + ' ' + 'status-pending';
      case 'FAILED': 
        return 'status-badge' + ' ' + 'status-rejected';
      default: 
        return 'status-badge' + ' ' + 'status-created';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="niral-home">
        <div style={{ 
          padding: '140px 60px 80px', 
          background: 'var(--bg-main)', 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ 
            color: 'var(--text-primary)', 
            fontSize: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '1rem', fontSize: '3rem' }}>⏳</div>
            Loading your registrations...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="niral-home">
      {/* Header Navigation */}
      <header className="niral-header">
        <div className="niral-nav-content">
          <div className="nav-left">
            <img src="/nirallogo.png" alt="NIRAL Logo" className="nav-logo" />
            <span style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: '600', marginLeft: '1rem' }}>
              Welcome, {user?.name}
            </span>
          </div>
          
          <nav className="nav-center">
            <a href="#" className="nav-link" onClick={() => navigate('/participant-home')}>Home</a>
            <a href="#" className="nav-link" onClick={() => navigate('/participant-home')}>Events</a>
            <a href="#" className="nav-link active">My Registrations</a>
            <a href="#" className="nav-link" onClick={() => navigate('/participant-home')}>About</a>
            <a href="#" className="nav-link" onClick={() => navigate('/participant-home')}>Contact</a>
          </nav>
          
          <div className="nav-right">
            <button className="btn-back" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div style={{ padding: '140px 60px 80px', background: 'var(--bg-main)', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '40px', 
            fontWeight: '700', 
            background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            marginBottom: '2rem', 
            textAlign: 'center',
            letterSpacing: '1.5px'
          }}>
            My Registrations
          </h1>

          {registrations.length === 0 ? (
            <div style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-soft)',
              borderRadius: '18px',
              padding: '3rem',
              textAlign: 'center',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
              <h3 style={{ 
                color: 'var(--text-primary)', 
                fontSize: '1.5rem', 
                marginBottom: '0.5rem',
                fontWeight: '600'
              }}>
                No Registrations Yet
              </h3>
              <p style={{ 
                color: 'var(--text-muted)', 
                fontSize: '1.1rem',
                margin: '0'
              }}>
                Complete your payments to see registered events here!
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
              {registrations.map((reg) => (
                <div key={reg._id} style={{
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border-soft)',
                  borderRadius: '18px',
                  padding: '1.5rem',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}>
                  {reg.event_id.cover_photo && (
                    <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                      <img 
                        src={`http://localhost:5000/${reg.event_id.cover_photo}`} 
                        alt="Event Cover" 
                        style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px' }}
                      />
                    </div>
                  )}
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    {reg.event_id.title}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem', lineHeight: '1.5', flex: '1' }}>
                    {reg.event_id.description}
                  </p>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        📅 {formatDate(reg.event_id.date)}
                      </span>
                      <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        🕐 {reg.event_id.time || 'TBA'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ 
                        background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)', 
                        color: 'var(--bg-main)', 
                        padding: '0.4rem 0.8rem', 
                        borderRadius: '20px', 
                        fontSize: '0.75rem', 
                        fontWeight: '600' 
                      }}>
                        {reg.event_id.event_type}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {reg.event_id.duration_hours || 'TBA'}h
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                      💰 Prize Pool: ₹{reg.event_id.prize_pool || 0}
                    </span>
                    <span style={{
                      background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                      color: 'white',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      REGISTERED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyRegistrations;
