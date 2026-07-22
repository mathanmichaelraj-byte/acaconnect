import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import PaymentModal from '../components/PaymentModal';

// Notification Dropdown Component
const NotificationDropdown = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    
    // Handle click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/participant-notifications');
      if (response.data.success) {
        setNotifications(response.data.notifications.slice(0, 5)); // Show only latest 5
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/participant-notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('/participant-notifications/mark-all-read');
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    return '';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div 
      ref={dropdownRef}
      style={{
      position: 'absolute',
      top: '100%',
      right: '0',
      background: 'var(--bg-glass)',
      border: '1px solid var(--border-soft)',
      borderRadius: '12px',
      padding: '1rem',
      minWidth: '300px',
      maxHeight: '400px',
      overflowY: 'auto',
      backdropFilter: 'blur(16px)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ color: 'var(--text-primary)', margin: '0' }}>Notifications</h4>
        {notifications.some(n => !n.is_read) && (
          <button
            onClick={markAllAsRead}
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '0.25rem 0.5rem',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Mark All Read
          </button>
        )}
      </div>
      
      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Loading...</p>
      ) : notifications.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No notifications</p>
      ) : (
        notifications.map((notif) => (
          <div 
            key={notif._id} 
            onClick={() => !notif.is_read && markAsRead(notif._id)}
            style={{
              padding: '0.75rem',
              marginBottom: '0.5rem',
              background: notif.is_read ? 'rgba(255,255,255,0.05)' : 'rgba(0, 229, 255, 0.1)',
              borderRadius: '8px',
              borderLeft: notif.is_read ? '3px solid var(--border-soft)' : '3px solid var(--accent-gold)',
              cursor: notif.is_read ? 'default' : 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <p style={{ 
                  color: 'var(--text-primary)', 
                  fontSize: '13px', 
                  margin: '0 0 0.25rem 0',
                  fontWeight: notif.is_read ? '400' : '500',
                  lineHeight: '1.3'
                }}>
                  {notif.message}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                    {formatDate(notif.createdAt)}
                  </small>
                  {notif.event_id && (
                    <span style={{
                      background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)',
                      color: 'var(--bg-main)',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '6px',
                      fontSize: '9px',
                      fontWeight: '600'
                    }}>
                      {notif.event_id.title}
                    </span>
                  )}
                </div>
              </div>
              {!notif.is_read && (
                <div style={{
                  width: '6px',
                  height: '6px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  borderRadius: '50%',
                  flexShrink: 0,
                  marginTop: '0.25rem'
                }} />
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default function ParticipantHomePage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [showEvents, setShowEvents] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showMyRegistrations, setShowMyRegistrations] = useState(false);
  const [showMyCertificates, setShowMyCertificates] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [showFindEvents, setShowFindEvents] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [suggestedEvents, setSuggestedEvents] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [expandedPayment, setExpandedPayment] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const fetchGalleryPhotos = async () => {
    try {
      const response = await axios.get('/photos/public');
      setGalleryPhotos(response.data);
    } catch (error) {
      console.error('Failed to fetch photos:', error);
      setGalleryPhotos([]);
    }
  };

  const resetParticipantViews = (view) => {
    setShowEvents(view === 'events');
    setShowAbout(view === 'about');
    setShowContact(view === 'contact');
    setShowMyRegistrations(view === 'registrations');
    setShowMyCertificates(view === 'certificates');
    setShowGallery(view === 'gallery');
    setShowFindEvents(false);
    setSelectedAlbum(null);
    if (view === 'gallery') fetchGalleryPhotos();
  };

  const allTags = [
    'Programming & Coding',
    'Competitive Coding',
    'Database & SQL',
    'DSA & Problem Solving',
    'Debugging & Logic',
    'Cyber Security',
    'Web Development',
    'UI/UX Design',
    'Project & Presentation',
    'Technical Quiz',
    'General Quiz',
    'Management & Strategy',
    'Creative & Marketing',
    'Photography & Media',
    'Fun & Engagement',
    'Communication & Voice'
  ];

  useEffect(() => {
    fetchEvents();
    fetchRegistrations();
    fetchCertificates();
    fetchUnreadNotificationCount();
  }, []);

  const fetchUnreadNotificationCount = async () => {
    try {
      console.log('Fetching unread notification count...');
      const response = await axios.get('/participant-notifications/unread-count');
      console.log('Unread count response:', response.data);
      if (response.data.success) {
        setUnreadNotificationCount(response.data.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread notification count:', error);
      console.error('Error response:', error.response);
    }
  };

  const fetchCertificates = async () => {
    try {
      const response = await axios.get('/certificates/my-certificates');
      if (response.data.success) {
        setCertificates(response.data.certificates);
      }
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
      setCertificates([]);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const response = await axios.get('/events/my-registrations');
      // Filter to only show completed payments
      const completedRegistrations = response.data.filter(
        reg => reg.payment_status === 'COMPLETED'
      );
      setRegistrations(completedRegistrations);
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
      setRegistrations([]);
    }
  };

  const fetchEvents = async () => {
    try {
      console.log('Fetching events...');
      console.log('User:', user);
      console.log('Token:', localStorage.getItem('token'));
      
      const response = await axios.get('/events/published-with-registration');
      console.log('Events response:', response.data);
      
      // Also fetch all registrations to check verification status
      const allRegsResponse = await axios.get('/registrations/my-registrations');
      const allRegistrations = allRegsResponse.data.registrations || [];
      
      // Map events with their registration status
      const eventsWithStatus = response.data.map(event => {
        const registration = allRegistrations.find(reg => reg.event_id?._id === event._id);
        return {
          ...event,
          registrationStatus: registration ? registration.payment_status : null,
          verificationStatus: registration ? registration.verification_status : null
        };
      });
      
      console.log('Events with status:', eventsWithStatus);
      setEvents(eventsWithStatus);
    } catch (error) {
      console.error('Failed to fetch events with registration:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      // Fallback: try to fetch published events without authentication
      try {
        console.log('Trying fallback: fetching published events without registration status...');
        const fallbackResponse = await axios.get('/events/published');
        console.log('Fallback events response:', fallbackResponse.data);
        setEvents(fallbackResponse.data);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        setEvents([]);
      }
    }
  };

  const handleRegister = async (event) => {
    setSelectedEvent(event);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedEvent(null);
    fetchEvents(); // Refresh events
    fetchRegistrations(); // Refresh registrations
  };

  const handlePendingPaymentClick = (e, registration) => {
    e.preventDefault();
    e.stopPropagation();
    // Store registration data in localStorage for payment page
    localStorage.setItem('pendingPayment', JSON.stringify({
      event: registration.event_id,
      registration: registration
    }));
    // Use navigate instead of window.location
    navigate('/payment');
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const suggestEvents = () => {
    if (selectedTags.length === 0) {
      alert('Please select at least one tag to get suggestions');
      return;
    }
    const suggested = events
      .filter(event => event.tags && event.tags.some(tag => selectedTags.includes(tag)))
      .map(event => ({
        ...event,
        similarity: event.tags.filter(tag => selectedTags.includes(tag)).length / selectedTags.length
      }))
      .sort((a, b) => b.similarity - a.similarity);
    setSuggestedEvents(suggested);
    alert(`Found ${suggested.length} events matching your interests!`);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await axios.post('/chatbot/chat', { query: inputMessage });
      const botMessage = { 
        role: 'assistant', 
        content: response.data.response || 'Sorry, I could not process that.' 
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { 
        role: 'assistant', 
        content: 'Chatbot service is currently unavailable. Please try again later.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="niral-home">
      {/* Header Navigation */}
      <header className="niral-header">
        <div className="niral-nav-content">
          <div className="nav-left">
            <img src="/nirallogo.png" alt="NIRAL Logo" className="nav-logo" />
            <span style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: '600', marginLeft: '1rem' }}>
              Welcome, {user?.name}
            </span>
          </div>
          
          <nav className="nav-center">
            <button className={`nav-link ${!showEvents && !showAbout && !showContact && !showMyRegistrations && !showMyCertificates && !showGallery ? 'active' : ''}`} onClick={() => resetParticipantViews('home')}>Home</button>
            <button className={`nav-link ${showEvents ? 'active' : ''}`} onClick={() => resetParticipantViews('events')}>Events</button>
            <button className={`nav-link ${showMyRegistrations ? 'active' : ''}`} onClick={() => resetParticipantViews('registrations')}>My Registrations</button>
            <button className={`nav-link ${showMyCertificates ? 'active' : ''}`} onClick={() => resetParticipantViews('certificates')}>My Certificates</button>
            <button className={`nav-link ${showGallery ? 'active' : ''}`} onClick={() => resetParticipantViews('gallery')}>Gallery</button>
            <button className={`nav-link ${showAbout ? 'active' : ''}`} onClick={() => resetParticipantViews('about')}>About</button>
            <button className={`nav-link ${showContact ? 'active' : ''}`} onClick={() => resetParticipantViews('contact')}>Contact</button>
          </nav>
          
          <div className="nav-right">
            <div style={{ position: 'relative', marginRight: '1rem' }}>
              <button 
                className="btn-back" 
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ position: 'relative' }}
              >
                🔔
                {unreadNotificationCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: 'var(--accent-danger)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <NotificationDropdown 
                  onClose={() => {
                    setShowNotifications(false);
                    fetchUnreadNotificationCount();
                  }}
                />
              )}
            </div>
            
            <button className="btn-back" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {!showEvents && !showAbout && !showContact && !showMyRegistrations && !showMyCertificates && !showGallery ? (
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
                  <button className="btn-explore" onClick={() => {setShowEvents(true); setShowAbout(false); setShowContact(false)}}>Explore Events</button>
                  <button className="btn-explore" onClick={() => {setShowAbout(true); setShowEvents(false); setShowContact(false)}}>Info</button>
                </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '40px', fontWeight: '700', background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0' }}>
                Available Events
              </h1>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Find Events button clicked!');
                  setShowFindEvents(true);
                }}
                style={{ 
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  zIndex: 10,
                  position: 'relative'
                }}
              >
                Find Events
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
              {events.filter(event => !event.event_finished).map(event => (
                <div key={event._id} style={{ 
                  background: 'var(--bg-glass)', 
                  border: '1px solid var(--border-soft)', 
                  borderRadius: '18px', 
                  padding: '1.5rem', 
                  backdropFilter: 'blur(16px)', 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}>
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
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem', lineHeight: '1.5', flex: '1' }}>
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
                    {event.hospitality?.venue_allocated && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                        📍 <strong>Venue:</strong> {event.hospitality.venue_details}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '1.1rem' }}>💰 Prize: ₹{event.prize_pool || 0}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        color: event.registration_fee > 0 ? 'var(--accent-gold)' : '#4ade80', 
                        fontWeight: '700',
                        fontSize: '1.2rem',
                        marginBottom: '0.25rem'
                      }}>
                        {event.registration_fee > 0 ? `₹${event.registration_fee}` : 'FREE'}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Registration Fee</div>
                    </div>
                  </div>
                  {event.registrationStatus === 'COMPLETED' ? (
                    <button 
                      className="btn-register-now" 
                      style={{ 
                        width: '100%', 
                        background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                        cursor: 'default',
                        marginTop: 'auto'
                      }}
                      disabled
                    >
                      Registered
                    </button>
                  ) : event.registrationStatus === 'VERIFICATION_PENDING' ? (
                    <button 
                      className="btn-register-now" 
                      style={{ 
                        width: '100%', 
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        cursor: 'default',
                        marginTop: 'auto'
                      }}
                      disabled
                    >
                      Awaiting Verification
                    </button>
                  ) : event.registration_status === 'CLOSED' ? (
                    <button 
                      className="btn-register-now" 
                      style={{ 
                        width: '100%', 
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        cursor: 'default',
                        marginTop: 'auto'
                      }}
                      disabled
                    >
                      Registration Closed
                    </button>
                  ) : event.registration_status === 'PAUSED' ? (
                    <button 
                      className="btn-register-now" 
                      style={{ 
                        width: '100%', 
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        cursor: 'default',
                        marginTop: 'auto'
                      }}
                      disabled
                    >
                      Registration Paused
                    </button>
                  ) : (
                    <button className="btn-register-now" onClick={() => handleRegister(event)} style={{ width: '100%', marginTop: 'auto' }}>Register Now</button>
                  )}
                </div>
              ))}
            </div>
            {events.filter(e => !e.event_finished).length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <p>No available events at the moment.</p>
              </div>
            )}

            {events.filter(e => e.event_finished).length > 0 && (
              <>
                <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '3rem', marginBottom: '1.5rem' }}>Past Events</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                  {events.filter(e => e.event_finished).map(event => (
                    <div key={event._id} style={{ 
                      background: 'var(--bg-glass)', 
                      border: '1px solid var(--border-soft)', 
                      borderRadius: '18px', 
                      padding: '1.5rem', 
                      backdropFilter: 'blur(16px)', 
                      boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%'
                    }}>
                      {event.cover_photo && (
                        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                          <img src={`http://localhost:5000/${event.cover_photo}`} alt="Event Cover" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px' }} />
                        </div>
                      )}
                      <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>{event.title}</h3>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem', lineHeight: '1.5', flex: '1' }}>{event.description}</p>
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{new Date(event.date).toLocaleDateString()}</span>
                          <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{event.time}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)', color: 'var(--bg-main)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>{event.type}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{event.duration_hours}h</span>
                        </div>
                      </div>
                      <button 
                        className="btn-register-now" 
                        style={{ 
                          width: '100%', 
                          background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                          cursor: 'default',
                          marginTop: 'auto'
                        }}
                        disabled
                      >
                        Event Finished
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Find Events Modal Overlay */}
          {showFindEvents && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingTop: '120px'
            }}>
              <div style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-soft)',
                borderRadius: '18px',
                padding: '2rem',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                maxWidth: '800px',
                width: '90%',
                maxHeight: '80vh',
                overflowY: 'auto'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h3 style={{ color: 'var(--text-primary)', margin: '0', fontSize: '24px', fontWeight: '600' }}>Select Your Interests</h3>
                  <button 
                    onClick={() => setShowFindEvents(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '24px',
                      cursor: 'pointer',
                      padding: '0.5rem'
                    }}
                  >
                    ✕
                  </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  {allTags.map(tag => (
                    <label key={tag} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-primary)', padding: '0.5rem', borderRadius: '8px', background: selectedTags.includes(tag) ? 'rgba(0, 229, 255, 0.1)' : 'transparent', border: selectedTags.includes(tag) ? '1px solid rgba(0, 229, 255, 0.3)' : '1px solid transparent' }}>
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => handleTagToggle(tag)}
                        style={{ accentColor: 'var(--accent-gold)' }}
                      />
                      <span style={{ fontSize: '14px' }}>{tag}</span>
                    </label>
                  ))}
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <button 
                    className="btn-register-now" 
                    onClick={suggestEvents}
                    style={{ fontSize: '16px', padding: '12px 32px', cursor: 'pointer' }}
                  >
                    Suggest Events
                  </button>
                </div>
                
                {suggestedEvents.length > 0 && (
                  <div style={{ marginTop: '2rem' }}>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '20px', fontWeight: '600' }}>Suggested Events for You:</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {suggestedEvents.filter(event => event.similarity > 0).map((event, index) => (
                        <div key={event._id} style={{ 
                          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                          border: '1px solid rgba(102, 126, 234, 0.3)',
                          padding: '1rem 1.5rem', 
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          transition: 'all 0.3s ease'
                        }}>
                          <div style={{
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            color: 'white',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            fontWeight: '700',
                            flexShrink: 0
                          }}>
                            #{index + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                              {event.title}
                            </div>
                            {event.similarity !== undefined && event.similarity !== null ? (
                              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                Match Score: {(event.similarity * 100).toFixed(1)}%
                                {event.user_similarity && event.pattern_similarity && (
                                  <span style={{ marginLeft: '0.5rem', opacity: 0.7 }}>
                                    (Direct: {(event.user_similarity * 100).toFixed(0)}% | Pattern: {(event.pattern_similarity * 100).toFixed(0)}%)
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                Match Score: 0.0%
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : showGallery ? (
        <div style={{ padding: '140px 60px 80px', background: 'var(--bg-main)', minHeight: '100vh' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {!selectedAlbum ? (
              <>
                <h1 style={{ fontSize: '40px', fontWeight: '700', background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '2rem', textAlign: 'center' }}>Gallery</h1>
                {galleryPhotos.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}><p>No photos available yet.</p></div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {(() => {
                      const grouped = {};
                      galleryPhotos.forEach(p => {
                        const label = p.upload_type === 'event' ? (p.event_id?.title || 'Event') : (p.category_id?.name || 'General');
                        if (!grouped[label]) grouped[label] = [];
                        grouped[label].push(p);
                      });
                      return Object.entries(grouped).map(([label, items]) => (
                        <div key={label} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-soft)', borderRadius: '18px', overflow: 'hidden', backdropFilter: 'blur(16px)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => setSelectedAlbum({ label, items })} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
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
                NIRAL (National Innovative Research and Academic League) is the flagship technical symposium of the Information Science and Technology Department at College of Engineering Guindy, Anna University. Since its inception, NIRAL has been a beacon of innovation, bringing together brilliant minds from across the nation to showcase cutting-edge research and technological advancements.
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
      ) : showMyRegistrations ? (
        <div style={{ padding: '140px 60px 80px', background: 'var(--bg-main)', minHeight: '100vh' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '40px', fontWeight: '700', background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '3rem', textAlign: 'center' }}>My Registrations</h1>
            
            {registrations.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', alignItems: 'start' }}>
                {registrations.map(reg => (
                  <div key={reg._id} style={{ 
                    background: 'var(--bg-glass)', 
                    border: '1px solid var(--border-soft)', 
                    borderRadius: '18px', 
                    padding: '1.5rem', 
                    backdropFilter: 'blur(16px)', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100%',
                    alignSelf: 'stretch'
                  }}>
                    {reg.event_id?.cover_photo && (
                      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                        <img 
                          src={`http://localhost:5000/${reg.event_id.cover_photo}`} 
                          alt="Event Cover" 
                          style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px' }}
                        />
                      </div>
                    )}
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>{reg.event_id?.title}</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem', lineHeight: '1.5', flex: '1' }}>
                      {reg.event_id?.description}
                    </p>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                          📅 {reg.event_id?.date ? new Date(reg.event_id.date).toLocaleDateString() : 'Date not available'}
                        </span>
                        <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                          🕐 {reg.event_id?.time || 'Time not available'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)', color: 'var(--bg-main)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>{reg.event_id?.type}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{reg.event_id?.duration_hours}h</span>
                      </div>
                      {reg.event_id?.hospitality?.venue_allocated && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                          📍 <strong>Venue:</strong> {reg.event_id.hospitality.venue_details}
                        </div>
                      )}
                      {reg.event_id?.hr?.volunteers_allocated && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                          👥 <strong>Event Volunteers:</strong>
                          {reg.event_id.hr.allocated_volunteers?.length > 0 && (
                            <div style={{ marginLeft: '1rem', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                              {reg.event_id.hr.allocated_volunteers.map((vol, idx) => (
                                <div key={idx} style={{ marginBottom: '0.2rem' }}>
                                  • {vol.volunteer_name} - {vol.volunteer_role}
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                                    {vol.volunteer_contact} | {vol.volunteer_department}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {reg.event_id.hr.allocated_judges?.length > 0 && (
                            <div style={{ marginLeft: '1rem', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                              <strong>Judges:</strong>
                              {reg.event_id.hr.allocated_judges.map((judge, idx) => (
                                <div key={idx} style={{ marginBottom: '0.2rem' }}>
                                  • {judge.judge_name} - {judge.judge_expertise}
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                                    {judge.judge_contact} | {judge.judge_designation}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '1.1rem' }}>💰 Prize: ₹{reg.event_id?.prize_pool || 0}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          color: reg.event_id?.registration_fee > 0 ? 'var(--accent-gold)' : '#4ade80', 
                          fontWeight: '700',
                          fontSize: '1.2rem',
                          marginBottom: '0.25rem'
                        }}>
                          {reg.event_id?.registration_fee > 0 ? `₹${reg.event_id.registration_fee}` : 'FREE'}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Registration Fee</div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Registered: {new Date(reg.registration_date).toLocaleDateString()}</span>
                      <span 
                        style={{
                          background: reg.payment_status === 'COMPLETED' ? 'linear-gradient(135deg, #4ade80, #22c55e)' : 
                                     reg.payment_status === 'PENDING' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 
                                     'linear-gradient(135deg, #ef4444, #dc2626)',
                          color: 'white',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          cursor: reg.payment_status === 'PENDING' ? 'pointer' : 'default'
                        }}
                        onClick={(e) => reg.payment_status === 'PENDING' && handlePendingPaymentClick(e, reg)}
                      >
                        {reg.payment_status}
                      </span>
                    </div>
                    
                    {/* Payment Details Toggle - Always show for consistency */}
                    <div>
                      <button
                        onClick={() => setExpandedPayment(expandedPayment === reg._id ? null : reg._id)}
                        style={{
                          width: '100%',
                          background: reg.payment_id ? 'rgba(0, 229, 255, 0.1)' : 'rgba(128, 128, 128, 0.1)',
                          border: reg.payment_id ? '1px solid rgba(0, 229, 255, 0.3)' : '1px solid rgba(128, 128, 128, 0.3)',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          color: reg.payment_id ? 'var(--text-primary)' : 'var(--text-muted)',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: reg.payment_id ? 'pointer' : 'default',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.3s ease',
                          opacity: reg.payment_id ? 1 : 0.6
                        }}
                        disabled={!reg.payment_id}
                      >
                        <span>{reg.payment_id ? 'View Payment Details' : 'No Payment Required'}</span>
                        {reg.payment_id && (
                          <span style={{ transform: expandedPayment === reg._id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>▼</span>
                        )}
                      </button>
                      
                      {expandedPayment === reg._id && reg.payment_id && (
                        <div style={{ 
                          background: 'rgba(0, 229, 255, 0.05)', 
                          border: '1px solid rgba(0, 229, 255, 0.2)', 
                          borderRadius: '0 0 8px 8px', 
                          padding: '1rem',
                          marginTop: '-1px'
                        }}>
                          <div style={{ display: 'grid', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Payment ID:</span>
                              <span style={{ color: 'var(--text-primary)', fontSize: '0.8rem', fontFamily: 'monospace' }}>{reg.payment_id}</span>
                            </div>
                            {reg.payment_date && (
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Payment Date:</span>
                                <span style={{ color: 'var(--text-primary)', fontSize: '0.8rem' }}>{new Date(reg.payment_date).toLocaleString()}</span>
                              </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Amount Paid:</span>
                              <span style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', fontWeight: '600' }}>₹{reg.registration_fee}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Payment Method:</span>
                              <span style={{ color: 'var(--text-primary)', fontSize: '0.8rem' }}>{reg.payment_method}</span>
                            </div>
                            {reg.verification_status && (
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Verification:</span>
                                <span style={{ 
                                  color: reg.verification_status === 'APPROVED' ? '#4ade80' : 
                                         reg.verification_status === 'REJECTED' ? '#ef4444' : '#f59e0b',
                                  fontSize: '0.8rem',
                                  fontWeight: '600'
                                }}>
                                  {reg.verification_status}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '18px', marginBottom: '1rem' }}>No registrations found.</p>
                <p>Register for events to see them here!</p>
                <button 
                  className="btn-register-now" 
                  onClick={() => {setShowEvents(true); setShowMyRegistrations(false); setShowAbout(false); setShowContact(false); setShowMyCertificates(false)}}
                  style={{ marginTop: '1rem' }}
                >
                  Browse Events
                </button>
              </div>
            )}
          </div>
        </div>
      ) : showMyCertificates ? (
        <div style={{ padding: '140px 60px 80px', background: 'var(--bg-main)', minHeight: '100vh' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '40px', fontWeight: '700', background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '3rem', textAlign: 'center' }}>My Certificates</h1>
            
            {certificates.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', alignItems: 'start' }}>
                {certificates.map(cert => (
                  <div key={cert._id} style={{ 
                    background: 'var(--bg-glass)', 
                    border: '1px solid var(--border-soft)', 
                    borderRadius: '18px', 
                    padding: '1.5rem', 
                    backdropFilter: 'blur(16px)', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100%',
                    alignSelf: 'stretch'
                  }}>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        fontSize: '32px'
                      }}>
                        📜
                      </div>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Certificate of Participation</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>NIRAL 2026 Technical Symposium</p>
                    </div>
                    
                    <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>{cert.event_name}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Participant: {cert.participant_name}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>College: {cert.participant_college}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Event Date: {new Date(cert.event_date).toLocaleDateString()}</p>
                    </div>
                    
                    <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Generated: {new Date(cert.generated_at).toLocaleDateString()}</p>
                      {cert.downloaded_at && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Last Downloaded: {new Date(cert.downloaded_at).toLocaleDateString()}</p>
                      )}
                    </div>
                    
                    <button 
                      className="btn-register-now" 
                      onClick={async () => {
                        try {
                          const eventId = cert.event_id?._id || cert.event_id;
                          console.log('Downloading certificate for:', cert.participant_id, eventId);
                          
                          // Try to download the certificate file directly
                          const response = await axios.get(`/certificates/download/${cert._id}`, {
                            responseType: 'blob'
                          });
                          
                          console.log('Download response:', response);
                          
                          // Create blob link to download
                          const url = window.URL.createObjectURL(new Blob([response.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', `certificate_${cert.participant_name}_${cert.event_name}.pdf`);
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          window.URL.revokeObjectURL(url);
                        } catch (error) {
                          console.error('Failed to download certificate:', error);
                          console.error('Error response:', error.response?.data);
                          alert('Failed to download certificate. Please try again.');
                        }
                      }}
                      style={{ 
                        width: '100%', 
                        marginTop: 'auto',
                        background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      📄 Download Certificate
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  background: 'rgba(255, 215, 0, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 2rem',
                  fontSize: '48px'
                }}>
                  📜
                </div>
                <p style={{ fontSize: '18px', marginBottom: '1rem' }}>No certificates available yet.</p>
                <p style={{ marginBottom: '2rem' }}>Certificates are generated automatically after your attendance is marked as present by the techops team.</p>
                <button 
                  className="btn-register-now" 
                  onClick={() => {setShowEvents(true); setShowMyCertificates(false); setShowMyRegistrations(false); setShowAbout(false); setShowContact(false)}}
                  style={{ marginTop: '1rem' }}
                >
                  Browse Events
                </button>
              </div>
            )}
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

      {/* Chatbot Widget */}
      {chatOpen && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '20px',
          width: '350px',
          height: '500px',
          backgroundColor: 'var(--bg-glass)',
          border: '1px solid var(--border-soft)',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000
        }}>
          <div style={{
            padding: '15px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            borderRadius: '12px 12px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>NIRAL Assistant</h3>
            <button 
              onClick={() => setChatOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >×</button>
          </div>
          
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '15px',
            backgroundColor: 'var(--bg-glass)',
            backdropFilter: 'blur(16px)'
          }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '20px' }}>
                <p style={{ color: 'var(--text-primary)' }}>Hi! I'm NIRAL Assistant.</p>
                <p style={{ fontSize: '0.9rem' }}>Ask me about events, registration, or anything!</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                marginBottom: '10px',
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '10px 15px',
                  borderRadius: '12px',
                  backgroundColor: msg.role === 'user' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'var(--bg-main)',
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'var(--bg-main)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--border-soft)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>Thinking...</p>
              </div>
            )}
          </div>
          
          <div style={{
            padding: '15px',
            borderTop: '1px solid var(--border-soft)',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            gap: '10px',
            borderRadius: '0 0 12px 12px'
          }}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything..."
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid var(--border-soft)',
                borderRadius: '8px',
                outline: 'none',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-primary)'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !inputMessage.trim()}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading || !inputMessage.trim() ? 0.6 : 1,
                fontWeight: '600'
              }}
            >Send</button>
          </div>
        </div>
      )}

      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          border: 'none',
          fontSize: '1.8rem',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {chatOpen ? '×' : '💬'}
      </button>



      {/* Payment Modal */}
      {showPaymentModal && selectedEvent && (
        <PaymentModal 
          event={selectedEvent}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedEvent(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}