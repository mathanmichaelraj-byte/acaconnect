import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header({ showNavigation = true, showLoginButton = false, showBackButton = false, backTo = '/' }) {
  const navigate = useNavigate();

  return (
    <header className="niral-header">
      <div className="niral-nav-content">
        <div className="nav-left">
          {showBackButton && (
            <button className="btn-back" onClick={() => navigate(backTo)}>
              ← Back
            </button>
          )}
          <img src="/nirallogo.png" alt="NIRAL Logo" className="nav-logo" />
        </div>
        
        {showNavigation && (
          <nav className="nav-center">
            <a href="/" className="nav-link">Home</a>
            <a href="/#events" className="nav-link">Events</a>
            <a href="/#about" className="nav-link">About</a>
            <a href="#" className="nav-link">Contact</a>
          </nav>
        )}
        
        <div className="nav-right">
          {showLoginButton && (
            <button className="btn-register-now" onClick={() => navigate('/login')}>
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}