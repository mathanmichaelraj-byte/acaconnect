import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">About AcaConnect</h1>
          <p className="hero-subtitle">
            Revolutionizing College Event Management
          </p>
          <p className="hero-description">
            Built by students, for students - making event management seamless and efficient
          </p>
          <button className="btn-hero" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </div>
      </section>

      {/* Mission Section */}
      <section className="features-section">
        <div className="section-container">
          <h2 className="section-title">Our Mission</h2>
          <p className="section-subtitle">Empowering educational institutions with smart technology</p>
          
          <div className="features-grid">
            <div className="feature-card-landing">
              <div className="feature-icon">🎯</div>
              <h3>Streamline Workflows</h3>
              <p>Automate complex approval processes and reduce administrative overhead with intelligent workflow management</p>
            </div>
            
            <div className="feature-card-landing">
              <div className="feature-icon">🤝</div>
              <h3>Connect Communities</h3>
              <p>Bridge the gap between organizers, administrators, and students for better collaboration</p>
            </div>
            
            <div className="feature-card-landing">
              <div className="feature-icon">📊</div>
              <h3>Data-Driven Insights</h3>
              <p>Leverage analytics and AI to make informed decisions about event planning and budgeting</p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="how-it-works">
        <div className="section-container">
          <h2 className="section-title">Our Story</h2>
          <p className="section-subtitle">From idea to innovation</p>
          
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">2023</div>
              <h3>The Problem</h3>
              <p>Identified inefficiencies in traditional event management systems across colleges</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">2024</div>
              <h3>Development</h3>
              <p>Built a comprehensive platform with input from students, faculty, and administrators</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">2025</div>
              <h3>Launch</h3>
              <p>Successfully deployed across multiple institutions with positive feedback</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">2026</div>
              <h3>Growth</h3>
              <p>Expanding features with AI/ML capabilities and serving thousands of users</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Values Section */}
      <section className="roles-section">
        <div className="section-container">
          <h2 className="section-title">Our Values</h2>
          <p className="section-subtitle">What drives us forward</p>
          
          <div className="roles-grid">
            <div className="role-card">
              <div className="role-icon">💡</div>
              <h3>Innovation</h3>
              <p>Constantly evolving with cutting-edge technology</p>
            </div>
            
            <div className="role-card">
              <div className="role-icon">🔒</div>
              <h3>Security</h3>
              <p>Your data privacy and security is our top priority</p>
            </div>
            
            <div className="role-card">
              <div className="role-icon">⚡</div>
              <h3>Efficiency</h3>
              <p>Saving time and resources for what matters most</p>
            </div>
            
            <div className="role-card">
              <div className="role-icon">🌟</div>
              <h3>Excellence</h3>
              <p>Committed to delivering the best user experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="features-section">
        <div className="section-container">
          <h2 className="section-title">Built With Modern Technology</h2>
          <p className="section-subtitle">Powered by industry-leading tools and frameworks</p>
          
          <div className="features-grid">
            <div className="feature-card-landing">
              <div className="feature-icon">⚛️</div>
              <h3>React.js</h3>
              <p>Modern, responsive frontend for seamless user experience</p>
            </div>
            
            <div className="feature-card-landing">
              <div className="feature-icon">🟢</div>
              <h3>Node.js</h3>
              <p>Scalable backend infrastructure for high performance</p>
            </div>
            
            <div className="feature-card-landing">
              <div className="feature-icon">🍃</div>
              <h3>MongoDB</h3>
              <p>Flexible database for efficient data management</p>
            </div>
            
            <div className="feature-card-landing">
              <div className="feature-icon">🤖</div>
              <h3>AI/ML</h3>
              <p>Intelligent predictions and personalized recommendations</p>
            </div>
            
            <div className="feature-card-landing">
              <div className="feature-icon">📍</div>
              <h3>GPS Integration</h3>
              <p>Location-based attendance verification</p>
            </div>
            
            <div className="feature-card-landing">
              <div className="feature-icon">☁️</div>
              <h3>Cloud Ready</h3>
              <p>Scalable cloud infrastructure for reliability</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join us in transforming event management</p>
          <button className="btn-cta" onClick={() => navigate('/login')}>
            Start Your Journey
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
