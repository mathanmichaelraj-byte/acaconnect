import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Navigation Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(15, 32, 39, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '1rem 2rem',
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => navigate('/')}>AcaConnect</h2>
          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <a onClick={() => navigate('/about')} style={{ color: '#fff', textDecoration: 'none', cursor: 'pointer', fontWeight: '500' }}>About</a>
            <a onClick={() => navigate('/contact')} style={{ color: '#fff', textDecoration: 'none', cursor: 'pointer', fontWeight: '500' }}>Contact</a>
            <button className="btn-hero" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }} onClick={() => navigate('/login')}>
              Login
            </button>
          </nav>
        </div>
      </header>

      {/* Add padding to account for fixed header */}
      <div style={{ paddingTop: '80px' }}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">AcaConnect</h1>
          <p className="hero-subtitle">
            Transform Your College Event Management Experience
          </p>
          <p className="hero-description">
            Streamline event planning, approvals, and execution with our intelligent workflow-driven platform
          </p>
          <button className="btn-hero" onClick={() => navigate('/login')}>
            Get Started →
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <h2 className="section-title">Powerful Features</h2>
          <p className="section-subtitle">Everything you need to manage college events efficiently</p>
          
          <div className="features-grid">
            <div className="feature-card-landing">
              <div className="feature-icon">🎯</div>
              <h3>Smart Workflow</h3>
              <p>Automated approval process from creation to execution with role-based access control</p>
            </div>
            
            <div className="feature-card-landing">
              <div className="feature-icon">💰</div>
              <h3>Budget Management</h3>
              <p>AI-powered budget prediction and consolidated financial tracking across teams</p>
            </div>
            
            <div className="feature-card-landing">
              <div className="feature-icon">📍</div>
              <h3>Smart Attendance</h3>
              <p>GPS-based location verification ensures accurate attendance tracking</p>
            </div>
            
            <div className="feature-card-landing">
              <div className="feature-icon">🎓</div>
              <h3>Auto Certificates</h3>
              <p>Generate and distribute digital certificates automatically to verified attendees</p>
            </div>
            
            <div className="feature-card-landing">
              <div className="feature-icon">🤖</div>
              <h3>AI Recommendations</h3>
              <p>Personalized event suggestions based on student interests and history</p>
            </div>
            
            <div className="feature-card-landing">
              <div className="feature-icon">📊</div>
              <h3>Real-time Analytics</h3>
              <p>Comprehensive dashboards with insights for administrators and organizers</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="section-container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Simple, streamlined process from start to finish</p>
          
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Create Event</h3>
              <p>Event teams create and submit events with all necessary details</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Collect Requirements</h3>
              <p>Logistics, HR, and Hospitality teams add their requirements</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Budget Approval</h3>
              <p>Automated budget aggregation with ML predictions for approval</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Publish & Execute</h3>
              <p>Students register, attend, and receive certificates automatically</p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="roles-section">
        <div className="section-container">
          <h2 className="section-title">Built for Everyone</h2>
          <p className="section-subtitle">Tailored experiences for every stakeholder</p>
          
          <div className="roles-grid">
            <div className="role-card">
              <div className="role-icon">👨‍💼</div>
              <h3>Administrators</h3>
              <p>Complete system oversight and management</p>
            </div>
            
            <div className="role-card">
              <div className="role-icon">🎯</div>
              <h3>Event Teams</h3>
              <p>Create and manage events seamlessly</p>
            </div>
            
            <div className="role-card">
              <div className="role-icon">💼</div>
              <h3>Finance Team</h3>
              <p>Budget tracking and approval workflows</p>
            </div>
            
            <div className="role-card">
              <div className="role-icon">🎓</div>
              <h3>Students</h3>
              <p>Discover, register, and participate in events</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your Event Management?</h2>
          <p>Join hundreds of institutions already using AcaConnect</p>
          <button className="btn-cta" onClick={() => navigate('/login')}>
            Start Now - It's Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' }}>
            <a onClick={() => navigate('/about')} style={{ color: '#fff', textDecoration: 'none', cursor: 'pointer', opacity: 0.8 }}>About</a>
            <a onClick={() => navigate('/contact')} style={{ color: '#fff', textDecoration: 'none', cursor: 'pointer', opacity: 0.8 }}>Contact</a>
            <a onClick={() => navigate('/login')} style={{ color: '#fff', textDecoration: 'none', cursor: 'pointer', opacity: 0.8 }}>Login</a>
          </div>
          <p>&copy; 2024 AcaConnect. All rights reserved.</p>
          <p>Transforming College Event Management</p>
        </div>
      </footer>
      </div>
    </div>
  );
}