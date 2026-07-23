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
    return <div>Loading...</div>;
  }

  return (
    <div className="niral-home">
      <Header showBackButton={true} backTo="/participant-home" showNavigation={false} />

      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top right, #2A0E3F, #12081E 60%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '140px 20px 80px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="1" fill="%23EC4899" opacity="0.1"/><circle cx="80" cy="60" r="1" fill="%2300E5FF" opacity="0.1"/><circle cx="40" cy="80" r="1" fill="%23F5B301" opacity="0.1"/></svg>")',
          animation: 'starField 30s linear infinite',
          zIndex: 0
        }} />

        <div style={{
          background: 'rgba(19,10,46,0.85)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '18px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(16px)',
          maxWidth: '500px',
          width: '100%',
          padding: '2.5rem',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'linear-gradient(135deg, #F5B301, #FF8C00)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '15px',
              boxShadow: '0 0 25px rgba(245,179,1,0.35)'
            }}>
              <span style={{ color: '#0B061A', fontWeight: 'bold', fontSize: '20px' }}>N</span>
            </div>
            <div>
              <h3 style={{
                margin: '0',
                fontSize: '22px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #F5B301, #FF8C00)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '1px'
              }}>NIRAL Pay</h3>
              <p style={{ margin: '0', fontSize: '13px', color: '#C9C6D6' }}>Scan QR to Pay</p>
            </div>
          </div>

          <div style={{
            background: 'rgba(11,6,26,0.6)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{
              margin: '0 0 1.5rem 0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#FFFFFF'
            }}>Payment Summary</h4>
            <div style={{ marginBottom: '1.5rem' }}>
              <h5 style={{
                margin: '0 0 0.5rem 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#FFFFFF'
              }}>
                {paymentData.event.title}
              </h5>
              <p style={{ margin: '0', fontSize: '13px', color: '#C9C6D6' }}>
                Event Registration Fee
              </p>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '14px', color: '#C9C6D6' }}>Registration Fee</span>
                <span style={{ fontSize: '14px', color: '#FFFFFF' }}>&#8377;{paymentData.amount}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                paddingTop: '0.75rem'
              }}>
                <span style={{ fontSize: '18px', fontWeight: '600', color: '#FFFFFF' }}>Total Amount</span>
                <span style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #F5B301, #FF8C00)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>&#8377;{paymentData.amount}</span>
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(11,6,26,0.6)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
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
                  <span style={{
                    fontSize: '10px',
                    color: '#999',
                    textAlign: 'center',
                    lineHeight: '1.2'
                  }}>QR CODE</span>
                </div>
              </div>
            </div>
            <p style={{
              margin: '1rem 0 0 0',
              fontSize: '14px',
              color: '#C9C6D6',
              textAlign: 'center'
            }}>
              Scan this QR code with any UPI app to pay
            </p>
            <p style={{
              margin: '0.5rem 0 0 0',
              fontSize: '13px',
              color: '#888',
              textAlign: 'center'
            }}>
              Google Pay, PhonePe, Paytm, BHIM, or any UPI app
            </p>
          </div>

          <div style={{
            background: 'rgba(0,229,255,0.1)',
            border: '1px solid rgba(0,229,255,0.2)',
            borderRadius: '8px',
            padding: '1rem',
            fontSize: '13px',
            color: '#00E5FF',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            After payment, upload the screenshot on the next page for verification.
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => navigate('/participant-home')}
              style={{
                flex: 1,
                padding: '12px 20px',
                background: 'transparent',
                color: '#FF5A5A',
                border: '1px solid #FF5A5A',
                borderRadius: '999px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 90, 90, 0.1)';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 0 25px rgba(255, 90, 90, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
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
              style={{
                flex: 2,
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #F5B301, #FF8C00)',
                color: '#0B061A',
                border: 'none',
                borderRadius: '999px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '700',
                transition: 'all 0.3s ease',
                boxShadow: '0 0 25px rgba(245,179,1,0.35)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 35px rgba(245,179,1,0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 0 25px rgba(245,179,1,0.35)';
              }}
            >
              I Have Paid
            </button>
          </div>
        </div>

        <style>{`
          @keyframes starField {
            from { transform: translateY(0); }
            to { transform: translateY(-100px); }
          }
        `}</style>
      </div>

      <Footer />
    </div>
  );
}
