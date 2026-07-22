import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <Header showBackButton={true} backTo="/participant-home" showNavigation={false} />

      <div className="payment-success-page" style={{ paddingTop: '140px', paddingBottom: '80px' }}>
        <div className="success-card">
          <div className="success-icon">
            <span style={{ fontSize: '36px', fontWeight: 'bold' }}>&#10003;</span>
          </div>

          <h2 style={{ margin: '0 0 1rem 0', fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', textAlign: 'center' }}>
            Payment Successful!
          </h2>

          <p style={{ margin: '0 0 2rem 0', fontSize: '16px', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Please upload payment screenshot for treasurer verification
          </p>

          <div style={{
            background: 'var(--bg-surface-alt)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Payment Details
            </h4>

            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Event: </span>
              <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{paymentData.event.title}</span>
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Amount Paid: </span>
              <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>&#8377;{paymentData.amount}</span>
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Payment ID: </span>
              <span style={{ fontSize: '12px', fontFamily: 'monospace', background: 'var(--accent-primary-light)', padding: '4px 8px', borderRadius: '4px', color: 'var(--accent-primary)' }}>
                {paymentData.paymentId}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Date: </span>
              <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
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
              background: 'var(--bg-surface-alt)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              marginBottom: '2rem',
              textAlign: 'left'
            }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Upload Payment Screenshot
              </h4>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setScreenshot(e.target.files[0])}
                className="form-input"
                style={{ marginBottom: '1rem' }}
              />

              <button
                onClick={handleScreenshotUpload}
                disabled={uploading || !screenshot}
                className={`btn btn-primary btn-block`}
              >
                {uploading ? 'Uploading...' : 'Upload Screenshot'}
              </button>
            </div>
          )}

          {uploaded && (
            <div className="alert alert-success" style={{ marginBottom: '2rem', textAlign: 'center' }}>
              Screenshot uploaded! Awaiting treasurer verification.
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => navigate('/my-registrations')}
              className="btn btn-outline"
              style={{ flex: 1 }}
            >
              My Registrations
            </button>
            <button
              onClick={() => navigate('/participant-home')}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
