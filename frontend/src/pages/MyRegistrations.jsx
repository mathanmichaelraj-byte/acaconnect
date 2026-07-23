import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { API_BASE_URL } from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
      const response = await axios.get('/registrations/my-registrations');
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
        return 'badge badge-success';
      case 'PENDING':
        return 'badge badge-warning';
      case 'FAILED':
        return 'badge badge-danger';
      default:
        return 'badge badge-secondary';
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
      <div>
        <Header showNavigation={true} />
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="loading">
            Loading your registrations...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header showNavigation={true} />

      <div className="page-container">
        <div className="container">
          <div className="page-header">
            <h1>My Registrations</h1>
            <p>Your registered events and their status</p>
          </div>

          {registrations.length === 0 ? (
            <div className="card" style={{ textAlign: 'center' }}>
              <div className="card-body" style={{ padding: '3rem' }}>
                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                  No Registrations Yet
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: '0' }}>
                  Complete your payments to see registered events here!
                </p>
              </div>
            </div>
          ) : (
            <div className="registrations-list">
              {registrations.map((reg) => (
                <div key={reg._id} className="registration-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  {reg.event_id.cover_photo && (
                    <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                      <img
                        src={`${API_BASE_URL}/${reg.event_id.cover_photo}`}
                        alt="Event Cover"
                        style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                      />
                    </div>
                  )}
                  <div className="registration-info">
                    <h3>{reg.event_id.title}</h3>
                    <p style={{ lineHeight: '1.5', flex: '1' }}>
                      {reg.event_id.description}
                    </p>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        {formatDate(reg.event_id.date)}
                      </span>
                      <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        {reg.event_id.time || 'TBA'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-info">
                        {reg.event_id.event_type}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {reg.event_id.duration_hours || 'TBA'}h
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                      Prize Pool: &#8377;{reg.event_id.prize_pool || 0}
                    </span>
                    <span className="badge badge-success">
                      REGISTERED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MyRegistrations;
