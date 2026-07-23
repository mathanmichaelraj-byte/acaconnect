import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

export default function AlumniDashboard({ onBackToParent }) {
  const [stats, setStats] = useState({ totalMembers: 0 });
  const [members, setMembers] = useState([]);
  const [activeView, setActiveView] = useState('overview');
  const [form, setForm] = useState({ name: '', contact: '', email: '', linkedin: '', batch: '', location: '', organization: '', position: '' });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleBackToOverview = () => {
    setActiveView('overview');
    setEditingId(null);
    setForm({ name: '', contact: '', email: '', linkedin: '', batch: '', location: '', organization: '', position: '' });
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await axios.get('/alumni');
      setMembers(response.data);
      setStats(prev => ({ ...prev, totalMembers: response.data.length }));
    } catch (error) {
      console.error('Failed to fetch alumni members:', error);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.contact || !form.email || !form.batch) {
      return alert('Name, Contact, Email and Batch are required');
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await axios.put(`/alumni/${editingId}`, form);
        alert('Alumni member updated successfully!');
      } else {
        await axios.post('/alumni', form);
        alert('Alumni member added successfully!');
      }
      setForm({ name: '', contact: '', email: '', linkedin: '', batch: '', location: '', organization: '', position: '' });
      setEditingId(null);
      fetchMembers();
      setActiveView('members');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save alumni member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (member) => {
    setForm({
      name: member.name,
      contact: member.contact,
      email: member.email,
      linkedin: member.linkedin || '',
      batch: member.batch,
      location: member.location || '',
      organization: member.organization || '',
      position: member.position || ''
    });
    setEditingId(member._id);
    setActiveView('addMember');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this alumni member?')) return;
    try {
      await axios.delete(`/alumni/${id}`);
      alert('Alumni member deleted successfully!');
      fetchMembers();
    } catch (error) {
      alert('Failed to delete alumni member');
    }
  };

  const renderOverview = () => (
    <div className="card-grid fade-in">
      <div className="card">
        <h3 className="card-title">Alumni Overview</h3>
        <div className="card-content">
          <p><strong>Total Members:</strong> {stats.totalMembers}</p>
        </div>
      </div>
      <div className="card">
        <h3 className="card-title">Actions</h3>
        <div className="card-content">
          <button className="btn btn-primary" onClick={() => setActiveView('addMember')} style={{ margin: '0.25rem', width: '100%' }}>
            Add Alumni Member
          </button>
          <button className="btn btn-success" onClick={() => { setActiveView('members'); fetchMembers(); }} style={{ margin: '0.25rem', width: '100%' }}>
            View All Members
          </button>

        </div>
      </div>
    </div>
  );

  const renderAddMember = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">{editingId ? 'Edit Alumni Member' : 'Add Alumni Member'}</h3>
        <button
          onClick={handleBackToOverview}
          style={{ background: 'none', border: 'none', color: '#00E5FF', fontSize: '0.85rem', cursor: 'pointer', padding: '0.25rem 0', pointerEvents: 'auto', zIndex: 10, position: 'relative' }}
        >
          ← Back to Overview
        </button>
      </div>

      <div className="card">
        <h3 className="card-title">Member Details</h3>
        <div className="card-content">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input type="text" className="form-input" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Number *</label>
              <input type="text" className="form-input" placeholder="Contact Number" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" className="form-input" placeholder="Email Address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">LinkedIn Profile</label>
              <input type="text" className="form-input" placeholder="LinkedIn URL" value={form.linkedin} onChange={e => setForm({ ...form, linkedin: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Batch *</label>
              <input type="text" className="form-input" placeholder="e.g. 2020-2024" value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input type="text" className="form-input" placeholder="Current City" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Organization</label>
              <input type="text" className="form-input" placeholder="Current Working Organization" value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Position</label>
              <input type="text" className="form-input" placeholder="Current Position/Role" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button className="btn btn-success" onClick={handleSubmit} disabled={submitting} style={{ flex: 1 }}>
              {submitting ? 'Saving...' : editingId ? 'Update Member' : 'Add Member'}
            </button>
            <button className="btn btn-secondary" onClick={handleBackToOverview} style={{ flex: 1 }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMembers = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Alumni Members ({members.length})</h3>
        <button
          onClick={handleBackToOverview}
          style={{ background: 'none', border: 'none', color: '#00E5FF', fontSize: '0.85rem', cursor: 'pointer', padding: '0.25rem 0', pointerEvents: 'auto', zIndex: 10, position: 'relative' }}
        >
          ← Back to Overview
        </button>
      </div>

      {members.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>No Alumni Members</h3>
          <p style={{ color: 'var(--text-muted)' }}>No alumni members have been added yet</p>
          <button className="btn btn-primary" onClick={() => setActiveView('addMember')} style={{ marginTop: '1rem' }}>
            Add First Member
          </button>
        </div>
      ) : (
        <div className="table-container" style={{ background: 'rgba(28, 26, 46, 0.85)', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', background: 'transparent' }}>
            <thead style={{ background: 'rgba(15, 14, 34, 0.8)' }}>
              <tr>
                {['Name', 'Contact', 'Email', 'Batch', 'Location', 'Organization', 'Position', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#B8B6D8' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member._id}>
                  <td style={{ padding: '1rem', color: '#F5F7FF' }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>{member.name}</div>
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#00E5FF' }}>LinkedIn</a>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: '#F5F7FF' }}>{member.contact}</td>
                  <td style={{ padding: '1rem', color: '#F5F7FF', fontSize: '0.9rem' }}>{member.email}</td>
                  <td style={{ padding: '1rem', color: '#F5F7FF' }}>{member.batch}</td>
                  <td style={{ padding: '1rem', color: '#F5F7FF' }}>{member.location || '-'}</td>
                  <td style={{ padding: '1rem', color: '#F5F7FF' }}>{member.organization || '-'}</td>
                  <td style={{ padding: '1rem', color: '#F5F7FF' }}>{member.position || '-'}</td>
                  <td style={{ padding: '1rem' }}>
                    <button className="btn btn-primary" onClick={() => handleEdit(member)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginRight: '0.5rem' }}>
                      Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(member._id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {activeView === 'overview' && renderOverview()}
      {activeView === 'addMember' && renderAddMember()}
      {activeView === 'members' && renderMembers()}

    </div>
  );
}
