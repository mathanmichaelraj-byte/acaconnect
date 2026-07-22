import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axios';

export default function StudentDashboard() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    try {
      const response = await axios.post('/chatbot/chat', { query: inputMessage });
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response || 'Sorry, I could not process that.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Chatbot service is currently unavailable. Please try again later.' }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="dashboard-container">
      <div className="container">
        <div className="dashboard-header">
          <h1>Student Dashboard</h1>
          <button className="btn btn-secondary" onClick={logout}>Sign Out</button>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><h3>Registered</h3><span className="stat-number">0</span></div>
          <div className="stat-card"><h3>Attended</h3><span className="stat-number">0</span></div>
          <div className="stat-card"><h3>Certificates</h3><span className="stat-number">0</span></div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Available Events</h3>
            <p className="text-muted">No events available at the moment. Check back later for upcoming events.</p>
          </div>
          <div className="dashboard-card">
            <h3>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="btn btn-primary btn-block" onClick={() => navigate('/events')}>Browse Events</button>
              <button className="btn btn-secondary btn-block">My Certificates</button>
              <button className="btn btn-secondary btn-block">Event Suggestions</button>
            </div>
          </div>
          <div className="dashboard-card">
            <h3>Coming Soon</h3>
            <p className="text-muted" style={{ marginBottom: '0.5rem' }}>Features in development:</p>
            <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <li>Event Registration System</li>
              <li>Location-based Attendance</li>
              <li>Event Chat & Q&A</li>
              <li>Digital Certificate Generation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Chatbot Widget */}
      {chatOpen && (
        <div style={{
          position: 'fixed', bottom: 100, right: 20, width: 350, height: 500,
          backgroundColor: 'white', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column', zIndex: 1000, border: '1px solid var(--border-default)'
        }}>
          <div style={{ padding: '15px', background: 'var(--accent-primary)', color: 'white', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>NIRAL Assistant</h3>
            <button onClick={() => setChatOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>x</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 15, backgroundColor: '#f8fafc' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 20 }}>
                <p>Hi! I'm NIRAL Assistant.</p>
                <p style={{ fontSize: '0.9rem' }}>Ask me about events, registration, or anything!</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} style={{ marginBottom: 10, display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '80%', padding: '10px 15px', borderRadius: 12, backgroundColor: msg.role === 'user' ? 'var(--accent-primary)' : 'white', color: msg.role === 'user' ? 'white' : 'var(--text-primary)', boxShadow: 'var(--shadow-sm)', whiteSpace: 'pre-wrap', border: msg.role !== 'user' ? '1px solid var(--border-default)' : 'none' }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}><p>Thinking...</p></div>}
          </div>
          <div style={{ padding: 15, borderTop: '1px solid var(--border-default)', display: 'flex', gap: 10 }}>
            <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="Ask me anything..." className="form-input" style={{ flex: 1, padding: '10px', fontSize: '0.9rem' }} />
            <button onClick={sendMessage} disabled={loading || !inputMessage.trim()} className="btn btn-primary">Send</button>
          </div>
        </div>
      )}

      <button onClick={() => setChatOpen(!chatOpen)} style={{
        position: 'fixed', bottom: 20, right: 20, width: 56, height: 56, borderRadius: '50%',
        background: 'var(--accent-primary)', color: 'white', border: 'none', fontSize: '1.5rem',
        cursor: 'pointer', boxShadow: 'var(--shadow-md)', zIndex: 999,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {chatOpen ? 'x' : '?'}
      </button>
    </div>
  );
}
