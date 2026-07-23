import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from '../api/axios';

export default function HomePage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [currentView, setCurrentView] = useState('home');
  const [photos, setPhotos] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/events/published');
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setEvents([]);
    }
  };

  const fetchPhotos = async () => {
    try {
      const response = await axios.get('/photos/public');
      setPhotos(response.data);
    } catch (error) {
      console.error('Failed to fetch photos:', error);
      setPhotos([]);
    }
  };

  const switchView = (view) => {
    setCurrentView(view);
    setSelectedAlbum(null);
    if (view === 'gallery') fetchPhotos();
  };

  const activeEvents = events.filter(e => !e.event_finished);

  return (
    <div>
      <Header showNavigation={false} showLoginButton />

      {currentView === 'home' && (
        <>
          <section className="hero">
            <div className="hero-content">
              <h1>Welcome to NIRAL 2026</h1>
              <p>
                National Level Technical Symposium by the IST Department, CEG.
                Join us for an extraordinary journey of innovation and technology —
                cutting-edge workshops, competitive events, and networking opportunities
                at Anna University Chennai's premier technical symposium.
              </p>
              <div style={{ marginBottom: '2rem', fontSize: '1.05rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                March 12–14, 2026
              </div>
              <div className="hero-actions">
                <button className="btn btn-primary btn-lg" onClick={() => switchView('events')}>Explore Events</button>
                <button className="btn btn-secondary btn-lg" onClick={() => switchView('about')}>About NIRAL</button>
              </div>
            </div>
          </section>

          <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)' }}>
            <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
              <div className="stats-grid" style={{ maxWidth: 800, margin: '0 auto' }}>
                <div className="stat-card">
                  <h3>Participants</h3>
                  <span className="stat-number">1500+</span>
                </div>
                <div className="stat-card">
                  <h3>Events</h3>
                  <span className="stat-number">15+</span>
                </div>
                <div className="stat-card">
                  <h3>Workshops</h3>
                  <span className="stat-number">5+</span>
                </div>
              </div>
            </div>
          </div>

          {activeEvents.length > 0 && (
            <section id="events" className="features-section">
              <div className="container">
                <div className="section-header">
                  <h2>Upcoming Events</h2>
                  <p>Browse and register for exciting events at NIRAL 2026</p>
                </div>
                <div className="features-grid">
                  {activeEvents.map(event => (
                    <div key={event._id} className="feature-card" style={{ textAlign: 'left' }}>
                      {event.cover_photo && (
                        <img
                          src={`\${API_BASE_URL}/${event.cover_photo}`}
                          alt="Event Cover"
                          style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}
                        />
                      )}
                      <h3>{event.title}</h3>
                      <p style={{ marginBottom: '0.75rem' }}>{event.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                        <span>{event.time}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span className="badge badge-info">{event.type}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{event.duration_hours}h</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-default)' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Prize Pool: ₹{event.prize_pool || 0}</span>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>Register</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section id="about" className="about-section">
            <div className="container">
              <div className="section-content">
                <div className="section-header">
                  <h2>About NIRAL</h2>
                </div>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.8 }}>
                  NIRAL is the flagship technical symposium of the Information Science and Technology
                  Department at College of Engineering Guindy, Anna University. Since its inception,
                  NIRAL has been a beacon of innovation, bringing together brilliant minds from across
                  the nation to showcase cutting-edge research and technological advancements.
                </p>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.8 }}>
                  What started as a modest technical gathering has evolved into one of South India's
                  most prestigious technical symposiums. NIRAL has consistently pushed the boundaries
                  of academic excellence, fostering innovation in areas such as Artificial Intelligence,
                  Machine Learning, Cybersecurity, Data Science, and emerging technologies.
                </p>
              </div>
            </div>
          </section>

          <section className="how-it-works-section">
            <div className="container">
              <div className="section-content">
                <div className="section-header">
                  <h2>How It Works</h2>
                </div>
                <div className="steps-list">
                  <div className="step-item">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4>Create Your Account</h4>
                      <p>Sign up as a participant with your college email and basic details.</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4>Browse Events</h4>
                      <p>Explore workshops, paper presentations, coding contests, and more.</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h4>Register & Pay</h4>
                      <p>Select events, complete registration, and confirm payment.</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h4>Attend & Compete</h4>
                      <p>Show up on event day, participate, and win prizes.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="cta-section">
            <div className="container">
              <div className="cta-card">
                <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Ready to Participate?</h2>
                <p style={{ fontSize: '1.05rem', marginBottom: '1.5rem' }}>
                  Join hundreds of students from across India at NIRAL 2026.
                </p>
                <div className="cta-actions">
                  <button className="btn btn-lg" style={{ background: '#fff', color: 'var(--accent-primary)', fontWeight: 700 }} onClick={() => navigate('/login')}>
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </section>

          <Footer showOrganizers />
        </>
      )}

      {currentView === 'events' && (
        <div className="page-container">
          <div className="container">
            <div className="page-header">
              <h1>Upcoming Events</h1>
              <p>Browse and register for events at NIRAL 2026</p>
            </div>
            <div className="features-grid">
              {activeEvents.map(event => (
                <div key={event._id} className="feature-card" style={{ textAlign: 'left' }}>
                  {event.cover_photo && (
                    <img
                      src={`\${API_BASE_URL}/${event.cover_photo}`}
                      alt="Event Cover"
                      style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}
                    />
                  )}
                  <h3>{event.title}</h3>
                  <p style={{ marginBottom: '0.75rem' }}>{event.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                    <span>{event.time}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span className="badge badge-info">{event.type}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{event.duration_hours}h</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-default)' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Prize Pool: ₹{event.prize_pool || 0}</span>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>Register</button>
                  </div>
                </div>
              ))}
            </div>
            {activeEvents.length === 0 && (
              <div className="no-data"><p>No published events available at the moment.</p></div>
            )}
          </div>
        </div>
      )}

      {currentView === 'gallery' && (
        <div className="page-container">
          <div className="container">
            {!selectedAlbum ? (
              <>
                <div className="page-header">
                  <h1>Gallery</h1>
                  <p>Browse event photos from NIRAL</p>
                </div>
                {photos.length === 0 ? (
                  <div className="no-data"><p>No photos available yet.</p></div>
                ) : (
                  <div className="features-grid">
                    {(() => {
                      const grouped = {};
                      photos.forEach(p => {
                        const label = p.upload_type === 'event' ? (p.event_id?.title || 'Event') : (p.category_id?.name || 'General');
                        if (!grouped[label]) grouped[label] = [];
                        grouped[label].push(p);
                      });
                      return Object.entries(grouped).map(([label, items]) => (
                        <div
                          key={label}
                          className="card"
                          style={{ cursor: 'pointer', transition: 'box-shadow 250ms ease' }}
                          onClick={() => setSelectedAlbum({ label, items })}
                          onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                          onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
                        >
                          <img src={`\${API_BASE_URL}/uploads/photos/${items[0].filename}`} alt={label} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                          <div className="card-body">
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{label}</h3>
                            <p style={{ margin: 0, fontSize: '0.875rem' }}>{items.length} photo{items.length !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h1 style={{ margin: 0, fontSize: '1.75rem' }}>{selectedAlbum.label}</h1>
                  <button className="btn btn-secondary" onClick={() => setSelectedAlbum(null)}>Back to Gallery</button>
                </div>
                <div className="features-grid">
                  {selectedAlbum.items.map(p => (
                    <div key={p._id} className="card" style={{ cursor: 'pointer' }} onClick={() => window.open(`\${API_BASE_URL}/uploads/photos/${p.filename}`, '_blank')}>
                      <img src={`\${API_BASE_URL}/uploads/photos/${p.filename}`} alt={p.name} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                      <div className="card-body" style={{ padding: '0.85rem 1rem' }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {currentView === 'about' && (
        <div className="page-container">
          <div className="container">
            <div className="about-content">
              <div className="page-header">
                <h1>About NIRAL</h1>
              </div>
              <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="card-body" style={{ padding: '2rem' }}>
                  <h2 style={{ fontSize: '1.375rem', marginBottom: '1rem' }}>History & Legacy</h2>
                  <p style={{ lineHeight: 1.8, fontSize: '1rem' }}>
                    NIRAL is the flagship technical symposium of the Information Science and Technology
                    Department at College of Engineering Guindy, Anna University. Since its inception,
                    NIRAL has been a beacon of innovation, bringing together brilliant minds from across
                    the nation to showcase cutting-edge research and technological advancements.
                  </p>
                  <h3 style={{ fontSize: '1.125rem', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Our Journey</h3>
                  <p style={{ lineHeight: 1.8, fontSize: '1rem' }}>
                    What started as a modest technical gathering has evolved into one of South India's
                    most prestigious technical symposiums. NIRAL has consistently pushed the boundaries
                    of academic excellence, fostering innovation in areas such as Artificial Intelligence,
                    Machine Learning, Cybersecurity, Data Science, and emerging technologies.
                  </p>
                  <h3 style={{ fontSize: '1.125rem', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Vision & Mission</h3>
                  <p style={{ lineHeight: 1.8, fontSize: '1rem' }}>
                    Our vision is to create a platform where academic brilliance meets practical innovation.
                    NIRAL serves as a catalyst for technological advancement, encouraging students and
                    researchers to explore uncharted territories in computer science and information technology.
                  </p>
                  <h3 style={{ fontSize: '1.125rem', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Impact & Recognition</h3>
                  <p style={{ lineHeight: 1.8, fontSize: '1rem', marginBottom: 0 }}>
                    Over the years, NIRAL has attracted participation from premier institutions across India,
                    including IITs, NITs, and leading universities. Industry leaders and academic stalwarts
                    regularly grace NIRAL as keynote speakers and judges, adding immense value to the
                    learning experience.
                  </p>
                </div>
              </div>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Years of Excellence</h3>
                  <span className="stat-number">15+</span>
                </div>
                <div className="stat-card">
                  <h3>Participating Colleges</h3>
                  <span className="stat-number">100+</span>
                </div>
                <div className="stat-card">
                  <h3>Total Participants</h3>
                  <span className="stat-number">10,000+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentView === 'contact' && (
        <div className="page-container">
          <div className="container">
            <div className="contact-content">
              <div className="page-header">
                <h1>Contact Us</h1>
              </div>
              <div className="features-grid" style={{ marginBottom: '2rem' }}>
                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <h3 style={{ marginBottom: '0.75rem' }}>Event Coordinator</h3>
                    <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Dr. D. Narashiman</p>
                    <p style={{ marginBottom: '0.75rem' }}>Faculty, IST Department</p>
                    <p style={{ fontSize: '0.875rem' }}>narashiman@annauniv.edu</p>
                    <p style={{ fontSize: '0.875rem' }}>+91 98765 43210</p>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <h3 style={{ marginBottom: '0.75rem' }}>Student Coordinator</h3>
                    <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Arjun</p>
                    <p style={{ marginBottom: '0.75rem' }}>Final Year, IST</p>
                    <p style={{ fontSize: '0.875rem' }}>arjun.niral2026@gmail.com</p>
                    <p style={{ fontSize: '0.875rem' }}>+91 87654 32109</p>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <h3 style={{ marginBottom: '0.75rem' }}>Technical Support</h3>
                    <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Rahul</p>
                    <p style={{ marginBottom: '0.75rem' }}>Technical Lead</p>
                    <p style={{ fontSize: '0.875rem' }}>tech.niral2026@gmail.com</p>
                    <p style={{ fontSize: '0.875rem' }}>+91 76543 21098</p>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-body" style={{ textAlign: 'center', padding: '2rem' }}>
                  <h3 style={{ marginBottom: '1rem' }}>General Information</h3>
                  <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '0.35rem' }}>Official Email</h4>
                      <p style={{ fontSize: '0.9rem' }}>niral2026@annauniv.edu</p>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '0.35rem' }}>Department Office</h4>
                      <p style={{ fontSize: '0.9rem' }}>+91 44 2235 8000</p>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '0.35rem' }}>Address</h4>
                      <p style={{ fontSize: '0.875rem' }}>IST Department, CEG<br />Anna University, Chennai - 600025</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentView !== 'home' && <Footer />}
    </div>
  );
}
