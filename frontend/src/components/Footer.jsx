import React from 'react';

export default function Footer({ showOrganizers = false }) {
  return (
    <>
      {showOrganizers && (
        <>
          <div className="organizer-strip">
            <span className="organizer-text">Organized By</span>
            <div className="organizer-logos">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <img src="/istlogo.png" alt="IST Department" style={{ height: '60px', width: 'auto', opacity: '0.8' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>IST Department</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <img src="/ceglogo.png" alt="CEG" style={{ height: '60px', width: 'auto', opacity: '0.8' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>CEG, Anna University</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <img src="/acalogoo.png" alt="ACA" style={{ height: '60px', width: 'auto', opacity: '0.8' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>ACA</span>
              </div>
            </div>
          </div>
          <div style={{ height: '60px' }}></div>
        </>
      )}
      
      <footer style={{ background: 'var(--bg-secondary)', padding: '2rem 0', textAlign: 'center', borderTop: '1px solid var(--border-soft)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0' }}>
            © NIRAL 2026
          </p>
        </div>
      </footer>
    </>
  );
}