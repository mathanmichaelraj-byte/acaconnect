import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

export default function PaymentModal({ event, onClose, onSuccess }) {
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async () => {
    if (event.registration_fee === 0) {
      // Handle free registration
      setProcessing(true);
      try {
        const regResponse = await axios.post(`/registrations/events/${event._id}/register`);
        alert('Successfully registered for free event!');
        onSuccess();
      } catch (error) {
        alert(error.response?.data?.message || 'Registration failed');
      } finally {
        setProcessing(false);
      }
    } else {
      // Handle paid registration - redirect to payment page
      try {
        const regResponse = await axios.post(`/registrations/events/${event._id}/register`);
        
        if (regResponse.data.requiresPayment) {
          // Close modal and redirect to payment page
          onClose();
          navigate('/payment', {
            state: {
              paymentData: {
                registrationId: regResponse.data.registration._id,
                event: event,
                amount: event.registration_fee
              }
            }
          });
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Registration failed');
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-soft)',
        borderRadius: '18px',
        padding: '2rem',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
        maxWidth: '500px',
        width: '90%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-primary)', margin: '0', fontSize: '24px', fontWeight: '600' }}>
            {event.registration_fee > 0 ? 'Payment Required' : 'Confirm Registration'}
          </h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: 'var(--text-primary)', fontSize: '18px', marginBottom: '1rem' }}>{event.title}</h4>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '0.5rem' }}>
            📅 {new Date(event.date).toLocaleDateString()} | 🕐 {event.time}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '1rem' }}>
            📍 Duration: {event.duration_hours} hours
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginTop: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: '600' }}>Registration Fee:</span>
              <span style={{ 
                color: event.registration_fee > 0 ? 'var(--accent-gold)' : '#4ade80', 
                fontSize: '28px', 
                fontWeight: '700' 
              }}>
                {event.registration_fee > 0 ? `₹${event.registration_fee}` : 'FREE'}
              </span>
            </div>
          </div>
        </div>



        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={onClose}
            disabled={processing}
            style={{
              flex: 1,
              padding: '12px',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-soft)',
              borderRadius: '8px',
              cursor: processing ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={processing}
            style={{
              flex: 1,
              padding: '12px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: processing ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              opacity: processing ? 0.6 : 1
            }}
          >
            {processing ? 'Processing...' : event.registration_fee > 0 ? 'Pay Now' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
}
