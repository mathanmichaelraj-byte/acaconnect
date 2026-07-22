import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div>
      <Header showNavigation={true} />

      <div className="page-container">
        <div className="container">
          <div className="page-header">
            <h1>About AcaConnect</h1>
            <p>Revolutionizing College Event Management</p>
            <p style={{ marginTop: '0.5rem' }}>Built by students, for students — making event management seamless and efficient</p>
          </div>

          {/* Mission Section */}
          <div style={{ marginBottom: '3rem' }}>
            <div className="section-header">
              <h2>Our Mission</h2>
              <p>Empowering educational institutions with smart technology</p>
            </div>

            <div className="features-grid" style={{ marginTop: '1.5rem' }}>
              <div className="feature-card">
                <div className="feature-icon">1</div>
                <h3>Streamline Workflows</h3>
                <p>Automate complex approval processes and reduce administrative overhead with intelligent workflow management</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">2</div>
                <h3>Connect Communities</h3>
                <p>Bridge the gap between organizers, administrators, and students for better collaboration</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">3</div>
                <h3>Data-Driven Insights</h3>
                <p>Leverage analytics and AI to make informed decisions about event planning and budgeting</p>
              </div>
            </div>
          </div>

          {/* Story Section */}
          <div style={{ marginBottom: '3rem' }}>
            <div className="section-header">
              <h2>Our Story</h2>
              <p>From idea to innovation</p>
            </div>

            <div className="steps-list" style={{ marginTop: '1.5rem' }}>
              <div className="step-item">
                <div className="step-number">23</div>
                <div className="step-content">
                  <h4>The Problem</h4>
                  <p>Identified inefficiencies in traditional event management systems across colleges</p>
                </div>
              </div>

              <div className="step-item">
                <div className="step-number">24</div>
                <div className="step-content">
                  <h4>Development</h4>
                  <p>Built a comprehensive platform with input from students, faculty, and administrators</p>
                </div>
              </div>

              <div className="step-item">
                <div className="step-number">25</div>
                <div className="step-content">
                  <h4>Launch</h4>
                  <p>Successfully deployed across multiple institutions with positive feedback</p>
                </div>
              </div>

              <div className="step-item">
                <div className="step-number">26</div>
                <div className="step-content">
                  <h4>Growth</h4>
                  <p>Expanding features with AI/ML capabilities and serving thousands of users</p>
                </div>
              </div>
            </div>
          </div>

          {/* Team Values Section */}
          <div style={{ marginBottom: '3rem' }}>
            <div className="section-header">
              <h2>Our Values</h2>
              <p>What drives us forward</p>
            </div>

            <div className="features-grid" style={{ marginTop: '1.5rem' }}>
              <div className="feature-card">
                <div className="feature-icon">I</div>
                <h3>Innovation</h3>
                <p>Constantly evolving with cutting-edge technology</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">S</div>
                <h3>Security</h3>
                <p>Your data privacy and security is our top priority</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">E</div>
                <h3>Efficiency</h3>
                <p>Saving time and resources for what matters most</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">X</div>
                <h3>Excellence</h3>
                <p>Committed to delivering the best user experience</p>
              </div>
            </div>
          </div>

          {/* Technology Stack Section */}
          <div style={{ marginBottom: '3rem' }}>
            <div className="section-header">
              <h2>Built With Modern Technology</h2>
              <p>Powered by industry-leading tools and frameworks</p>
            </div>

            <div className="features-grid" style={{ marginTop: '1.5rem' }}>
              <div className="feature-card">
                <div className="feature-icon">R</div>
                <h3>React.js</h3>
                <p>Modern, responsive frontend for seamless user experience</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">N</div>
                <h3>Node.js</h3>
                <p>Scalable backend infrastructure for high performance</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">M</div>
                <h3>MongoDB</h3>
                <p>Flexible database for efficient data management</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">A</div>
                <h3>AI/ML</h3>
                <p>Intelligent predictions and personalized recommendations</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">G</div>
                <h3>GPS Integration</h3>
                <p>Location-based attendance verification</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">C</div>
                <h3>Cloud Ready</h3>
                <p>Scalable cloud infrastructure for reliability</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="section-header" style={{ marginTop: '3rem' }}>
            <h2>Ready to Get Started?</h2>
            <p>Join us in transforming event management</p>
            <div style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
                Start Your Journey
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
