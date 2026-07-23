import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const ParticipantNotifications = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      console.log('Fetching participant notifications...');
      const response = await axios.get('/participant-notifications');
      console.log('Notification response:', response.data);
      if (response.data.success) {
        setNotifications(response.data.notifications);
        const unread = response.data.notifications.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      console.error('Error response:', error.response);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/participant-notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('/participant-notifications/mark-all-read');
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'attendance': return '✅';
      case 'event_update': return '📅';
      case 'registration': return '🎫';
      case 'announcement': return '📢';
      default: return '📝';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!isOpen) return null;

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
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '100px'
    }}>
      <div style={{
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-soft)',
        borderRadius: '18px',
        padding: '2rem',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '70vh',
        overflowY: 'auto'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border-soft)',
          paddingBottom: '1rem'
        }}>
          <div>
            <h3 style={{ 
              color: 'var(--text-primary)', 
              margin: '0', 
              fontSize: '24px', 
              fontWeight: '600' 
            }}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
                marginLeft: '0.5rem'
              }}>
                {unreadCount} new
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Mark All Read
              </button>
            )}
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
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '18px', marginBottom: '0.5rem' }}>No notifications yet</p>
            <p style={{ fontSize: '14px' }}>You'll see updates about your events here</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => !notification.is_read && markAsRead(notification._id)}
                style={{
                  background: notification.is_read 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(0, 229, 255, 0.1)',
                  border: notification.is_read 
                    ? '1px solid var(--border-soft)' 
                    : '1px solid rgba(0, 229, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '1rem',
                  cursor: notification.is_read ? 'default' : 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ 
                      color: 'var(--text-primary)', 
                      margin: '0 0 0.5rem 0', 
                      fontSize: '14px',
                      lineHeight: '1.4',
                      fontWeight: notification.is_read ? '400' : '500'
                    }}>
                      {notification.message}
                    </p>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      <span style={{ 
                        color: 'var(--text-muted)', 
                        fontSize: '12px' 
                      }}>
                        {formatDate(notification.createdAt)}
                      </span>
                      {notification.event_id && (
                        <span style={{
                          background: 'linear-gradient(135deg, var(--accent-gold), #FF8C00)',
                          color: 'var(--bg-main)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '8px',
                          fontSize: '10px',
                          fontWeight: '600'
                        }}>
                          {notification.event_id.title}
                        </span>
                      )}
                    </div>
                  </div>
                  {!notification.is_read && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      borderRadius: '50%',
                      flexShrink: 0
                    }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantNotifications;