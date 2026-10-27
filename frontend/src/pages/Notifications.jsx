import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Bell, CheckCheck } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const Notifications = () => {
    const { user, token } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const authToken = token || localStorage.getItem('erp_token');

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/notifications`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await res.json();
            if (data.success) {
                setNotifications(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, token]);

    const markAsRead = async (id) => {
        try {
            await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            window.dispatchEvent(new Event('notifications-updated'));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch(`${API_BASE_URL}/notifications/read-all`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            window.dispatchEvent(new Event('notifications-updated'));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <DashboardLayout>
            <div className="section-header" style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-primary)' }}>Notifications</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Stay updated with your latest alerts and messages.</p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 16px', borderRadius: 'var(--radius-md)',
                            background: 'var(--primary)', color: 'white', border: 'none',
                            fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer'
                        }}
                    >
                        <CheckCheck size={16} /> Mark All as Read
                    </button>
                )}
            </div>

            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>Loading...</div>
                ) : notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                        <div style={{ width: '64px', height: '64px', background: 'var(--surface-2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <Bell size={28} style={{ opacity: 0.5 }} />
                        </div>
                        <p style={{ fontSize: '0.95rem' }}>No notifications found.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {notifications.map((notification, index) => (
                            <div
                                key={notification.id}
                                onClick={() => !notification.read && markAsRead(notification.id)}
                                style={{
                                    padding: '16px',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '16px',
                                    background: !notification.read ? 'var(--surface-2)' : 'transparent',
                                    cursor: !notification.read ? 'pointer' : 'default',
                                    transition: 'background 0.2s ease',
                                    animation: 'slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
                                    animationDelay: `${index * 0.05}s`
                                }}
                            >
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: !notification.read ? 'var(--primary-glow)' : 'var(--surface-2)',
                                    color: !notification.read ? 'var(--primary)' : 'var(--text-muted)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    <Bell size={20} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>{notification.title}</h4>
                                        {!notification.read && (
                                            <span style={{
                                                width: '8px', height: '8px', borderRadius: '50%',
                                                background: 'var(--primary)', display: 'inline-block', flexShrink: 0
                                            }} />
                                        )}
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{notification.message}</p>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '8px' }}>
                                        {new Date(notification.created_at).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Notifications;

