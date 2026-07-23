import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function StaffLayout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
      <header className="header">
        <div className="header-content">
          <Link to="/dashboard" className="logo-link">
            <img src="/nirallogo.png" alt="NIRAL" style={{ height: 36, width: 'auto' }} />
            <span className="logo-text">ACAConnect</span>
          </Link>

          <div className="header-actions">
            {user && (
              <span className="user-greeting">
                {user.name} &middot; <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{user.role?.replace(/_/g, ' ')}</span>
              </span>
            )}
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/events')}>Events</button>
            <button className="btn btn-secondary btn-sm" onClick={logout}>Sign Out</button>
          </div>
        </div>
      </header>

      <main style={{ paddingTop: 'var(--nav-height)', minHeight: 'calc(100vh - var(--nav-height))' }}>
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
