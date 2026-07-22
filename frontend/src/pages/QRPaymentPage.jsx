import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function QRPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    if (location.state?.paymentData) {
      setPaymentData(location.state.paymentData);
    } else {
      navigate('/participant-home');
    }
  }, [location.state, navigate]);

  if (!paymentData) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <Header showBackButton={true} backTo="/participant-home" showNavigation={false} />

      <div className="qr-payment-page" style={{ paddingTop: '140px', paddingBottom: '80px' }}>
        <div className="qr-card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'var(--accent-primary)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '15px'
            }}>
              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '20px' }}>N</span>
            </div>
            <div>
              <h3 style={{ margin: '0', fontSize: '22px', fontWeight: '700', color: 'var(--accent-primary)' }}>NIRAL Pay</h3>
              <p style={{ margin: '0', fontSize: '13px', color: 'var(--text-muted)' }}>Scan QR to Pay</p>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-surface-alt)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>Payment Summary</h4>
            <div style={{ marginBottom: '1.5rem' }}>
              <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                {paymentData.event.title}
              </h5>
              <p style={{ margin: '0', fontSize: '13px', color: 'var(--text-muted)' }}>
                Event Registration Fee
              </p>
            </div>
            <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Registration Fee</span>
                <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>&#8377;{paymentData.amount}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--border-default)',
                paddingTop: '0.75rem'
              }}>
                <span style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>Total Amount</span>
                <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--accent-primary)' }}>&#8377;{paymentData.amount}</span>
              </div>
            </div>
          </div>

          <div className="qr-code-wrapper" style={{ flexDirection: 'column', padding: '2rem' }}>
            <div style={{
              width: '220px',
              height: '220px',
              background: '#FFFFFF',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '180px',
                height: '180px',
                background: 'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 50% / 12px 12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: '#FFFFFF',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '10px', color: '#999', textAlign: 'center', lineHeight: '1.2' }}>QR CODE</span>
                </div>
              </div>
            </div>
            <p style={{ margin: '1rem 0 0 0', fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center' }}>
              Scan this QR code with any UPI app to pay
            </p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
              Google Pay, PhonePe, Paytm, BHIM, or any UPI app
            </p>
          </div>

          <div className="alert alert-info" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            After payment, upload the screenshot on the next page for verification.
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => navigate('/participant-home')}
              className="btn btn-outline"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                navigate('/payment-success', {
                  state: {
                    paymentId: 'QR_PENDING_' + Date.now(),
                    event: paymentData.event,
                    amount: paymentData.amount,
                    registrationId: paymentData.registrationId
                  }
                });
              }}
              className="btn btn-primary"
              style={{ flex: 2, fontSize: '16px', fontWeight: '700' }}
            >
              I Have Paid
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
