import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
    <div>
      <Header showNavigation={true} />

      <div className="page-container">
        <div className="container">
          <div className="page-header">
            <h1>Contact Us</h1>
            <p>We'd Love to Hear From You</p>
            <p style={{ marginTop: '0.5rem' }}>Have questions? Need support? Want to partner with us? Get in touch!</p>
          </div>

          {/* Contact Info Section */}
          <div style={{ marginBottom: '3rem' }}>
            <div className="section-header">
              <h2>Get In Touch</h2>
              <p>Multiple ways to reach us</p>
            </div>

            <div className="features-grid" style={{ marginTop: '1.5rem' }}>
              <div className="feature-card">
                <div className="feature-icon">@</div>
                <h3>Email Us</h3>
                <p>support@acaconnect.com</p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  We'll respond within 24 hours
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">T</div>
                <h3>Call Us</h3>
                <p>+91 1234567890</p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Mon-Fri, 9 AM - 6 PM IST
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">L</div>
                <h3>Visit Us</h3>
                <p>Tech Campus, Innovation Hub</p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Bangalore, Karnataka, India
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="contact-page" style={{ marginBottom: '3rem' }}>
            <div className="contact-content">
              <div className="section-header">
                <h2>Send Us a Message</h2>
                <p>Fill out the form below and we'll get back to you soon</p>
              </div>

              {submitted ? (
                <div className="alert alert-success" style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: '600', marginTop: '1.5rem' }}>
                  Thank you! Your message has been sent successfully.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form" style={{ marginTop: '1.5rem' }}>
                  <div className="form-group">
                    <label>Your Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="form-group">
                    <label>Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="What is this about?"
                    />
                  </div>

                  <div className="form-group">
                    <label>Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="6"
                      className="form-textarea"
                      placeholder="Write your message here..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-block btn-lg"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* FAQ Section */}
          <div style={{ marginBottom: '3rem' }}>
            <div className="section-header">
              <h2>Frequently Asked Questions</h2>
              <p>Quick answers to common questions</p>
            </div>

            <div className="features-grid" style={{ marginTop: '1.5rem' }}>
              <div className="feature-card">
                <div className="feature-icon">Q</div>
                <h3>How do I get started?</h3>
                <p>Simply sign up with your college email and start exploring events</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">F</div>
                <h3>Is it free to use?</h3>
                <p>Yes! AcaConnect is free for students and educational institutions</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">D</div>
                <h3>Is my data secure?</h3>
                <p>Absolutely! We use industry-standard encryption and security practices</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">M</div>
                <h3>Mobile app available?</h3>
                <p>Currently web-based, mobile apps coming soon in 2026</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="section-header" style={{ marginTop: '3rem' }}>
            <h2>Still Have Questions?</h2>
            <p>Our support team is here to help you</p>
            <div style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-primary btn-lg" onClick={() => window.location.href = 'mailto:support@acaconnect.com'}>
                Email Support Team
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
