import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Header({ showNavigation = true, showLoginButton = false, showBackButton = false, backTo = '/' }) {
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo-link">
          <img src="/nirallogo.png" alt="NIRAL" style={{ height: 36, width: 'auto' }} />
          <span className="logo-text">ACAConnect</span>
        </Link>

        {showNavigation && (
          <nav className={`header-nav${navOpen ? ' open' : ''}`}>
            <Link to="/" className="nav-link" onClick={() => setNavOpen(false)}>Home</Link>
            <a href="/#events" className="nav-link" onClick={() => setNavOpen(false)}>Events</a>
            <a href="/#about" className="nav-link" onClick={() => setNavOpen(false)}>About</a>
            <Link to="/contact" className="nav-link" onClick={() => setNavOpen(false)}>Contact</Link>
          </nav>
        )}

        <div className="header-actions">
          {showBackButton && (
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(backTo)}>
              Back
            </button>
          )}
          {showLoginButton && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>
              Login
            </button>
          )}
        </div>

        <button className="menu-toggle" onClick={() => setNavOpen(!navOpen)} aria-label="Toggle menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {navOpen ? (
              <path d="M18 6 6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>
    </header>
  );
}
