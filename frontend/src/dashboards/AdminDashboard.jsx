import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';

export default function AdminDashboard() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalEvents: 0, activeUsers: 0, pendingApprovals: 0 });
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  });
  const [events, setEvents] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [stationeryItems, setStationeryItems] = useState([]);
  const [technicalItems, setTechnicalItems] = useState([]);
  const [refreshmentItems, setRefreshmentItems] = useState([]);
  const [activeView, setActiveView] = useState('overview');
  const [newType, setNewType] = useState({
    name: '',
    description: '',
    default_requirements: {
      volunteers_needed: 0,
      rooms_needed: 0,
      refreshments_needed: false,
      stationary_needed: false,
      goodies_needed: false,
      physical_certificate: false,
      trophies_needed: false
    }
  });
  const [newStationeryItem, setNewStationeryItem] = useState({
    name: '',
    description: '',
    unit: 'pieces'
  });
  const [editingStationeryItem, setEditingStationeryItem] = useState(null);
  const [newTechnicalItem, setNewTechnicalItem] = useState({
    name: '',
    description: '',
    unit: 'pieces'
  });
  const [editingTechnicalItem, setEditingTechnicalItem] = useState(null);
  const [newRefreshmentItem, setNewRefreshmentItem] = useState({
    name: '',
    description: '',
    unit: 'pieces'
  });
  const [editingRefreshmentItem, setEditingRefreshmentItem] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeView === 'eventTypes') {
      fetchEventTypes();
    } else if (activeView === 'users') {
      fetchUsersData();
    } else if (activeView === 'stationery') {
      fetchStationeryItems();
    } else if (activeView === 'technical') {
      fetchTechnicalItems();
    } else if (activeView === 'refreshments') {
      fetchRefreshmentItems();
    }
  }, [activeView]);

  const handleBackToOverview = () => {
    console.log('Back button clicked, current view:', activeView);
    setActiveView('overview');
  };

  const fetchUsersData = async () => {
    try {
      const usersResponse = await axios.get('/admin/users');
      setUsers(usersResponse.data);
      
      const hardcodedRoles = [
        { _id: '1', name: 'ADMIN' },
        { _id: '2', name: 'EVENT_TEAM' },
        { _id: '3', name: 'STUDENT' },
        { _id: '4', name: 'TREASURER' },
        { _id: '5', name: 'GENERAL_SECRETARY' },
        { _id: '6', name: 'CHAIRPERSON' },
        { _id: '7', name: 'PARTICIPANT' },
        { _id: '8', name: 'LOGISTICS' },
        { _id: '9', name: 'HR' },
        { _id: '10', name: 'HOSPITALITY' },
        { _id: '11', name: 'TECHOPS' }
      ];
      setRoles(hardcodedRoles);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchUsers = async () => {
    setActiveView('users');
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/admin/events');
      setEvents(response.data);
      setActiveView('events');
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/admin/users', newUser);
      alert('User created successfully!');
      setNewUser({ name: '', email: '', password: '', role: '' });
      fetchUsersData();
    } catch (error) {
      alert('Failed to create user: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const fetchEventTypes = async () => {
    try {
      const response = await axios.get('/events/types/all');
      setEventTypes(response.data);
    } catch (error) {
      console.error('Failed to fetch event types:', error);
    }
  };

  const handleCreateEventType = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/events/types', newType);
      alert('✅ Event type created successfully!');
      setNewType({
        name: '', description: '',
        default_requirements: {
          volunteers_needed: 0, rooms_needed: 0, refreshments_needed: false,
          stationary_needed: false, goodies_needed: false, physical_certificate: false, trophies_needed: false
        }
      });
      fetchEventTypes();
    } catch (error) {
      alert('❌ Failed to create event type: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const fetchStationeryItems = async () => {
    try {
      const response = await axios.get('/stationery');
      setStationeryItems(response.data);
    } catch (error) {
      console.error('Failed to fetch stationery items:', error);
    }
  };

  const handleCreateStationeryItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/stationery', newStationeryItem);
      alert('✅ Stationery item created successfully!');
      setNewStationeryItem({ name: '', description: '', unit: 'pieces' });
      fetchStationeryItems();
    } catch (error) {
      alert('❌ Failed to create stationery item: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleDeleteStationeryItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this stationery item?')) {
      try {
        await axios.delete(`/stationery/${itemId}`);
        alert('✅ Stationery item deleted successfully!');
        fetchStationeryItems();
      } catch (error) {
        alert('❌ Failed to delete stationery item: ' + (error.response?.data?.message || 'Unknown error'));
      }
    }
  };

  const handleEditStationeryItem = (item) => {
    setEditingStationeryItem(item);
  };

  const handleUpdateStationeryItem = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/stationery/${editingStationeryItem._id}`, editingStationeryItem);
      alert('✅ Stationery item updated successfully!');
      setEditingStationeryItem(null);
      fetchStationeryItems();
    } catch (error) {
      alert('❌ Failed to update stationery item: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleCancelEdit = () => {
    setEditingStationeryItem(null);
  };

  // Technical Items Functions
  const fetchTechnicalItems = async () => {
    try {
      console.log('Fetching technical items...');
      const response = await axios.get('/technical');
      console.log('Technical items response:', response.data);
      setTechnicalItems(response.data);
    } catch (error) {
      console.error('Failed to fetch technical items:', error);
      console.error('Error response:', error.response?.data);
    }
  };

  const handleCreateTechnicalItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/technical', newTechnicalItem);
      alert('✅ Technical item created successfully!');
      setNewTechnicalItem({ name: '', description: '', unit: 'pieces' });
      fetchTechnicalItems();
    } catch (error) {
      alert('❌ Failed to create technical item: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleEditTechnicalItem = (item) => {
    setEditingTechnicalItem(item);
  };

  const handleUpdateTechnicalItem = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/technical/${editingTechnicalItem._id}`, editingTechnicalItem);
      alert('✅ Technical item updated successfully!');
      setEditingTechnicalItem(null);
      fetchTechnicalItems();
    } catch (error) {
      alert('❌ Failed to update technical item: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleDeleteTechnicalItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this technical item?')) {
      try {
        await axios.delete(`/technical/${itemId}`);
        alert('✅ Technical item deleted successfully!');
        fetchTechnicalItems();
      } catch (error) {
        alert('❌ Failed to delete technical item: ' + (error.response?.data?.message || 'Unknown error'));
      }
    }
  };

  // Refreshment Items Functions
  const fetchRefreshmentItems = async () => {
    try {
      console.log('Fetching refreshment items...');
      const response = await axios.get('/refreshments');
      console.log('Refreshment items response:', response.data);
      setRefreshmentItems(response.data);
    } catch (error) {
      console.error('Failed to fetch refreshment items:', error);
      console.error('Error response:', error.response?.data);
    }
  };

  const handleCreateRefreshmentItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/refreshments', newRefreshmentItem);
      alert('✅ Refreshment item created successfully!');
      setNewRefreshmentItem({ name: '', description: '', unit: 'pieces' });
      fetchRefreshmentItems();
    } catch (error) {
      alert('❌ Failed to create refreshment item: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleEditRefreshmentItem = (item) => {
    setEditingRefreshmentItem(item);
  };

  const handleUpdateRefreshmentItem = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/refreshments/${editingRefreshmentItem._id}`, editingRefreshmentItem);
      alert('✅ Refreshment item updated successfully!');
      setEditingRefreshmentItem(null);
      fetchRefreshmentItems();
    } catch (error) {
      alert('❌ Failed to update refreshment item: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleDeleteRefreshmentItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this refreshment item?')) {
      try {
        await axios.delete(`/refreshments/${itemId}`);
        alert('✅ Refreshment item deleted successfully!');
        fetchRefreshmentItems();
      } catch (error) {
        alert('❌ Failed to delete refreshment item: ' + (error.response?.data?.message || 'Unknown error'));
      }
    }
  };

  const renderOverview = () => (
    <div className="card-grid fade-in">
      <div className="card">
        <h3 className="card-title">System Overview</h3>
        <div className="card-content">
          <p><strong>Total Events:</strong> {stats.totalEvents}</p>
          <p><strong>Active Users:</strong> {stats.activeUsers}</p>
          <p><strong>Pending Approvals:</strong> {stats.pendingApprovals}</p>
        </div>
      </div>
      <div className="card">
        <h3 className="card-title">Actions</h3>
        <div className="card-content">
          <button className="btn btn-primary" onClick={fetchEvents} style={{ margin: '0.25rem', width: '100%' }}>
            View All Events
          </button>
          <button className="btn btn-success" onClick={fetchUsers} style={{ margin: '0.25rem', width: '100%' }}>
            Manage Users
          </button>
          <button className="btn btn-primary" onClick={() => setActiveView('eventTypes')} style={{ margin: '0.25rem', width: '100%' }}>
            Manage Event Types
          </button>
          <button className="btn btn-success" onClick={() => setActiveView('stationery')} style={{ margin: '0.25rem', width: '100%' }}>
            Manage Stationery
          </button>
          <button className="btn btn-primary" onClick={() => setActiveView('technical')} style={{ margin: '0.25rem', width: '100%' }}>
            Manage Technical Items
          </button>
          <button className="btn btn-success" onClick={() => setActiveView('refreshments')} style={{ margin: '0.25rem', width: '100%' }}>
            Manage Refreshments
          </button>
        </div>
      </div>
    </div>
  );

  const renderTechnical = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Technical Items Management</h3>
        <button onClick={handleBackToOverview} style={{ background: 'none', border: 'none', color: '#00E5FF', fontSize: '0.85rem', cursor: 'pointer', padding: '0.25rem 0', pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>← Back to Overview</button>
      </div>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h4 className="card-title">Add New Technical Item</h4>
        <form onSubmit={handleCreateTechnicalItem} className="form-container" style={{ padding: 0 }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Item Name *</label>
              <input type="text" className="form-input" placeholder="e.g., Projector" required value={newTechnicalItem.name} onChange={(e) => setNewTechnicalItem({...newTechnicalItem, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select className="form-select" value={newTechnicalItem.unit} onChange={(e) => setNewTechnicalItem({...newTechnicalItem, unit: e.target.value})}>
                <option value="pieces">Pieces</option>
                <option value="sets">Sets</option>
                <option value="units">Units</option>
                <option value="items">Items</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Add Technical Item</button>
        </form>
      </div>
      <div className="card">
        <h4 className="card-title">Existing Technical Items ({technicalItems.length})</h4>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Name</th><th>Unit</th><th>Actions</th></tr></thead>
            <tbody>
              {technicalItems.length === 0 ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No technical items found</td></tr>
              ) : (
                technicalItems.map(item => (
                  <tr key={item._id}>
                    <td>{editingTechnicalItem?._id === item._id ? <input type="text" value={editingTechnicalItem.name} onChange={(e) => setEditingTechnicalItem({...editingTechnicalItem, name: e.target.value})} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #00E5FF', borderRadius: '4px', padding: '0.25rem', color: '#F5F7FF' }} /> : <strong>{item.name}</strong>}</td>
                    <td>{editingTechnicalItem?._id === item._id ? <select value={editingTechnicalItem.unit} onChange={(e) => setEditingTechnicalItem({...editingTechnicalItem, unit: e.target.value})} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #00E5FF', borderRadius: '4px', padding: '0.25rem', color: '#F5F7FF' }}><option value="pieces">Pieces</option><option value="sets">Sets</option><option value="units">Units</option><option value="items">Items</option></select> : item.unit}</td>
                    <td>{editingTechnicalItem?._id === item._id ? (<><button className="btn btn-success" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', marginRight: '0.25rem' }} onClick={handleUpdateTechnicalItem}>Save</button><button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setEditingTechnicalItem(null)}>Cancel</button></>) : (<><button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', marginRight: '0.25rem' }} onClick={() => handleEditTechnicalItem(item)}>Edit</button><button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleDeleteTechnicalItem(item._id)}>Delete</button></>)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRefreshments = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Refreshment Items Management</h3>
        <button onClick={handleBackToOverview} style={{ background: 'none', border: 'none', color: '#00E5FF', fontSize: '0.85rem', cursor: 'pointer', padding: '0.25rem 0', pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>← Back to Overview</button>
      </div>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h4 className="card-title">Add New Refreshment Item</h4>
        <form onSubmit={handleCreateRefreshmentItem} className="form-container" style={{ padding: 0 }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Item Name *</label>
              <input type="text" className="form-input" placeholder="e.g., Water bottles" required value={newRefreshmentItem.name} onChange={(e) => setNewRefreshmentItem({...newRefreshmentItem, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select className="form-select" value={newRefreshmentItem.unit} onChange={(e) => setNewRefreshmentItem({...newRefreshmentItem, unit: e.target.value})}>
                <option value="pieces">Pieces</option>
                <option value="bottles">Bottles</option>
                <option value="cups">Cups</option>
                <option value="plates">Plates</option>
                <option value="packets">Packets</option>
                <option value="servings">Servings</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Add Refreshment Item</button>
        </form>
      </div>
      <div className="card">
        <h4 className="card-title">Existing Refreshment Items ({refreshmentItems.length})</h4>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Name</th><th>Unit</th><th>Actions</th></tr></thead>
            <tbody>
              {refreshmentItems.length === 0 ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No refreshment items found</td></tr>
              ) : (
                refreshmentItems.map(item => (
                  <tr key={item._id}>
                    <td>{editingRefreshmentItem?._id === item._id ? <input type="text" value={editingRefreshmentItem.name} onChange={(e) => setEditingRefreshmentItem({...editingRefreshmentItem, name: e.target.value})} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #00E5FF', borderRadius: '4px', padding: '0.25rem', color: '#F5F7FF' }} /> : <strong>{item.name}</strong>}</td>
                    <td>{editingRefreshmentItem?._id === item._id ? <select value={editingRefreshmentItem.unit} onChange={(e) => setEditingRefreshmentItem({...editingRefreshmentItem, unit: e.target.value})} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #00E5FF', borderRadius: '4px', padding: '0.25rem', color: '#F5F7FF' }}><option value="pieces">Pieces</option><option value="bottles">Bottles</option><option value="cups">Cups</option><option value="plates">Plates</option><option value="packets">Packets</option><option value="servings">Servings</option></select> : item.unit}</td>
                    <td>{editingRefreshmentItem?._id === item._id ? (<><button className="btn btn-success" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', marginRight: '0.25rem' }} onClick={handleUpdateRefreshmentItem}>Save</button><button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setEditingRefreshmentItem(null)}>Cancel</button></>) : (<><button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', marginRight: '0.25rem' }} onClick={() => handleEditRefreshmentItem(item)}>Edit</button><button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleDeleteRefreshmentItem(item._id)}>Delete</button></>)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">User Management</h3>
        <button onClick={handleBackToOverview} style={{ background: 'none', border: 'none', color: '#00E5FF', fontSize: '0.85rem', cursor: 'pointer', padding: '0.25rem 0', pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>← Back to Overview</button>
      </div>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h4 className="card-title">Create New User</h4>
        <form onSubmit={handleCreateUser} className="form-container" style={{ padding: 0 }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input type="text" className="form-input" placeholder="Full Name" required value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" className="form-input" placeholder="user@example.com" required value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input type="password" className="form-input" placeholder="Password" required value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Role *</label>
              <select className="form-select" required value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}>
                <option value="">Select Role</option>
                {roles.map(role => <option key={role._id} value={role.name}>{role.name}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Create User</button>
        </form>
      </div>
      <div className="card">
        <h4 className="card-title">Existing Users ({users.length})</h4>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th></tr></thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No users found</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user._id}>
                    <td><strong>{user.name}</strong></td>
                    <td>{user.email}</td>
                    <td><span className="badge">{user.role}</span></td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Events Management</h3>
        <button onClick={handleBackToOverview} style={{ background: 'none', border: 'none', color: '#00E5FF', fontSize: '0.85rem', cursor: 'pointer', padding: '0.25rem 0', pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>← Back to Overview</button>
      </div>
      <div className="card">
        <h4 className="card-title">All Events ({events.length})</h4>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Event Name</th><th>Type</th><th>Date</th><th>Status</th><th>Organizer</th></tr></thead>
            <tbody>
              {events.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No events found</td></tr>
              ) : (
                events.map(event => (
                  <tr key={event._id}>
                    <td><strong>{event.title}</strong></td>
                    <td>{event.type}</td>
                    <td>{new Date(event.date).toLocaleDateString()}</td>
                    <td><span className={`badge ${event.status === 'approved' ? 'badge-success' : event.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>{event.status}</span></td>
                    <td>{event.created_by?.name || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderEventTypes = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Event Types Management</h3>
        <button onClick={handleBackToOverview} style={{ background: 'none', border: 'none', color: '#00E5FF', fontSize: '0.85rem', cursor: 'pointer', padding: '0.25rem 0', pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>← Back to Overview</button>
      </div>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h4 className="card-title">Create New Event Type</h4>
        <form onSubmit={handleCreateEventType} className="form-container" style={{ padding: 0 }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Type Name *</label>
              <input type="text" className="form-input" placeholder="e.g., Technical Workshop" required value={newType.name} onChange={(e) => setNewType({...newType, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" placeholder="Brief description of this event type" value={newType.description} onChange={(e) => setNewType({...newType, description: e.target.value})} style={{ minHeight: '80px', resize: 'vertical' }} />
            </div>
          </div>
          <div className="form-section">
            <h5 style={{ color: '#00E5FF', marginBottom: '1rem' }}>Default Requirements</h5>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Volunteers Needed</label>
                <input type="number" className="form-input" min="0" value={newType.default_requirements.volunteers_needed} onChange={(e) => setNewType({...newType, default_requirements: {...newType.default_requirements, volunteers_needed: parseInt(e.target.value) || 0}})} />
              </div>
              <div className="form-group">
                <label className="form-label">Rooms Needed</label>
                <input type="number" className="form-input" min="0" value={newType.default_requirements.rooms_needed} onChange={(e) => setNewType({...newType, default_requirements: {...newType.default_requirements, rooms_needed: parseInt(e.target.value) || 0}})} />
              </div>
            </div>
            <div className="checkbox-grid">
              {['refreshments_needed', 'stationary_needed', 'goodies_needed', 'physical_certificate', 'trophies_needed'].map(req => (
                <label key={req} className="checkbox-label">
                  <input type="checkbox" checked={newType.default_requirements[req]} onChange={(e) => setNewType({...newType, default_requirements: {...newType.default_requirements, [req]: e.target.checked}})} />
                  {req.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Create Event Type</button>
        </form>
      </div>
      <div className="card">
        <h4 className="card-title">Existing Event Types ({eventTypes.length})</h4>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Name</th><th>Description</th><th>Default Requirements</th></tr></thead>
            <tbody>
              {eventTypes.length === 0 ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No event types found</td></tr>
              ) : (
                eventTypes.map(type => (
                  <tr key={type._id}>
                    <td><strong>{type.name}</strong></td>
                    <td>{type.description || 'No description'}</td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        <div>Volunteers: {type.default_requirements?.volunteers_needed || 0}</div>
                        <div>Rooms: {type.default_requirements?.rooms_needed || 0}</div>
                        <div style={{ marginTop: '0.25rem' }}>
                          {Object.entries(type.default_requirements || {}).filter(([key, value]) => typeof value === 'boolean' && value).map(([key]) => (
                            <span key={key} className="badge" style={{ marginRight: '0.25rem', fontSize: '0.7rem' }}>
                              {key.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderStationery = () => (
    <div className="fade-in">
      <div className="nav-header">
        <h3 className="nav-title">Stationery Items Management</h3>
        <button onClick={handleBackToOverview} style={{ background: 'none', border: 'none', color: '#00E5FF', fontSize: '0.85rem', cursor: 'pointer', padding: '0.25rem 0', pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>← Back to Overview</button>
      </div>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h4 className="card-title">Add New Stationery Item</h4>
        <form onSubmit={handleCreateStationeryItem} className="form-container" style={{ padding: 0 }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Item Name *</label>
              <input type="text" className="form-input" placeholder="e.g., A4 Paper" required value={newStationeryItem.name} onChange={(e) => setNewStationeryItem({...newStationeryItem, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input type="text" className="form-input" placeholder="Brief description" value={newStationeryItem.description} onChange={(e) => setNewStationeryItem({...newStationeryItem, description: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select className="form-select" value={newStationeryItem.unit} onChange={(e) => setNewStationeryItem({...newStationeryItem, unit: e.target.value})}>
                <option value="pieces">Pieces</option>
                <option value="sheets">Sheets</option>
                <option value="packs">Packs</option>
                <option value="boxes">Boxes</option>
                <option value="items">Items</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Add Stationery Item</button>
        </form>
      </div>
      <div className="card">
        <h4 className="card-title">Existing Stationery Items ({stationeryItems.length})</h4>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Name</th><th>Description</th><th>Unit</th><th>Actions</th></tr></thead>
            <tbody>
              {stationeryItems.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No stationery items found</td></tr>
              ) : (
                stationeryItems.map(item => (
                  <tr key={item._id}>
                    <td>{editingStationeryItem?._id === item._id ? <input type="text" value={editingStationeryItem.name} onChange={(e) => setEditingStationeryItem({...editingStationeryItem, name: e.target.value})} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #00E5FF', borderRadius: '4px', padding: '0.25rem', color: '#F5F7FF' }} /> : <strong>{item.name}</strong>}</td>
                    <td>{editingStationeryItem?._id === item._id ? <input type="text" value={editingStationeryItem.description || ''} onChange={(e) => setEditingStationeryItem({...editingStationeryItem, description: e.target.value})} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #00E5FF', borderRadius: '4px', padding: '0.25rem', color: '#F5F7FF' }} /> : (item.description || 'No description')}</td>
                    <td>{editingStationeryItem?._id === item._id ? <select value={editingStationeryItem.unit} onChange={(e) => setEditingStationeryItem({...editingStationeryItem, unit: e.target.value})} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #00E5FF', borderRadius: '4px', padding: '0.25rem', color: '#F5F7FF' }}><option value="pieces">Pieces</option><option value="sheets">Sheets</option><option value="packs">Packs</option><option value="boxes">Boxes</option><option value="items">Items</option></select> : item.unit}</td>
                    <td>{editingStationeryItem?._id === item._id ? (<><button className="btn btn-success" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', marginRight: '0.25rem' }} onClick={handleUpdateStationeryItem}>Save</button><button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={handleCancelEdit}>Cancel</button></>) : (<><button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', marginRight: '0.25rem' }} onClick={() => handleEditStationeryItem(item)}>Edit</button><button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleDeleteStationeryItem(item._id)}>Delete</button></>)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {activeView === 'overview' && renderOverview()}
      {activeView === 'users' && renderUsers()}
      {activeView === 'events' && renderEvents()}
      {activeView === 'eventTypes' && renderEventTypes()}
      {activeView === 'stationery' && renderStationery()}
      {activeView === 'technical' && renderTechnical()}
      {activeView === 'refreshments' && renderRefreshments()}
    </div>
  );
}