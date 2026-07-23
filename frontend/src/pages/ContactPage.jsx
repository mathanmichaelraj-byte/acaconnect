import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ContactPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Contact Us</h1>
          <p className="hero-subtitle">
            We'd Love to Hear From You
          </p>
          <p className="hero-description">
            Have questions? Need support? Want to partner with us? Get in touch!
          </p>
          <button className="btn-hero" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="features-section">
        <div className="section-container">
          <h2 className="section-title">Get In Touch</h2>
          <p className="section-subtitle">Multiple ways to reach us</p>
          
          <div className="features-grid">
            <div className="feature-card-landing">
              <div className="feature-icon">📧</div>
              <h3>Email Us</h3>
              <p>support@acaconnect.com</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#999' }}>
                We'll respond within 24 hours
              </p>
            </div>
            
            <div className="feature-card-landing">
              <div className="feature-icon">📞</div>
              <h3>Call Us</h3>
              <p>+91 1234567890</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#999' }}>
                Mon-Fri, 9 AM - 6 PM IST
              </p>
            </div>
            
            <div className="feature-card-landing">
              <div className="feature-icon">📍</div>
              <h3>Visit Us</h3>
              <p>Tech Campus, Innovation Hub</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#999' }}>
                Bangalore, Karnataka, India
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="how-it-works">
        <div className="section-container">
          <h2 className="section-title">Send Us a Message</h2>
          <p className="section-subtitle">Fill out the form below and we'll get back to you soon</p>
          
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {submitted ? (
              <div style={{
                background: '#d4edda',
                color: '#155724',
                padding: '2rem',
                borderRadius: '12px',
                textAlign: 'center',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                ✓ Thank you! Your message has been sent successfully.
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{
                background: '#fff',
                padding: '2.5rem',
                borderRadius: '15px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
              }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: '#2c3e50'
                  }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0f2027'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: '#2c3e50'
                  }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0f2027'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: '#2c3e50'
                  }}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0f2027'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: '#2c3e50'
                  }}>
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0f2027'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #0f2027, #2c5364)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(15, 32, 39, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(15, 32, 39, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(15, 32, 39, 0.3)';
                  }}
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="roles-section">
        <div className="section-container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">Quick answers to common questions</p>
          
          <div className="roles-grid">
            <div className="role-card">
              <div className="role-icon">❓</div>
              <h3>How do I get started?</h3>
              <p>Simply sign up with your college email and start exploring events</p>
            </div>
            
            <div className="role-card">
              <div className="role-icon">💰</div>
              <h3>Is it free to use?</h3>
              <p>Yes! AcaConnect is free for students and educational institutions</p>
            </div>
            
            <div className="role-card">
              <div className="role-icon">🔐</div>
              <h3>Is my data secure?</h3>
              <p>Absolutely! We use industry-standard encryption and security practices</p>
            </div>
            
            <div className="role-card">
              <div className="role-icon">📱</div>
              <h3>Mobile app available?</h3>
              <p>Currently web-based, mobile apps coming soon in 2026</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Still Have Questions?</h2>
          <p>Our support team is here to help you</p>
          <button className="btn-cta" onClick={() => window.location.href = 'mailto:support@acaconnect.com'}>
            Email Support Team
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <p>&copy; 2024 AcaConnect. All rights reserved.</p>
          <p>Transforming College Event Management</p>
        </div>
      </footer>
    </div>
  );
}
