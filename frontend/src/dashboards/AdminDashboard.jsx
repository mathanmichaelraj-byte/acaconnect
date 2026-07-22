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
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: '' });
  const [events, setEvents] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [stationeryItems, setStationeryItems] = useState([]);
  const [technicalItems, setTechnicalItems] = useState([]);
  const [refreshmentItems, setRefreshmentItems] = useState([]);
  const [activeView, setActiveView] = useState('overview');
  const [newType, setNewType] = useState({
    name: '', description: '',
    default_requirements: {
      volunteers_needed: 0, rooms_needed: 0, refreshments_needed: false,
      stationary_needed: false, goodies_needed: false, physical_certificate: false, trophies_needed: false
    }
  });
  const [newStationeryItem, setNewStationeryItem] = useState({ name: '', description: '', unit: 'pieces' });
  const [editingStationeryItem, setEditingStationeryItem] = useState(null);
  const [newTechnicalItem, setNewTechnicalItem] = useState({ name: '', description: '', unit: 'pieces' });
  const [editingTechnicalItem, setEditingTechnicalItem] = useState(null);
  const [newRefreshmentItem, setNewRefreshmentItem] = useState({ name: '', description: '', unit: 'pieces' });
  const [editingRefreshmentItem, setEditingRefreshmentItem] = useState(null);

  useEffect(() => { fetchStats(); }, []);

  useEffect(() => {
    if (activeView === 'eventTypes') fetchEventTypes();
    else if (activeView === 'users') fetchUsersData();
    else if (activeView === 'stationery') fetchStationeryItems();
    else if (activeView === 'technical') fetchTechnicalItems();
    else if (activeView === 'refreshments') fetchRefreshmentItems();
  }, [activeView]);

  const fetchUsersData = async () => {
    try {
      const usersResponse = await axios.get('/admin/users');
      setUsers(usersResponse.data);
      setRoles([
        { _id: '1', name: 'ADMIN' }, { _id: '2', name: 'EVENT_TEAM' },
        { _id: '3', name: 'STUDENT' }, { _id: '4', name: 'TREASURER' },
        { _id: '5', name: 'GENERAL_SECRETARY' }, { _id: '6', name: 'CHAIRPERSON' },
        { _id: '7', name: 'PARTICIPANT' }, { _id: '8', name: 'LOGISTICS' },
        { _id: '9', name: 'HR' }, { _id: '10', name: 'HOSPITALITY' },
        { _id: '11', name: 'TECHOPS' }
      ]);
    } catch (error) { console.error('Failed to fetch users:', error); }
  };

  const fetchStats = async () => {
    try { const response = await axios.get('/admin/stats'); setStats(response.data); }
    catch (error) { console.error('Failed to fetch stats:', error); }
  };

  const fetchEvents = async () => {
    try { const response = await axios.get('/admin/events'); setEvents(response.data); setActiveView('events'); }
    catch (error) { console.error('Failed to fetch events:', error); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try { await axios.post('/admin/users', newUser); alert('User created successfully!'); setNewUser({ name: '', email: '', password: '', role: '' }); fetchUsersData(); }
    catch (error) { alert('Failed to create user: ' + (error.response?.data?.message || 'Unknown error')); }
  };

  const fetchEventTypes = async () => {
    try { const response = await axios.get('/events/types/all'); setEventTypes(response.data); }
    catch (error) { console.error('Failed to fetch event types:', error); }
  };

  const handleCreateEventType = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/events/types', newType); alert('Event type created successfully!');
      setNewType({ name: '', description: '', default_requirements: { volunteers_needed: 0, rooms_needed: 0, refreshments_needed: false, stationary_needed: false, goodies_needed: false, physical_certificate: false, trophies_needed: false } });
      fetchEventTypes();
    } catch (error) { alert('Failed to create event type: ' + (error.response?.data?.message || 'Unknown error')); }
  };

  const fetchStationeryItems = async () => { try { const r = await axios.get('/stationery'); setStationeryItems(r.data); } catch (e) { console.error(e); } };
  const handleCreateStationeryItem = async (e) => { e.preventDefault(); try { await axios.post('/stationery', newStationeryItem); alert('Stationery item created!'); setNewStationeryItem({ name: '', description: '', unit: 'pieces' }); fetchStationeryItems(); } catch (err) { alert('Failed: ' + (err.response?.data?.message || 'Unknown')); } };
  const handleDeleteStationeryItem = async (id) => { if (window.confirm('Delete this item?')) { try { await axios.delete(`/stationery/${id}`); alert('Deleted!'); fetchStationeryItems(); } catch (err) { alert('Failed: ' + (err.response?.data?.message || 'Unknown')); } } };
  const handleUpdateStationeryItem = async (e) => { e.preventDefault(); try { await axios.put(`/stationery/${editingStationeryItem._id}`, editingStationeryItem); alert('Updated!'); setEditingStationeryItem(null); fetchStationeryItems(); } catch (err) { alert('Failed: ' + (err.response?.data?.message || 'Unknown')); } };

  const fetchTechnicalItems = async () => { try { const r = await axios.get('/technical'); setTechnicalItems(r.data); } catch (e) { console.error(e); } };
  const handleCreateTechnicalItem = async (e) => { e.preventDefault(); try { await axios.post('/technical', newTechnicalItem); alert('Technical item created!'); setNewTechnicalItem({ name: '', description: '', unit: 'pieces' }); fetchTechnicalItems(); } catch (err) { alert('Failed: ' + (err.response?.data?.message || 'Unknown')); } };
  const handleDeleteTechnicalItem = async (id) => { if (window.confirm('Delete this item?')) { try { await axios.delete(`/technical/${id}`); alert('Deleted!'); fetchTechnicalItems(); } catch (err) { alert('Failed: ' + (err.response?.data?.message || 'Unknown')); } } };
  const handleUpdateTechnicalItem = async (e) => { e.preventDefault(); try { await axios.put(`/technical/${editingTechnicalItem._id}`, editingTechnicalItem); alert('Updated!'); setEditingTechnicalItem(null); fetchTechnicalItems(); } catch (err) { alert('Failed: ' + (err.response?.data?.message || 'Unknown')); } };

  const fetchRefreshmentItems = async () => { try { const r = await axios.get('/refreshments'); setRefreshmentItems(r.data); } catch (e) { console.error(e); } };
  const handleCreateRefreshmentItem = async (e) => { e.preventDefault(); try { await axios.post('/refreshments', newRefreshmentItem); alert('Refreshment item created!'); setNewRefreshmentItem({ name: '', description: '', unit: 'pieces' }); fetchRefreshmentItems(); } catch (err) { alert('Failed: ' + (err.response?.data?.message || 'Unknown')); } };
  const handleDeleteRefreshmentItem = async (id) => { if (window.confirm('Delete this item?')) { try { await axios.delete(`/refreshments/${id}`); alert('Deleted!'); fetchRefreshmentItems(); } catch (err) { alert('Failed: ' + (err.response?.data?.message || 'Unknown')); } } };
  const handleUpdateRefreshmentItem = async (e) => { e.preventDefault(); try { await axios.put(`/refreshments/${editingRefreshmentItem._id}`, editingRefreshmentItem); alert('Updated!'); setEditingRefreshmentItem(null); fetchRefreshmentItems(); } catch (err) { alert('Failed: ' + (err.response?.data?.message || 'Unknown')); } };

  const BackButton = ({ onClick, label = "Back to Overview" }) => (
    <button className="btn btn-ghost btn-sm" onClick={onClick} style={{ marginBottom: '1rem' }}>&larr; {label}</button>
  );

  const renderItemTable = (items, type) => {
    const editing = type === 'stationery' ? editingStationeryItem : type === 'technical' ? editingTechnicalItem : editingRefreshmentItem;
    const setEditing = type === 'stationery' ? setEditingStationeryItem : type === 'technical' ? setEditingTechnicalItem : setEditingRefreshmentItem;
    const handleUpdate = type === 'stationery' ? handleUpdateStationeryItem : type === 'technical' ? handleUpdateTechnicalItem : handleUpdateRefreshmentItem;
    const handleDelete = type === 'stationery' ? handleDeleteStationeryItem : type === 'technical' ? handleDeleteTechnicalItem : handleDeleteRefreshmentItem;
    const unitOptions = type === 'refreshments'
      ? [['pieces','Pieces'],['bottles','Bottles'],['cups','Cups'],['plates','Plates'],['packets','Packets'],['servings','Servings']]
      : type === 'stationery'
        ? [['pieces','Pieces'],['sheets','Sheets'],['packs','Packs'],['boxes','Boxes'],['items','Items']]
        : [['pieces','Pieces'],['sets','Sets'],['units','Units'],['items','Items']];

    return (
      <div className="table-container">
        <table className="table">
          <thead><tr><th>Name</th>{type === 'stationery' && <th>Description</th>}<th>Unit</th><th>Actions</th></tr></thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={type === 'stationery' ? 4 : 3} className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>No items found</td></tr>
            ) : items.map(item => (
              <tr key={item._id}>
                <td>{editing?._id === item._id ? <input className="form-input" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }} type="text" value={editing.name} onChange={(e) => setEditing({...editing, name: e.target.value})} /> : <strong>{item.name}</strong>}</td>
                {type === 'stationery' && <td>{editing?._id === item._id ? <input className="form-input" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }} type="text" value={editing.description || ''} onChange={(e) => setEditing({...editing, description: e.target.value})} /> : (item.description || '—')}</td>}
                <td>{editing?._id === item._id ? <select className="form-select" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }} value={editing.unit} onChange={(e) => setEditing({...editing, unit: e.target.value})}>{unitOptions.map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select> : item.unit}</td>
                <td>
                  <div className="actions">
                    {editing?._id === item._id ? (
                      <><button className="btn btn-success btn-sm" onClick={handleUpdate}>Save</button><button className="btn btn-secondary btn-sm" onClick={() => setEditing(null)}>Cancel</button></>
                    ) : (
                      <><button className="btn btn-secondary btn-sm" onClick={() => setEditing(item)}>Edit</button><button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id)}>Delete</button></>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderItemForm = (item, setItem, onSubmit, title, unitOptions) => (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div className="card-body">
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>{title}</h3>
        <form onSubmit={onSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label>Item Name</label><input className="form-input" type="text" placeholder="e.g., A4 Paper" required value={item.name} onChange={(e) => setItem({...item, name: e.target.value})} /></div>
            <div className="form-group"><label>Unit</label><select className="form-select" value={item.unit} onChange={(e) => setItem({...item, unit: e.target.value})}>{unitOptions.map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Item</button>
        </form>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="dashboard-container"><div className="container">
      <div className="dashboard-header"><h1>Admin Dashboard</h1><button className="btn btn-secondary" onClick={logout}>Sign Out</button></div>
      <div className="stats-grid">
        <div className="stat-card"><h3>Total Events</h3><span className="stat-number">{stats.totalEvents}</span></div>
        <div className="stat-card"><h3>Active Users</h3><span className="stat-number">{stats.activeUsers}</span></div>
        <div className="stat-card"><h3>Pending Approvals</h3><span className="stat-number">{stats.pendingApprovals}</span></div>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-card"><h3>Management</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-block" onClick={fetchEvents}>Manage Events</button>
            <button className="btn btn-primary btn-block" onClick={() => setActiveView('users')}>Manage Users</button>
            <button className="btn btn-primary btn-block" onClick={() => setActiveView('eventTypes')}>Manage Event Types</button>
          </div>
        </div>
        <div className="dashboard-card"><h3>Inventory</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-block" onClick={() => setActiveView('stationery')}>Stationery Items</button>
            <button className="btn btn-primary btn-block" onClick={() => setActiveView('technical')}>Technical Items</button>
            <button className="btn btn-primary btn-block" onClick={() => setActiveView('refreshments')}>Refreshment Items</button>
          </div>
        </div>
      </div>
    </div></div>
  );

  const renderUsers = () => (
    <div className="dashboard-container"><div className="container">
      <BackButton onClick={() => setActiveView('overview')} />
      <h2 style={{ marginBottom: '1.5rem' }}>User Management</h2>
      <div className="card" style={{ marginBottom: '1.5rem' }}><div className="card-body">
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Create New User</h3>
        <form onSubmit={handleCreateUser}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group"><label>Name</label><input className="form-input" type="text" placeholder="Full Name" required value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} /></div>
            <div className="form-group"><label>Email</label><input className="form-input" type="email" placeholder="user@example.com" required value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} /></div>
            <div className="form-group"><label>Password</label><input className="form-input" type="password" placeholder="Password" required value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} /></div>
            <div className="form-group"><label>Role</label><select className="form-select" required value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}><option value="">Select Role</option>{roles.map(role => <option key={role._id} value={role.name}>{role.name}</option>)}</select></div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Create User</button>
        </form>
      </div></div>
      <div className="card"><div className="card-body">
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Existing Users ({users.length})</h3>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th></tr></thead>
            <tbody>
              {users.length === 0 ? <tr><td colSpan="4" className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>No users found</td></tr> : users.map(user => (
                <tr key={user._id}><td><strong>{user.name}</strong></td><td>{user.email}</td><td><span className="badge badge-info">{user.role}</span></td><td>{new Date(user.createdAt).toLocaleDateString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div></div>
    </div></div>
  );

  const renderEvents = () => (
    <div className="dashboard-container"><div className="container">
      <BackButton onClick={() => setActiveView('overview')} />
      <h2 style={{ marginBottom: '1.5rem' }}>Events Management</h2>
      <div className="card"><div className="card-body">
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>All Events ({events.length})</h3>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Event Name</th><th>Type</th><th>Date</th><th>Status</th><th>Organizer</th></tr></thead>
            <tbody>
              {events.length === 0 ? <tr><td colSpan="5" className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>No events found</td></tr> : events.map(event => (
                <tr key={event._id}><td><strong>{event.title}</strong></td><td>{event.type}</td><td>{new Date(event.date).toLocaleDateString()}</td><td><span className={`badge ${event.status === 'approved' ? 'badge-success' : event.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>{event.status}</span></td><td>{event.created_by?.name || 'N/A'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div></div>
    </div></div>
  );

  const renderEventTypes = () => (
    <div className="dashboard-container"><div className="container">
      <BackButton onClick={() => setActiveView('overview')} />
      <h2 style={{ marginBottom: '1.5rem' }}>Event Types Management</h2>
      <div className="card" style={{ marginBottom: '1.5rem' }}><div className="card-body">
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Create New Event Type</h3>
        <form onSubmit={handleCreateEventType}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label>Type Name</label><input className="form-input" type="text" placeholder="e.g., Technical Workshop" required value={newType.name} onChange={(e) => setNewType({...newType, name: e.target.value})} /></div>
            <div className="form-group"><label>Description</label><textarea className="form-textarea" placeholder="Brief description" value={newType.description} onChange={(e) => setNewType({...newType, description: e.target.value})} /></div>
          </div>
          <div style={{ marginTop: '1rem' }}><h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--accent-primary)' }}>Default Requirements</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
              <div className="form-group"><label>Volunteers Needed</label><input className="form-input" type="number" min="0" value={newType.default_requirements.volunteers_needed} onChange={(e) => setNewType({...newType, default_requirements: {...newType.default_requirements, volunteers_needed: parseInt(e.target.value) || 0}})} /></div>
              <div className="form-group"><label>Rooms Needed</label><input className="form-input" type="number" min="0" value={newType.default_requirements.rooms_needed} onChange={(e) => setNewType({...newType, default_requirements: {...newType.default_requirements, rooms_needed: parseInt(e.target.value) || 0}})} /></div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {['refreshments_needed', 'stationary_needed', 'goodies_needed', 'physical_certificate', 'trophies_needed'].map(req => (
                <label key={req} className="form-checkbox"><input type="checkbox" checked={newType.default_requirements[req]} onChange={(e) => setNewType({...newType, default_requirements: {...newType.default_requirements, [req]: e.target.checked}})} />{req.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Create Event Type</button>
        </form>
      </div></div>
      <div className="card"><div className="card-body">
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Existing Event Types ({eventTypes.length})</h3>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Name</th><th>Description</th><th>Requirements</th></tr></thead>
            <tbody>
              {eventTypes.length === 0 ? <tr><td colSpan="3" className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>No event types found</td></tr> : eventTypes.map(type => (
                <tr key={type._id}><td><strong>{type.name}</strong></td><td>{type.description || '—'}</td>
                  <td><div style={{ fontSize: '0.85rem' }}>Volunteers: {type.default_requirements?.volunteers_needed || 0} | Rooms: {type.default_requirements?.rooms_needed || 0}
                    <div style={{ marginTop: '0.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {Object.entries(type.default_requirements || {}).filter(([, v]) => typeof v === 'boolean' && v).map(([k]) => <span key={k} className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>{k.replace(/_/g, ' ')}</span>)}
                    </div>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div></div>
    </div></div>
  );

  const stationeryUnitOptions = [['pieces','Pieces'],['sheets','Sheets'],['packs','Packs'],['boxes','Boxes'],['items','Items']];
  const technicalUnitOptions = [['pieces','Pieces'],['sets','Sets'],['units','Units'],['items','Items']];
  const refreshmentUnitOptions = [['pieces','Pieces'],['bottles','Bottles'],['cups','Cups'],['plates','Plates'],['packets','Packets'],['servings','Servings']];

  return (
    <div>
      {activeView === 'overview' && renderOverview()}
      {activeView === 'users' && renderUsers()}
      {activeView === 'events' && renderEvents()}
      {activeView === 'eventTypes' && renderEventTypes()}
      {activeView === 'stationery' && (
        <div className="dashboard-container"><div className="container">
          <BackButton onClick={() => setActiveView('overview')} />
          <h2 style={{ marginBottom: '1.5rem' }}>Stationery Items</h2>
          {renderItemForm(newStationeryItem, setNewStationeryItem, handleCreateStationeryItem, 'Add Stationery Item', stationeryUnitOptions)}
          <div className="card"><div className="card-body"><h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Existing Items ({stationeryItems.length})</h3>{renderItemTable(stationeryItems, 'stationery')}</div></div>
        </div></div>
      )}
      {activeView === 'technical' && (
        <div className="dashboard-container"><div className="container">
          <BackButton onClick={() => setActiveView('overview')} />
          <h2 style={{ marginBottom: '1.5rem' }}>Technical Items</h2>
          {renderItemForm(newTechnicalItem, setNewTechnicalItem, handleCreateTechnicalItem, 'Add Technical Item', technicalUnitOptions)}
          <div className="card"><div className="card-body"><h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Existing Items ({technicalItems.length})</h3>{renderItemTable(technicalItems, 'technical')}</div></div>
        </div></div>
      )}
      {activeView === 'refreshments' && (
        <div className="dashboard-container"><div className="container">
          <BackButton onClick={() => setActiveView('overview')} />
          <h2 style={{ marginBottom: '1.5rem' }}>Refreshment Items</h2>
          {renderItemForm(newRefreshmentItem, setNewRefreshmentItem, handleCreateRefreshmentItem, 'Add Refreshment Item', refreshmentUnitOptions)}
          <div className="card"><div className="card-body"><h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Existing Items ({refreshmentItems.length})</h3>{renderItemTable(refreshmentItems, 'refreshments')}</div></div>
        </div></div>
      )}
    </div>
  );
}
