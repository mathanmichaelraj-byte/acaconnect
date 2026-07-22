import React from 'react';

export default function Footer({ showOrganizers = false }) {
  return (
    <>
      {showOrganizers && (
        <>
          <div style={{ background: 'var(--bg-surface-alt)', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1.25rem' }}>Organized By</p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <img src="/istlogo.png" alt="IST Department" style={{ height: '52px', width: 'auto' }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>IST Department</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <img src="/ceglogo.png" alt="CEG" style={{ height: '52px', width: 'auto' }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>CEG, Anna University</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <img src="/acalogoo.png" alt="ACA" style={{ height: '52px', width: 'auto' }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>ACA</span>
              </div>
            </div>
          </div>
        </>
      )}

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span>ACAConnect</span>
          </div>
          <div className="footer-links">
            <a href="/#about">About</a>
            <a href="/#events">Events</a>
            <a href="/contact">Contact</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} NIRAL 2026. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
