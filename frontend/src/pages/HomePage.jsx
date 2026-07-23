import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

export default function HomePage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [showEvents, setShowEvents] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
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

  const resetViews = (view) => {
    setShowEvents(view === 'events');
    setShowAbout(view === 'about');
    setShowContact(view === 'contact');
    setShowGallery(view === 'gallery');
    setSelectedAlbum(null);
    if (view === 'gallery') fetchPhotos();
  };

  return (
    <div className="niral-home">
      {/* Header Navigation */}
      <header className="niral-header">
        <div className="niral-nav-content">
          <div className="nav-left">
            <img src="/nirallogo.png" alt="NIRAL Logo" className="nav-logo" />
          </div>
          
          <nav className="nav-center">
            <a href="#" className={`nav-link ${!showEvents && !showAbout && !showContact && !showGallery ? 'active' : ''}`} onClick={() => resetViews('home')}>Home</a>
            <a href="#" className={`nav-link ${showEvents ? 'active' : ''}`} onClick={() => resetViews('events')}>Events</a>
            <a href="#" className={`nav-link ${showGallery ? 'active' : ''}`} onClick={() => resetViews('gallery')}>Gallery</a>
            <a href="#" className={`nav-link ${showAbout ? 'active' : ''}`} onClick={() => resetViews('about')}>About</a>
            <a href="#" className={`nav-link ${showContact ? 'active' : ''}`} onClick={() => resetViews('contact')}>Contact</a>
          </nav>
          
          <div className="nav-right">
            <button className="btn-register-now" onClick={() => navigate('/login')}>
              Login
            </button>
          </div>
        </div>
      </header>

      {!showEvents && !showAbout && !showContact && !showGallery ? (
        <>
          {/* Hero Section */}
          <section className="niral-hero" style={{
            backgroundImage: 'url(/niralbg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(rgba(8, 5, 20, 0.3), rgba(8, 5, 20, 0.2))',
              zIndex: 1
            }}></div>
            <div className="hero-content" style={{ position: 'relative', zIndex: 2 }}>
              <div className="hero-left">
                <h1 className="hero-welcome">Welcome to</h1>
                <h1 className="hero-title">NIRAL 2026</h1>
                <h2 className="hero-subtitle">National Level Technical Symposium</h2>
                <h3 className="hero-org fade-in">by IST Department, CEG</h3>
                
                <p className="hero-description">
                  Join us for an extraordinary journey of innovation and technology. Experience cutting-edge workshops, 
                  competitive events, and networking opportunities at Anna University Chennai's premier technical symposium.
                </p>
                
                <div className="hero-date">
                  <span className="date-icon">⭐</span>
                  <span className="date-text">March 12–14, 2026</span>
                </div>
                
                <div className="hero-buttons" style={{ marginTop: '30px' }}>
                  <button className="btn-explore" onClick={() => resetViews('events')}>Explore Events</button>
                  <button className="btn-explore" onClick={() => resetViews('about')}>Info</button>
                </div>
              </div>
              
              <div className="hero-right">
                {/* Tech illustration removed to fix DOM errors */}
              </div>
            </div>
          </section>

          {/* Statistics */}
          <div className="hero-stats">
            <div className="stat-card">
              <span className="stat-number">1500+</span>
              <span className="stat-label">Participants</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">15+</span>
              <span className="stat-label">Events</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">5+</span>
              <span className="stat-label">Workshops</span>
            </div>
          </div>

          {/* Organizer Footer */}
          <div className="organizer-strip">
            <span className="organizer-text">Organized By</span>
            <div className="organizer-logos">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <img src="/istlogo.png" alt="IST Department" style={{ height: '60px', width: 'auto', opacity: '0.8' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>IST Department</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <img src="/ceglogo.png" alt="CEG" style={{ height: '60px', width: 'auto', opacity: '0.8' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>CEG, Anna University</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <img src="/acalogoo.png" alt="ACA" style={{ height: '60px', width: 'auto', opacity: '0.8' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>ACA</span>
              </div>
            </div>
          </div>

          <div style={{ height: '60px' }}></div>

          {/* Footer */}
          <footer style={{ background: 'var(--bg-secondary)', padding: '2rem 0', textAlign: 'center', borderTop: '1px solid var(--border-soft)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0' }}>
                © NIRAL 2026
              </p>
            </div>
          </footer>
        </>
      ) : showEvents ? (
        <div style={{ padding: '140px 60px 80px', background: 'var(--bg-main)', minHeight: '100vh' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '40px', fontWeight: '700', background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '2rem', textAlign: 'center' }}>Upcoming Events</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
              {events.filter(e => !e.event_finished).map(event => (
                <div key={event._id} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-soft)', borderRadius: '18px', padding: '1.5rem', backdropFilter: 'blur(16px)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
                  {event.cover_photo && (
                    <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                      <img 
                        src={`http://localhost:5000/${event.cover_photo}`} 
                        alt="Event Cover" 
                        style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px' }}
                      />
                    </div>
                  )}
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>{event.title}</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    {event.description}
                  </p>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        📅 {new Date(event.date).toLocaleDateString()}
                      </span>
                      <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        🕐 {event.time}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)', color: 'var(--bg-main)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>{event.type}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{event.duration_hours}h</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>💰 Prize Pool: ₹{event.prize_pool || 0}</span>
                    <button className="btn-register-now" onClick={() => navigate('/login')}>Register</button>
                  </div>
                </div>
              ))}
            </div>
            {events.filter(e => !e.event_finished).length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <p>No published events available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      ) : showGallery ? (
        <div style={{ padding: '140px 60px 80px', background: 'var(--bg-main)', minHeight: '100vh' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {!selectedAlbum ? (
              <>
                <h1 style={{ fontSize: '40px', fontWeight: '700', background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '2rem', textAlign: 'center' }}>Gallery</h1>
                {photos.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <p>No photos available yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
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
                          style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-soft)', borderRadius: '18px', overflow: 'hidden', backdropFilter: 'blur(16px)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', cursor: 'pointer', transition: 'transform 0.2s' }}
                          onClick={() => setSelectedAlbum({ label, items })}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <img src={`http://localhost:5000/uploads/photos/${items[0].filename}`} alt={label} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                          <div style={{ padding: '1.25rem' }}>
                            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: '600', margin: '0 0 0.5rem' }}>{label}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0' }}>{items.length} photo{items.length !== 1 ? 's' : ''}</p>
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
                  <h1 style={{ fontSize: '40px', fontWeight: '700', background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0' }}>{selectedAlbum.label}</h1>
                  <button className="btn-back" onClick={() => setSelectedAlbum(null)} style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>← Back to Gallery</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  {selectedAlbum.items.map(p => (
                    <div key={p._id} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-soft)', borderRadius: '14px', overflow: 'hidden', backdropFilter: 'blur(16px)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} onClick={() => window.open(`http://localhost:5000/uploads/photos/${p.filename}`, '_blank')}>
                      <img src={`http://localhost:5000/uploads/photos/${p.filename}`} alt={p.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                      <div style={{ padding: '0.75rem' }}>
                        <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '600', margin: '0' }}>{p.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      ) : showAbout ? (
        <div style={{ padding: '140px 60px 80px', background: 'var(--bg-main)', minHeight: '100vh' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '40px', fontWeight: '700', background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '3rem', textAlign: 'center' }}>About NIRAL</h1>
            
            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-soft)', borderRadius: '18px', padding: '3rem', backdropFilter: 'blur(16px)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>History & Legacy</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '18px', lineHeight: '1.8', marginBottom: '2rem' }}>
                NIRAL is the flagship technical symposium of the Information Science and Technology Department at College of Engineering Guindy, Anna University. Since its inception, NIRAL has been a beacon of innovation, bringing together brilliant minds from across the nation to showcase cutting-edge research and technological advancements.
              </p>
              
              <h3 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem' }}>Our Journey</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: '1.7', marginBottom: '2rem' }}>
                What started as a modest technical gathering has evolved into one of South India's most prestigious technical symposiums. NIRAL has consistently pushed the boundaries of academic excellence, fostering innovation in areas such as Artificial Intelligence, Machine Learning, Cybersecurity, Data Science, and emerging technologies.
              </p>
              
              <h3 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem' }}>Vision & Mission</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: '1.7', marginBottom: '2rem' }}>
                Our vision is to create a platform where academic brilliance meets practical innovation. NIRAL serves as a catalyst for technological advancement, encouraging students and researchers to explore uncharted territories in computer science and information technology. We believe in nurturing the next generation of tech leaders who will shape the digital future.
              </p>
              
              <h3 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem' }}>Impact & Recognition</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: '1.7' }}>
                Over the years, NIRAL has attracted participation from premier institutions across India, including IITs, NITs, and leading universities. The symposium has been instrumental in launching numerous successful startups, research collaborations, and career opportunities for participants. Industry leaders and academic stalwarts regularly grace NIRAL as keynote speakers and judges, adding immense value to the learning experience.
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-soft)', borderRadius: '18px', padding: '2rem', backdropFilter: 'blur(16px)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', textAlign: 'center' }}>
                <h4 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem' }}>Years of Excellence</h4>
                <p style={{ fontSize: '32px', fontWeight: '700', background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0' }}>15+</p>
              </div>
              
              <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-soft)', borderRadius: '18px', padding: '2rem', backdropFilter: 'blur(16px)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', textAlign: 'center' }}>
                <h4 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem' }}>Participating Colleges</h4>
                <p style={{ fontSize: '32px', fontWeight: '700', background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0' }}>100+</p>
              </div>
              
              <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-soft)', borderRadius: '18px', padding: '2rem', backdropFilter: 'blur(16px)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', textAlign: 'center' }}>
                <h4 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem' }}>Total Participants</h4>
                <p style={{ fontSize: '32px', fontWeight: '700', background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0' }}>10,000+</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '140px 60px 80px', background: 'var(--bg-main)', minHeight: '100vh' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '40px', fontWeight: '700', background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '3rem', textAlign: 'center' }}>Contact Us</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
              <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-soft)', borderRadius: '18px', padding: '2rem', backdropFilter: 'blur(16px)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1.5rem', textAlign: 'center' }}>Event Coordinator</h3>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: '600', marginBottom: '0.5rem' }}>Dr. D. Narashiman</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '1rem' }}>Faculty, IST Department</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '0.5rem' }}>📧 narashiman@annauniv.edu</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>📞 +91 98765 43210</p>
                </div>
              </div>
              
              <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-soft)', borderRadius: '18px', padding: '2rem', backdropFilter: 'blur(16px)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1.5rem', textAlign: 'center' }}>Student Coordinator</h3>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: '600', marginBottom: '0.5rem' }}>Arjun</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '1rem' }}>Final Year, IST</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '0.5rem' }}>📧 arjun.niral2026@gmail.com</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>📞 +91 87654 32109</p>
                </div>
              </div>
              
              <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-soft)', borderRadius: '18px', padding: '2rem', backdropFilter: 'blur(16px)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1.5rem', textAlign: 'center' }}>Technical Support</h3>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: '600', marginBottom: '0.5rem' }}>Rahul</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '1rem' }}>Technical Lead</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '0.5rem' }}>📧 tech.niral2026@gmail.com</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>📞 +91 76543 21098</p>
                </div>
              </div>
            </div>
            
            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-soft)', borderRadius: '18px', padding: '3rem', backdropFilter: 'blur(16px)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', textAlign: 'center' }}>
              <h3 style={{ fontSize: '28px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>General Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem' }}>Official Email</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>📧 niral2026@annauniv.edu</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem' }}>Department Office</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>📞 +91 44 2235 8000</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem' }}>Address</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>IST Department<br/>College of Engineering Guindy<br/>Anna University, Chennai - 600025</p>
                </div>
              </div>
              
              <div style={{ marginTop: '2rem' }}>
                <h4 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem' }}>Follow Us</h4>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>🌐 Website: niral2026.annauniv.edu</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>📱 Instagram: @niral_2026</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>📘 Facebook: NIRAL 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}