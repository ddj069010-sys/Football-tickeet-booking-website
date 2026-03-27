import { useState, useEffect, useRef } from 'react';
import { notificationAPI } from '../services/api';
import { useLocation } from 'react-router-dom';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();

    const fetchNotifications = async () => {
        try {
            const res = await notificationAPI.getNotifications();
            if (res.data?.notifications) {
                setNotifications(res.data.notifications);
            }
        } catch (err) {
            console.error("Failed to load notifications");
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 15 seconds to keep it fresh
        const interval = setInterval(fetchNotifications, 15000);
        return () => clearInterval(interval);
    }, [location.pathname]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await notificationAPI.markNotificationRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        } catch (err) {
            console.error("Failed to mark read");
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="notification-container" ref={dropdownRef} style={{ position: 'relative', marginRight: '1rem', display: 'flex', alignItems: 'center' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn-icon"
                style={{
                    background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', position: 'relative', color: '#a1a1aa'
                }}
                title="Notifications"
            >
                🔔
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '-5px', right: '-8px',
                        background: '#ef4444', color: 'white', fontSize: '0.65rem',
                        padding: '2px 6px', borderRadius: '50%', fontWeight: 'bold'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown glass-card" style={{
                    position: 'absolute', top: '100%', right: '0', width: '300px',
                    marginTop: '0.5rem', padding: '0', zIndex: 1000,
                    maxHeight: '400px', overflowY: 'auto',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'rgba(24, 24, 27, 0.95)', backdropFilter: 'blur(5px)' }}>
                        <h4 style={{ margin: 0, color: 'white' }}>Notifications</h4>
                        {unreadCount > 0 && (
                            <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>{unreadCount} unread</span>
                        )}
                    </div>

                    {notifications.length === 0 ? (
                        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#a1a1aa', fontSize: '0.9rem' }}>
                            You're all caught up!
                        </div>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {notifications.map(n => (
                                <li key={n.id} style={{
                                    padding: '1rem',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    backgroundColor: n.is_read ? 'transparent' : 'rgba(139, 92, 246, 0.05)',
                                    cursor: n.is_read ? 'default' : 'pointer',
                                    transition: 'background-color 0.2s'
                                }} onClick={() => !n.is_read && handleMarkAsRead(n.id)}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                        <strong style={{ fontSize: '0.9rem', color: n.is_read ? '#a1a1aa' : 'white' }}>{n.title}</strong>
                                        <small style={{ color: '#71717a', fontSize: '0.75rem' }}>
                                            {new Date(n.created_at).toLocaleDateString()}
                                        </small>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: n.is_read ? '#71717a' : '#d4d4d8', lineHeight: '1.4' }}>
                                        {n.message}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
