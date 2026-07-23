import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axios';

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
    return <div>Loading...</div>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        maxWidth: '800px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr'
      }}>
        {/* Left Panel - Order Summary */}
        <div style={{
          background: '#f8f9fa',
          padding: '2rem',
          borderRight: '1px solid #e9ecef'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>N</span>
            </div>
            <div>
              <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '600' }}>NIRAL Pay</h3>
              <p style={{ margin: '0', fontSize: '12px', color: '#6c757d' }}>Secure Payment Gateway</p>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '16px', fontWeight: '600' }}>Order Summary</h4>
            <div style={{ marginBottom: '1rem' }}>
              <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '14px', fontWeight: '600' }}>
                {paymentData.event.title}
              </h5>
              <p style={{ margin: '0', fontSize: '12px', color: '#6c757d' }}>
                Event Registration Fee
              </p>
            </div>
            <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '14px' }}>Registration Fee</span>
                <span style={{ fontSize: '14px' }}>₹{paymentData.amount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '14px' }}>Processing Fee</span>
                <span style={{ fontSize: '14px' }}>₹0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e9ecef', paddingTop: '0.5rem' }}>
                <span style={{ fontSize: '16px', fontWeight: '600' }}>Total Amount</span>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#667eea' }}>₹{paymentData.amount}</span>
              </div>
            </div>
          </div>

          <div style={{
            background: '#e3f2fd',
            border: '1px solid #bbdefb',
            borderRadius: '6px',
            padding: '1rem',
            fontSize: '12px',
            color: '#1976d2'
          }}>
            🔒 Your payment is secured with 256-bit SSL encryption
          </div>
        </div>

        {/* Right Panel - Payment Form */}
        <div style={{ padding: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '20px', fontWeight: '600' }}>Payment Details</h3>

          {/* Payment Method Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                border: formData.paymentMethod === 'card' ? '2px solid #667eea' : '1px solid #dee2e6',
                borderRadius: '6px',
                cursor: 'pointer',
                flex: 1
              }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={handleInputChange}
                  style={{ marginRight: '0.5rem' }}
                />
                💳 Card
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                border: formData.paymentMethod === 'upi' ? '2px solid #667eea' : '1px solid #dee2e6',
                borderRadius: '6px',
                cursor: 'pointer',
                flex: 1
              }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={formData.paymentMethod === 'upi'}
                  onChange={handleInputChange}
                  style={{ marginRight: '0.5rem' }}
                />
                📱 UPI
              </label>
            </div>
          </div>

          {formData.paymentMethod === 'card' ? (
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
                  Card Number
                </label>
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
                    Month
                  </label>
                  <select
                    name="expiryMonth"
                    value={formData.expiryMonth}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #dee2e6',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">MM</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {String(i + 1).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
                    Year
                  </label>
                  <select
                    name="expiryYear"
                    value={formData.expiryYear}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #dee2e6',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">YY</option>
                    {Array.from({ length: 10 }, (_, i) => (
                      <option key={i} value={String(new Date().getFullYear() + i).slice(-2)}>
                        {String(new Date().getFullYear() + i).slice(-2)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
                    CVV
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength="3"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #dee2e6',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
                  Cardholder Name
                </label>
                <input
                  type="text"
                  name="cardholderName"
                  value={formData.cardholderName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              background: '#f8f9fa',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📱</div>
              <p style={{ margin: '0', fontSize: '14px', color: '#6c757d' }}>
                UPI payment will be processed through your preferred UPI app
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => navigate('/participant-home')}
              disabled={processing}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#f8f9fa',
                color: '#6c757d',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                cursor: processing ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={processing}
              style={{
                flex: 2,
                padding: '0.75rem',
                background: processing ? '#6c757d' : 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: processing ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              {processing ? 'Processing...' : `Pay ₹${paymentData.amount}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}