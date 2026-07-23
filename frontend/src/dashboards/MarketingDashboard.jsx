import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

export default function MarketingDashboard({ onBackToParent }) {
  const [activeView, setActiveView] = useState('overview');
  const [allFiles, setAllFiles] = useState([]);
  const [generalFiles, setGeneralFiles] = useState([]);
  const [eventFiles, setEventFiles] = useState([]);

  const handleBackToOverview = () => setActiveView('overview');

  useEffect(() => {
    fetchAllFiles();
  }, []);

  const fetchAllFiles = async () => {
    try {
      const res = await axios.get('/designs');
      setAllFiles(res.data);
      setEventFiles(res.data.filter(f => f.category === 'event'));
      setGeneralFiles(res.data.filter(f => f.category === 'general'));
    } catch (e) { console.error(e); }
  };

  const handleDownload = (file) => {
    const link = document.createElement('a');
    link.href = `http://localhost:5000/uploads/designs/${file.filename}`;
    link.download = file.original_name || file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderFileTable = (files, showEvent = false) => (
    <div style={{ background: 'rgba(28, 26, 46, 0.85)', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', marginTop: '1.5rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: 'rgba(15, 14, 34, 0.8)' }}>
          <tr>
            {['Name', 'Type', ...(showEvent ? ['Event'] : []), 'Uploaded', 'Actions'].map(h => (
              <th key={h} style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#B8B6D8' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {files.map(f => (
            <tr key={f._id}>
              <td style={{ padding: '1rem', color: '#F5F7FF', fontWeight: '600' }}>{f.name}</td>
              <td style={{ padding: '1rem', color: '#F5F7FF' }}>
                <span style={{
                  background: f.file_type?.includes('pdf') ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)',
                  color: f.file_type?.includes('pdf') ? '#FCA5A5' : '#93C5FD',
                  padding: '0.25rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem'
                }}>
                  {f.file_type?.includes('pdf') ? 'PDF' : 'Image'}
                </span>
              </td>
              {showEvent && (
                <td style={{ padding: '1rem', color: '#F5F7FF' }}>{f.event_id?.title || '-'}</td>
              )}
              <td style={{ padding: '1rem', color: '#F5F7FF', fontSize: '0.85rem' }}>
                {new Date(f.createdAt).toLocaleDateString()}
              </td>
              <td style={{ padding: '1rem' }}>
                <a
                  href={`http://localhost:5000/uploads/designs/${f.filename}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginRight: '0.5rem', textDecoration: 'none' }}
                >
                  View
                </a>
                <button className="btn btn-success" onClick={() => handleDownload(f)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                  Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderOverview = () => (
    <div className="card-grid fade-in">
      <div className="card">
        <h3 className="card-title">Marketing Overview</h3>
        <div className="card-content">
          <p><strong>Total Design Files:</strong> {allFiles.length}</p>
          <p><strong>Event Specific:</strong> {eventFiles.length}</p>
          <p><strong>General:</strong> {generalFiles.length}</p>
        </div>
      </div>
      <div className="card">
        <h3 className="card-title">Actions</h3>
        <div className="card-content">
          <button className="btn btn-primary" onClick={() => setActiveView('eventFiles')} style={{ margin: '0.25rem', width: '100%' }}>
            Event Specific Files
          </button>
          <button className="btn btn-primary" onClick={() => setActiveView('generalFiles')} style={{ margin: '0.25rem', width: '100%' }}>
            General Files
          </button>
          <button className="btn btn-success" onClick={() => { setActiveView('viewAll'); fetchAllFiles(); }} style={{ margin: '0.25rem', width: '100%' }}>
            View All Files
          </button>
        </div>
      </div>
    </div>
  );

  const renderEventFiles = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Event Specific Files ({eventFiles.length})</h3>
        <button onClick={handleBackToOverview} style={{ background: 'none', border: 'none', color: '#00E5FF', fontSize: '0.85rem', cursor: 'pointer', padding: '0.25rem 0', pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>
          ← Back to Overview
        </button>
      </div>
      {eventFiles.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No event-specific files available</p>
        </div>
      ) : renderFileTable(eventFiles, true)}
    </div>
  );

  const renderGeneralFiles = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">General Files ({generalFiles.length})</h3>
        <button onClick={handleBackToOverview} style={{ background: 'none', border: 'none', color: '#00E5FF', fontSize: '0.85rem', cursor: 'pointer', padding: '0.25rem 0', pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>
          ← Back to Overview
        </button>
      </div>
      {generalFiles.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No general files available</p>
        </div>
      ) : renderFileTable(generalFiles)}
    </div>
  );

  const renderViewAll = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">All Design Files ({allFiles.length})</h3>
        <button onClick={handleBackToOverview} style={{ background: 'none', border: 'none', color: '#00E5FF', fontSize: '0.85rem', cursor: 'pointer', padding: '0.25rem 0', pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>
          ← Back to Overview
        </button>
      </div>
      {allFiles.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No files available</p>
        </div>
      ) : renderFileTable(allFiles, true)}
    </div>
  );

  return (
    <div>
      {activeView === 'overview' && renderOverview()}
      {activeView === 'eventFiles' && renderEventFiles()}
      {activeView === 'generalFiles' && renderGeneralFiles()}
      {activeView === 'viewAll' && renderViewAll()}
    </div>
  );
}
