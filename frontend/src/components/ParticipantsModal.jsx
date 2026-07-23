import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

export default function ParticipantsModal({ event, onClose }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParticipants();
  }, [event._id]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      console.log('Fetching participants for event:', event._id);
      const response = await axios.get(`/registrations/events/${event._id}/participants`);
      console.log('Participants response:', response.data);
      setParticipants(response.data.participants || []);
    } catch (error) {
      console.error('Failed to fetch participants:', error);
      console.error('Error response:', error.response?.data);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-soft)',
        borderRadius: '18px',
        padding: '2rem',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ color: 'var(--text-primary)', margin: '0', fontSize: '24px', fontWeight: '600' }}>
            Participants - {event.title}
          </h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading participants...
          </div>
        ) : participants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '18px', marginBottom: '1rem' }}>No participants registered yet</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Participants will appear here once they complete registration and payment.</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0, 229, 255, 0.1)', borderRadius: '12px', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
              <p style={{ color: 'var(--text-primary)', margin: '0', fontSize: '16px', fontWeight: '600' }}>
                Total Participants: {participants.length}
              </p>
            </div>

            <div className="table-container" style={{
              background: 'rgba(28, 26, 46, 0.85)',
              borderRadius: '18px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <table className="table" style={{
                width: '100%',
                borderCollapse: 'collapse',
                background: 'transparent'
              }}>
                <thead style={{
                  background: 'rgba(15, 14, 34, 0.8)'
                }}>
                  <tr>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#B8B6D8'
                    }}>Name</th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#B8B6D8'
                    }}>Email</th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#B8B6D8'
                    }}>College</th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#B8B6D8'
                    }}>Registered On</th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#B8B6D8'
                    }}>Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((reg) => (
                    <tr key={reg._id}>
                      <td style={{ padding: '1rem', color: '#F5F7FF' }}>
                        {reg.participant_id?.name || reg.participant_name}
                      </td>
                      <td style={{ padding: '1rem', color: '#F5F7FF', fontSize: '0.9rem' }}>
                        {reg.participant_id?.email || reg.participant_email}
                      </td>
                      <td style={{ padding: '1rem', color: '#F5F7FF', fontSize: '0.9rem' }}>
                        {reg.participant_id?.college || 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', color: '#F5F7FF', fontSize: '0.9rem' }}>
                        {new Date(reg.registration_date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`status-badge ${
                          reg.attendance_status === 'PRESENT' ? 'status-approved' : 
                          reg.attendance_status === 'ABSENT' ? 'status-rejected' : 'status-pending'
                        }`}>
                          {reg.attendance_status || 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
