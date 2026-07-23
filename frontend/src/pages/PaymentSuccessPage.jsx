import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axios';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const paymentData = location.state;
  const [screenshot, setScreenshot] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  useEffect(() => {
    if (!paymentData) {
      navigate('/participant-home');
    }
  }, [paymentData, navigate]);

  const handleScreenshotUpload = async () => {
    if (!screenshot) {
      alert('Please select a screenshot to upload');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('payment_screenshot', screenshot);

      await axios.post(
        `/registrations/${paymentData.registrationId}/upload-screenshot`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setUploaded(true);
      alert('Screenshot uploaded successfully! Awaiting treasurer verification.');
    } catch (error) {
      console.error('Screenshot upload error:', error);
      alert('Failed to upload screenshot. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!paymentData) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top right, #2A0E3F, #12081E 60%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(19,10,46,0.85)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '18px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(16px)',
        padding: '3rem',
        maxWidth: '600px',
        width: '100%'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #F5B301, #FF8C00)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem auto',
          boxShadow: '0 0 25px rgba(245,179,1,0.35)'
        }}>
          <span style={{ color: '#0B061A', fontSize: '36px', fontWeight: 'bold' }}>✓</span>
        </div>

        <h2 style={{
          margin: '0 0 1rem 0',
          fontSize: '28px',
          fontWeight: '700',
          color: '#FFFFFF',
          textAlign: 'center'
        }}>
          Payment Successful!
        </h2>

        <p style={{
          margin: '0 0 2rem 0',
          fontSize: '16px',
          color: '#C9C6D6',
          textAlign: 'center'
        }}>
          Please upload payment screenshot for treasurer verification
        </p>

        <div style={{
          background: 'rgba(11,6,26,0.6)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h4 style={{
            margin: '0 0 1rem 0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#FFFFFF'
          }}>
            Payment Details
          </h4>
          
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '14px', color: '#C9C6D6' }}>Event: </span>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#FFFFFF' }}>{paymentData.event.title}</span>
          </div>
          
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '14px', color: '#C9C6D6' }}>Amount Paid: </span>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#FFFFFF' }}>₹{paymentData.amount}</span>
          </div>
          
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '14px', color: '#C9C6D6' }}>Payment ID: </span>
            <span style={{ fontSize: '12px', fontFamily: 'monospace', background: 'rgba(0,229,255,0.1)', padding: '4px 8px', borderRadius: '4px', color: '#00E5FF' }}>
              {paymentData.paymentId}
            </span>
          </div>
          
          <div>
            <span style={{ fontSize: '14px', color: '#C9C6D6' }}>Date: </span>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#FFFFFF' }}>
              {new Date().toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>

        {!uploaded && (
          <div style={{
            background: 'rgba(11,6,26,0.6)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h4 style={{
              margin: '0 0 1rem 0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#FFFFFF'
            }}>
              Upload Payment Screenshot
            </h4>
            
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setScreenshot(e.target.files[0])}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#0F0E22',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                color: '#F5F7FF',
                marginBottom: '1rem',
                cursor: 'pointer'
              }}
            />
            
            <button
              onClick={handleScreenshotUpload}
              disabled={uploading || !screenshot}
              style={{
                width: '100%',
                padding: '12px 28px',
                background: uploading || !screenshot ? 'rgba(245,179,1,0.6)' : 'linear-gradient(135deg, #F5B301, #FF8C00)',
                color: '#0B061A',
                border: 'none',
                borderRadius: '999px',
                cursor: uploading || !screenshot ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '700',
                transition: 'all 0.3s ease',
                boxShadow: uploading || !screenshot ? 'none' : '0 0 25px rgba(245,179,1,0.35)'
              }}
            >
              {uploading ? 'Uploading...' : 'Upload Screenshot'}
            </button>
          </div>
        )}

        {uploaded && (
          <div style={{
            background: 'rgba(0,229,255,0.1)',
            border: '1px solid rgba(0,229,255,0.2)',
            borderRadius: '8px',
            padding: '1rem',
            fontSize: '14px',
            color: '#00E5FF',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            ✓ Screenshot uploaded! Awaiting treasurer verification.
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => navigate('/my-registrations')}
            style={{
              flex: 1,
              padding: '12px 20px',
              background: 'transparent',
              color: '#00E5FF',
              border: '1px solid #00E5FF',
              borderRadius: '999px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            My Registrations
          </button>
          <button
            onClick={() => navigate('/participant-home')}
            style={{
              flex: 1,
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #F5B301, #FF8C00)',
              color: '#0B061A',
              border: 'none',
              borderRadius: '999px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '700',
              boxShadow: '0 0 25px rgba(245,179,1,0.35)'
            }}
          >
            Back to Events
          </button>
        </div>
      </div>
    </div>
  );
}
