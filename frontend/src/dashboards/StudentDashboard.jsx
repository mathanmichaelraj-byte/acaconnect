import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axios';

export default function StudentDashboard() {
  const { logout } = useContext(AuthContext);
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
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">🎓 Student Dashboard</h1>
        <button className="btn btn-logout" onClick={logout}>
          🚪 Logout
        </button>
      </div>
      <div className="card-grid fade-in">
        <div className="card">
          <h3 className="card-title">📅 Available Events</h3>
          <div className="card-content">
            <p>🔍 No events available at the moment</p>
            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
              Check back later for upcoming events!
            </p>
          </div>
        </div>
        <div className="card">
          <h3 className="card-title">📊 My Registrations</h3>
          <div className="card-content">
            <p><strong>Registered:</strong> 0</p>
            <p><strong>Attended:</strong> 0</p>
            <p><strong>Certificates:</strong> 0</p>
          </div>
        </div>
        <div className="card">
          <h3 className="card-title">⚡ Quick Actions</h3>
          <div className="card-content">
            <button className="btn btn-primary" style={{ margin: '0.25rem', width: '100%' }}>
              🔍 Browse Events
            </button>
            <button className="btn btn-success" style={{ margin: '0.25rem', width: '100%' }}>
              📜 My Certificates
            </button>
            <button className="btn btn-secondary" style={{ margin: '0.25rem', width: '100%' }}>
              📱 Event Suggestions
            </button>
          </div>
        </div>
      </div>
      <div className="card fade-in" style={{ marginTop: '1.5rem' }}>
        <h3 className="card-title">🚀 Coming Soon</h3>
        <div className="card-content">
          <p>Exciting features in development:</p>
          <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
            <li>📝 Event Registration System</li>
            <li>📍 Location-based Attendance</li>
            <li>💬 Event Chat & Q&A</li>
            <li>📜 Digital Certificate Generation</li>
          </ul>
        </div>
      </div>

      {/* Chatbot Widget */}
      {chatOpen && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '20px',
          width: '350px',
          height: '500px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000
        }}>
          <div style={{
            padding: '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '12px 12px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>🤖 NIRAL Assistant</h3>
            <button 
              onClick={() => setChatOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >×</button>
          </div>
          
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '15px',
            backgroundColor: '#f5f5f5'
          }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
                <p>👋 Hi! I'm NIRAL Assistant.</p>
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
                  backgroundColor: msg.role === 'user' ? '#667eea' : 'white',
                  color: msg.role === 'user' ? 'white' : '#333',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ textAlign: 'center', color: '#666' }}>
                <p>Thinking...</p>
              </div>
            )}
          </div>
          
          <div style={{
            padding: '15px',
            borderTop: '1px solid #ddd',
            display: 'flex',
            gap: '10px'
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
                border: '1px solid #ddd',
                borderRadius: '8px',
                outline: 'none'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !inputMessage.trim()}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading || !inputMessage.trim() ? 0.6 : 1
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          fontSize: '1.8rem',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {chatOpen ? '×' : '💬'}
      </button>
    </div>
  );
}