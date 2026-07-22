import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function MockPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentData, setPaymentData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    paymentMethod: 'card'
  });

  useEffect(() => {
    // Get payment data from navigation state
    if (location.state?.paymentData) {
      setPaymentData(location.state.paymentData);
    } else {
      // Redirect back if no payment data
      navigate('/participant-home');
    }
  }, [location.state, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 16) {
      setFormData(prev => ({
        ...prev,
        cardNumber: formatCardNumber(value)
      }));
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing delay
    setTimeout(async () => {
      try {
        // Process the payment
        const response = await axios.post(`/registrations/registrations/${paymentData.registrationId}/pay`);
        
        if (response.data.success) {
          // Redirect to success page
          navigate('/payment-success', {
            state: {
              paymentId: response.data.paymentId,
              event: paymentData.event,
              amount: paymentData.amount
            }
          });
        }
      } catch (error) {
        alert('Payment failed. Please try again.');
        setProcessing(false);
      }
    }, 3000);
  };

  if (!paymentData) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <Header showBackButton={true} backTo="/participant-home" showNavigation={false} />

      <div className="mock-payment-page" style={{ paddingTop: '140px', paddingBottom: '80px' }}>
        <div className="mock-card" style={{ maxWidth: '800px', padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          {/* Left Panel - Order Summary */}
          <div style={{
            background: 'var(--bg-surface-alt)',
            padding: '2rem',
            borderRight: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg) 0 0 var(--radius-lg)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'var(--accent-primary)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>N</span>
              </div>
              <div>
                <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>NIRAL Pay</h3>
                <p style={{ margin: '0', fontSize: '12px', color: 'var(--text-muted)' }}>Secure Payment Gateway</p>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-surface)',
              borderRadius: '8px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-default)'
            }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>Order Summary</h4>
              <div style={{ marginBottom: '1rem' }}>
                <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {paymentData.event.title}
                </h5>
                <p style={{ margin: '0', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Event Registration Fee
                </p>
              </div>
              <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Registration Fee</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>&#8377;{paymentData.amount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Processing Fee</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>&#8377;0</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-default)', paddingTop: '0.5rem' }}>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>Total Amount</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--accent-primary)' }}>&#8377;{paymentData.amount}</span>
                </div>
              </div>
            </div>

            <div className="alert alert-info" style={{ fontSize: '12px' }}>
              Your payment is secured with 256-bit SSL encryption
            </div>
          </div>

          {/* Right Panel - Payment Form */}
          <div style={{ padding: '2rem' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)' }}>Payment Details</h3>

            {/* Payment Method Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  border: formData.paymentMethod === 'card' ? '2px solid var(--accent-primary)' : '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  flex: 1,
                  color: 'var(--text-primary)',
                  fontSize: '14px'
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleInputChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Card
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  border: formData.paymentMethod === 'upi' ? '2px solid var(--accent-primary)' : '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  flex: 1,
                  color: 'var(--text-primary)',
                  fontSize: '14px'
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={formData.paymentMethod === 'upi'}
                    onChange={handleInputChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  UPI
                </label>
              </div>
            </div>

            {formData.paymentMethod === 'card' ? (
              <div>
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    value={formData.cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label>Month</label>
                    <select
                      name="expiryMonth"
                      value={formData.expiryMonth}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                          {String(i + 1).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Year</label>
                    <select
                      name="expiryYear"
                      value={formData.expiryYear}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">YY</option>
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i} value={String(new Date().getFullYear() + i).slice(-2)}>
                          {String(new Date().getFullYear() + i).slice(-2)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength="3"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    name="cardholderName"
                    value={formData.cardholderName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="form-input"
                  />
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                background: 'var(--bg-surface-alt)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                border: '1px solid var(--border-default)'
              }}>
                <p style={{ margin: '0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  UPI payment will be processed through your preferred UPI app
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => navigate('/participant-home')}
                disabled={processing}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={processing}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                {processing ? 'Processing...' : `Pay \u20B9${paymentData.amount}`}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
