import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

export default function DesignDashboard({ onBackToParent }) {
  const [activeView, setActiveView] = useState('overview');
  const [events, setEvents] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventFiles, setEventFiles] = useState([]);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleBackToOverview = () => {
    setActiveView('overview');
    setSelectedEvent(null);
    setUploadFiles([]);
    setFileNames([]);
  };

  useEffect(() => {
    fetchAllFiles();
  }, []);

  const fetchAllFiles = async () => {
    try {
      const res = await axios.get('/designs');
      setAllFiles(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/events');
      setEvents(res.data.filter(e => e.status === 'PUBLISHED' && !e.event_finished));
    } catch (e) { console.error(e); }
  };

  const fetchEventFiles = async (eventId) => {
    try {
      const res = await axios.get(`/designs/event/${eventId}`);
      setEventFiles(res.data);
    } catch (e) { console.error(e); }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setUploadFiles(files);
    setFileNames(files.map(f => f.name.replace(/\.[^/.]+$/, '')));
  };

  const handleUpload = async (category, eventId = null) => {
    if (uploadFiles.length === 0) return alert('Please select files');
    if (fileNames.some(n => !n.trim())) return alert('Please provide names for all files');

    setUploading(true);
    try {
      const formData = new FormData();
      uploadFiles.forEach(f => formData.append('files', f));
      formData.append('category', category);
      formData.append('names', JSON.stringify(fileNames));
      if (eventId) formData.append('event_id', eventId);

      await axios.post('/designs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Files uploaded successfully!');
      setUploadFiles([]);
      setFileNames([]);
      fetchAllFiles();
      if (eventId) fetchEventFiles(eventId);
    } catch (e) {
      alert(e.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      await axios.delete(`/designs/${id}`);
      fetchAllFiles();
      if (selectedEvent) fetchEventFiles(selectedEvent._id);
    } catch (e) { alert('Delete failed'); }
  };

  const eventCount = allFiles.filter(f => f.category === 'event').length;
  const generalCount = allFiles.filter(f => f.category === 'general').length;

  const renderUploadForm = (category, eventId = null) => (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <h3 className="card-title">Upload Files</h3>
      <div className="card-content">
        <div className="form-group">
          <label className="form-label">Select Files (Images / PDFs)</label>
          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="form-input"
            style={{ padding: '0.5rem' }}
          />
        </div>

        {uploadFiles.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <label className="form-label">File Names</label>
            {uploadFiles.map((file, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', minWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </span>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Display name"
                  value={fileNames[i] || ''}
                  onChange={e => {
                    const updated = [...fileNames];
                    updated[i] = e.target.value;
                    setFileNames(updated);
                  }}
                  style={{ flex: 1 }}
                />
              </div>
            ))}
          </div>
        )}

        <button
          className="btn btn-success"
          onClick={() => handleUpload(category, eventId)}
          disabled={uploading || uploadFiles.length === 0}
          style={{ marginTop: '1rem', width: '100%' }}
        >
          {uploading ? 'Uploading...' : `Upload ${uploadFiles.length} File${uploadFiles.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );

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
                <button className="btn btn-danger" onClick={() => handleDelete(f._id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                  Delete
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
        <h3 className="card-title">Design Overview</h3>
        <div className="card-content">
          <p><strong>Total Uploads:</strong> {allFiles.length}</p>
          <p><strong>Event Specific:</strong> {eventCount}</p>
          <p><strong>General:</strong> {generalCount}</p>
        </div>
      </div>
      <div className="card">
        <h3 className="card-title">Actions</h3>
        <div className="card-content">
          <button className="btn btn-primary" onClick={() => { setActiveView('eventSpecific'); fetchEvents(); }} style={{ margin: '0.25rem', width: '100%' }}>
            Event Specific
          </button>
          <button className="btn btn-primary" onClick={() => setActiveView('general')} style={{ margin: '0.25rem', width: '100%' }}>
            General
          </button>
          <button className="btn btn-success" onClick={() => { setActiveView('viewAll'); fetchAllFiles(); }} style={{ margin: '0.25rem', width: '100%' }}>
            View All Uploads
          </button>
        </div>
      </div>
    </div>
  );

  const renderEventSpecific = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">{selectedEvent ? selectedEvent.title : 'Select an Event'}</h3>
        <button
          onClick={() => { if (selectedEvent) { setSelectedEvent(null); setUploadFiles([]); setFileNames([]); } else handleBackToOverview(); }}
          style={{ background: 'none', border: 'none', color: '#00E5FF', fontSize: '0.85rem', cursor: 'pointer', padding: '0.25rem 0', pointerEvents: 'auto', zIndex: 10, position: 'relative' }}
        >
          {selectedEvent ? '← Back to Events' : '← Back to Overview'}
        </button>
      </div>

      {!selectedEvent ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {events.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>No active published events</p>
            </div>
          ) : events.map(event => (
            <div
              key={event._id}
              className="card"
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              onClick={() => { setSelectedEvent(event); fetchEventFiles(event._id); }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <h3 className="card-title">{event.title}</h3>
              <div className="card-content">
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{new Date(event.date).toLocaleDateString()} - {event.type}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {renderUploadForm('event', selectedEvent._id)}
          {eventFiles.length > 0 ? (
            <>
              <h4 style={{ color: 'var(--text-primary)', marginTop: '2rem' }}>Uploaded Files ({eventFiles.length})</h4>
              {renderFileTable(eventFiles)}
            </>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', marginTop: '1.5rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>No files uploaded for this event yet</p>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderGeneral = () => {
    const generalFiles = allFiles.filter(f => f.category === 'general');
    return (
      <div className="fade-in">
        <div className="nav-header">
          <h3 className="nav-title">General Uploads</h3>
          <button
            onClick={handleBackToOverview}
            style={{ background: 'none', border: 'none', color: '#00E5FF', fontSize: '0.85rem', cursor: 'pointer', padding: '0.25rem 0', pointerEvents: 'auto', zIndex: 10, position: 'relative' }}
          >
            ← Back to Overview
          </button>
        </div>

        {renderUploadForm('general')}

        {generalFiles.length > 0 ? (
          <>
            <h4 style={{ color: 'var(--text-primary)', marginTop: '2rem' }}>Uploaded Files ({generalFiles.length})</h4>
            {renderFileTable(generalFiles)}
          </>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', marginTop: '1.5rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>No general files uploaded yet</p>
          </div>
        )}
      </div>
    );
  };

  const renderViewAll = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">All Uploads ({allFiles.length})</h3>
        <button
          onClick={handleBackToOverview}
          style={{ background: 'none', border: 'none', color: '#00E5FF', fontSize: '0.85rem', cursor: 'pointer', padding: '0.25rem 0', pointerEvents: 'auto', zIndex: 10, position: 'relative' }}
        >
          ← Back to Overview
        </button>
      </div>

      {allFiles.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No files uploaded yet</p>
        </div>
      ) : renderFileTable(allFiles, true)}
    </div>
  );

  return (
    <div>
      {activeView === 'overview' && renderOverview()}
      {activeView === 'eventSpecific' && renderEventSpecific()}
      {activeView === 'general' && renderGeneral()}
      {activeView === 'viewAll' && renderViewAll()}
    </div>
  );
}
