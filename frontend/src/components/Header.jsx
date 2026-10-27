import { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bell, UserCircle, ChevronDown, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const Header = () => {
    const { user, token } = useContext(AuthContext);
    const [isDark, setIsDark] = useState(() => localStorage.getItem('erp_dark_mode') === 'true');
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (isDark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('erp_dark_mode', isDark);
    }, [isDark]);

    const fetchUnreadCount = useCallback(async () => {
        if (!token && !localStorage.getItem('erp_token')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/notifications`, {
                headers: { 'Authorization': `Bearer ${token || localStorage.getItem('erp_token')}` }
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                const count = data.data.filter(n => !n.read).length;
                setUnreadCount(count);
            }
        } catch {
            // silently ignore fetch errors
        }
    }, [token]);

    useEffect(() => {
        if (!user) return;

        // Initial fetch handled asynchronously to avoid sync effect setting state
        const initializeFetch = async () => {
            await fetchUnreadCount();
        };
        initializeFetch();

        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 30000);

        const handleUpdate = () => {
            fetchUnreadCount();
        };

        window.addEventListener('notifications-updated', handleUpdate);

        return () => {
            clearInterval(interval);
            window.removeEventListener('notifications-updated', handleUpdate);
        };
    }, [user, fetchUnreadCount]);

    if (!user) return null;

    return (
        <header className="top-header">
            <div className="header-left">
                <div className="header-page-title">
                    {['admin', 'faculty', 'staff'].includes(user.role) ? 'Admin Dashboard' : 'Student Dashboard'}
                </div>
            </div>

            <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Theme Toggle */}
                <button
                    onClick={() => setIsDark(prev => !prev)}
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'none', border: 'none', padding: '6px',
                        color: isDark ? '#f59e0b' : '#6366f1',
                        cursor: 'pointer', transition: 'color 0.3s ease'
                    }}
                >
                    {isDark ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
                </button>

                {/* Notifications */}
                <Link to="/notifications" className="header-notifications" style={{ position: 'relative', cursor: 'pointer', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span style={{
                            position: 'absolute', top: '-6px', right: '-8px',
                            background: 'var(--danger)', color: 'white',
                            fontSize: '0.6rem', fontWeight: 'bold',
                            minWidth: '18px', height: '18px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: '10px', padding: '0 4px'
                        }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                    )}
                </Link>

                {/* Profile Toggle */}
                <div className="profile-dropdown">
                    <div className="profile-trigger" style={{ cursor: 'pointer' }}>
                        <div className="profile-avatar">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="profile-info">
                            <span className="name">{user.name}</span>
                            <span className="role">{user.id}</span>
                        </div>
                        <ChevronDown size={14} className="chevron" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

