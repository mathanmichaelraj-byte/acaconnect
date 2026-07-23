import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

export default function PhotographyDashboard({ onBackToParent }) {
  const [activeView, setActiveView] = useState('overview');
  const [events, setEvents] = useState([]);
  const [allPhotos, setAllPhotos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [eventPhotos, setEventPhotos] = useState([]);
  const [categoryPhotos, setCategoryPhotos] = useState([]);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleBackToOverview = () => {
    setActiveView('overview');
    setSelectedEvent(null);
    setSelectedCategory(null);
    setUploadFiles([]);
    setFileNames([]);
  };

  useEffect(() => { fetchAllPhotos(); }, []);

  const fetchAllPhotos = async () => {
    try { const res = await axios.get('/photos'); setAllPhotos(res.data); } catch (e) { console.error(e); }
  };

  const fetchFinishedEvents = async () => {
    try {
      const res = await axios.get('/events');
      setEvents(res.data.filter(e => e.status === 'PUBLISHED' && e.event_finished));
    } catch (e) { console.error(e); }
  };

  const fetchCategories = async () => {
    try { const res = await axios.get('/photos/categories'); setCategories(res.data); } catch (e) { console.error(e); }
  };

  const fetchEventPhotos = async (eventId) => {
    try { const res = await axios.get(`/photos/event/${eventId}`); setEventPhotos(res.data); } catch (e) { console.error(e); }
  };

  const fetchCategoryPhotos = async (catId) => {
    try { const res = await axios.get(`/photos/category/${catId}`); setCategoryPhotos(res.data); } catch (e) { console.error(e); }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setUploadFiles(files);
    setFileNames(files.map(f => f.name.replace(/\.[^/.]+$/, '')));
  };

  const handleUpload = async (uploadType, id) => {
    if (uploadFiles.length === 0) return alert('Please select photos');
    if (fileNames.some(n => !n.trim())) return alert('Please provide names for all photos');
    setUploading(true);
    try {
      const formData = new FormData();
      uploadFiles.forEach(f => formData.append('photos', f));
      formData.append('upload_type', uploadType);
      formData.append('names', JSON.stringify(fileNames));
      if (uploadType === 'event') formData.append('event_id', id);
      else formData.append('category_id', id);

      await axios.post('/photos/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Photos uploaded successfully!');
      setUploadFiles([]);
      setFileNames([]);
      fetchAllPhotos();
      if (uploadType === 'event') fetchEventPhotos(id);
      else fetchCategoryPhotos(id);
    } catch (e) {
      alert(e.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      await axios.delete(`/photos/${id}`);
      fetchAllPhotos();
      if (selectedEvent) fetchEventPhotos(selectedEvent._id);
      if (selectedCategory) fetchCategoryPhotos(selectedCategory._id);
    } catch (e) { alert('Delete failed'); }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return alert('Enter a category name');
    try {
      await axios.post('/photos/categories', { name: newCategoryName.trim() });
      setNewCategoryName('');
      fetchCategories();
    } catch (e) { alert(e.response?.data?.message || 'Failed to create category'); }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await axios.delete(`/photos/categories/${id}`);
      fetchCategories();
    } catch (e) { alert(e.response?.data?.message || 'Delete failed'); }
  };

  const eventsWithPhotos = [...new Set(allPhotos.filter(p => p.upload_type === 'event').map(p => p.event_id?._id))].length;
  const categoryCount = [...new Set(allPhotos.filter(p => p.upload_type === 'category').map(p => p.category_id?._id))].length;

  const renderUploadForm = () => (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <h3 className="card-title">Upload Photos</h3>
      <div className="card-content">
        <div className="form-group">
          <label className="form-label">Select Photos</label>
          <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="form-input" style={{ padding: '0.5rem' }} />
        </div>
        {uploadFiles.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <label className="form-label">Photo Names</label>
            {uploadFiles.map((file, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                <img src={URL.createObjectURL(file)} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', minWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                <input type="text" className="form-input" placeholder="Photo name" value={fileNames[i] || ''} onChange={e => { const u = [...fileNames]; u[i] = e.target.value; setFileNames(u); }} style={{ flex: 1 }} />
              </div>
            ))}
          </div>
        )}
        <button
          className="btn btn-success"
          onClick={() => handleUpload(selectedEvent ? 'event' : 'category', selectedEvent ? selectedEvent._id : selectedCategory._id)}
          disabled={uploading || uploadFiles.length === 0}
          style={{ marginTop: '1rem', width: '100%' }}
        >
          {uploading ? 'Uploading...' : `Upload ${uploadFiles.length} Photo${uploadFiles.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );

  const renderPhotoGrid = (photos) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
      {photos.map(p => (
        <div key={p._id} style={{ background: 'rgba(28, 26, 46, 0.85)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
          <img src={`http://localhost:5000/uploads/photos/${p.filename}`} alt={p.name} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
          <div style={{ padding: '0.75rem' }}>
            <p style={{ color: '#F5F7FF', fontSize: '0.85rem', fontWeight: '600', margin: '0 0 0.5rem' }}>{p.name}</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <a href={`http://localhost:5000/uploads/photos/${p.filename}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', textDecoration: 'none', flex: 1, textAlign: 'center' }}>View</a>
              <button className="btn btn-danger" onClick={() => handleDelete(p._id)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', flex: 1 }}>Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderOverview = () => (
    <div className="card-grid fade-in">
      <div className="card">
        <h3 className="card-title">Photography Overview</h3>
        <div className="card-content">
          <p><strong>Total Photos:</strong> {allPhotos.length}</p>
          <p><strong>Events Covered:</strong> {eventsWithPhotos}</p>
          <p><strong>Categories Used:</strong> {categoryCount}</p>
        </div>
      </div>
      <div className="card">
        <h3 className="card-title">Actions</h3>
        <div className="card-content">
          <button className="btn btn-primary" onClick={() => { setActiveView('eventSelect'); fetchFinishedEvents(); }} style={{ margin: '0.25rem', width: '100%' }}>
            Event Specific
          </button>
          <button className="btn btn-primary" onClick={() => { setActiveView('categorySelect'); fetchCategories(); }} style={{ margin: '0.25rem', width: '100%' }}>
            Category Specific
          </button>
          <button className="btn btn-success" onClick={() => { setActiveView('viewAll'); fetchAllPhotos(); }} style={{ margin: '0.25rem', width: '100%' }}>
            View All Photos
          </button>
        </div>
      </div>
    </div>
  );

  const renderEventSelect = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">{selectedEvent ? selectedEvent.title : 'Select a Finished Event'}</h3>
        <button onClick={() => { if (selectedEvent) { setSelectedEvent(null); setUploadFiles([]); setFileNames([]); } else handleBackToOverview(); }} style={{ background: 'none', border: 'none', color: '#00E5FF', fontSize: '0.85rem', cursor: 'pointer', padding: '0.25rem 0', pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>
          {selectedEvent ? '← Back to Events' : '← Back to Overview'}
        </button>
      </div>
      {!selectedEvent ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {events.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}><p style={{ color: 'var(--text-muted)' }}>No finished events found</p></div>
          ) : events.map(event => (
            <div key={event._id} className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => { setSelectedEvent(event); fetchEventPhotos(event._id); }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              <h3 className="card-title">{event.title}</h3>
              <div className="card-content"><p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{new Date(event.date).toLocaleDateString()} - {event.type}</p></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {renderUploadForm()}
          {eventPhotos.length > 0 ? (
            <><h4 style={{ color: 'var(--text-primary)', marginTop: '2rem' }}>Uploaded Photos ({eventPhotos.length})</h4>{renderPhotoGrid(eventPhotos)}</>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', marginTop: '1.5rem' }}><p style={{ color: 'var(--text-muted)' }}>No photos uploaded for this event yet</p></div>
          )}
        </>
      )}
    </div>
  );

  const renderCategorySelect = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">{selectedCategory ? selectedCategory.name : 'Photo Categories'}</h3>
        <button onClick={() => { if (selectedCategory) { setSelectedCategory(null); setUploadFiles([]); setFileNames([]); } else handleBackToOverview(); }} style={{ background: 'none', border: 'none', color: '#00E5FF', fontSize: '0.85rem', cursor: 'pointer', padding: '0.25rem 0', pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>
          {selectedCategory ? '← Back to Categories' : '← Back to Overview'}
        </button>
      </div>
      {!selectedCategory ? (
        <>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 className="card-title">Create New Category</h3>
            <div className="card-content">
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="text" className="form-input" placeholder="Category name" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} style={{ flex: 1 }} />
                <button className="btn btn-success" onClick={handleCreateCategory}>Create</button>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {categories.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2rem' }}><p style={{ color: 'var(--text-muted)' }}>No categories created yet</p></div>
            ) : categories.map(cat => (
              <div key={cat._id} className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s', position: 'relative' }} onClick={() => { setSelectedCategory(cat); fetchCategoryPhotos(cat._id); }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                <h3 className="card-title">{cat.name}</h3>
                <div className="card-content"><p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Created {new Date(cat.createdAt).toLocaleDateString()}</p></div>
                <button className="btn btn-danger" onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat._id); }} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Delete</button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {renderUploadForm()}
          {categoryPhotos.length > 0 ? (
            <><h4 style={{ color: 'var(--text-primary)', marginTop: '2rem' }}>Photos in "{selectedCategory.name}" ({categoryPhotos.length})</h4>{renderPhotoGrid(categoryPhotos)}</>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', marginTop: '1.5rem' }}><p style={{ color: 'var(--text-muted)' }}>No photos in this category yet</p></div>
          )}
        </>
      )}
    </div>
  );

  const renderViewAll = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">All Photos ({allPhotos.length})</h3>
        <button onClick={handleBackToOverview} style={{ background: 'none', border: 'none', color: '#00E5FF', fontSize: '0.85rem', cursor: 'pointer', padding: '0.25rem 0', pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>← Back to Overview</button>
      </div>
      {allPhotos.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}><p style={{ color: 'var(--text-muted)' }}>No photos uploaded yet</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          {allPhotos.map(p => (
            <div key={p._id} style={{ background: 'rgba(28, 26, 46, 0.85)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
              <img src={`http://localhost:5000/uploads/photos/${p.filename}`} alt={p.name} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
              <div style={{ padding: '0.75rem' }}>
                <p style={{ color: '#F5F7FF', fontSize: '0.85rem', fontWeight: '600', margin: '0 0 0.25rem' }}>{p.name}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0 0 0.5rem' }}>
                  {p.upload_type === 'event' ? p.event_id?.title : p.category_id?.name || 'Unknown'}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a href={`http://localhost:5000/uploads/photos/${p.filename}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', textDecoration: 'none', flex: 1, textAlign: 'center' }}>View</a>
                  <button className="btn btn-danger" onClick={() => handleDelete(p._id)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', flex: 1 }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div>
      {activeView === 'overview' && renderOverview()}
      {activeView === 'eventSelect' && renderEventSelect()}
      {activeView === 'categorySelect' && renderCategorySelect()}
      {activeView === 'viewAll' && renderViewAll()}
    </div>
  );
}
