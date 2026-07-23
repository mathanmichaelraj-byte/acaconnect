import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

export default function TreasurerPaymentVerification() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReg, setSelectedReg] = useState(null);
  const [comments, setComments] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      const response = await axios.get('/registrations/pending-verifications');
      setRegistrations(response.data.registrations);
    } catch (error) {
      console.error('Failed to fetch pending verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (registrationId, approved) => {
    setProcessing(true);
    try {
      await axios.post(`/registrations/${registrationId}/verify`, {
        approved,
        comments
      });
      alert(approved ? 'Payment verified successfully!' : 'Payment rejected');
      setSelectedReg(null);
      setComments('');
      fetchPendingVerifications();
    } catch (error) {
      console.error('Verification error:', error);
      alert('Failed to verify payment');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-primary)' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Payment Verification</h1>
        <button className="btn-back" onClick={() => navigate('/events')}>
          ← Back
        </button>
      </div>

      {registrations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
            No Pending Verifications
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            All payments have been verified
          </p>
        </div>
      ) : (
        <div className="card-grid">
          {registrations.map((reg) => (
            <div key={reg._id} className="card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {reg.event_id?.title}
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <strong>Participant:</strong> {reg.participant_name}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <strong>Email:</strong> {reg.participant_email}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <strong>Amount:</strong> ₹{reg.registration_fee}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <strong>Payment ID:</strong> 
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                    {reg.payment_id}
                  </span>
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <strong>Payment Date:</strong> {new Date(reg.payment_date).toLocaleString()}
                </p>
              </div>

              {reg.payment_screenshot && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Payment Screenshot:
                  </p>
                  <img 
                    src={`http://localhost:5000/${reg.payment_screenshot}`}
                    alt="Payment Screenshot"
                    style={{ 
                      width: '100%', 
                      maxHeight: '300px', 
                      objectFit: 'contain', 
                      borderRadius: '8px',
                      background: '#000',
                      cursor: 'pointer'
                    }}
                    onClick={() => window.open(`http://localhost:5000/${reg.payment_screenshot}`, '_blank')}
                  />
                </div>
              )}

              {selectedReg === reg._id ? (
                <div>
                  <textarea
                    placeholder="Add comments (optional)"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      marginBottom: '1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-soft)',
                      background: 'var(--bg-main)',
                      color: 'var(--text-primary)',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn-success"
                      onClick={() => handleVerify(reg._id, true)}
                      disabled={processing}
                      style={{ flex: 1 }}
                    >
                      {processing ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleVerify(reg._id, false)}
                      disabled={processing}
                      style={{ flex: 1 }}
                    >
                      Reject
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setSelectedReg(null);
                        setComments('');
                      }}
                      disabled={processing}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="btn btn-success"
                  onClick={() => setSelectedReg(reg._id)}
                  style={{ 
                    width: '100%', 
                    padding: '12px 28px', 
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    borderRadius: '999px',
                    border: '1px solid #00E5FF',
                    background: 'transparent',
                    color: '#00E5FF',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Verify Payment
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
