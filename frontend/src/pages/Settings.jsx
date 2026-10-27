import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Save, Lock, ChevronRight, CheckCircle, AlertCircle, User } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

/* ─── Animated Toast ─────────────────────────────────────────── */
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const t = setTimeout(onClose, 4000);
        return () => clearTimeout(t);
    }, [onClose]);

    const isSuccess = type === 'success';
    return (
        <div style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 20px',
            borderRadius: '14px',
            background: isSuccess
                ? 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(5,150,105,0.22))'
                : 'linear-gradient(135deg, rgba(239,68,68,0.18), rgba(185,28,28,0.22))',
            border: `1px solid ${isSuccess ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: isSuccess
                ? '0 8px 32px rgba(16,185,129,0.25)'
                : '0 8px 32px rgba(239,68,68,0.25)',
            animation: 'toastSlideIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
            minWidth: '280px',
            maxWidth: '400px',
        }}>
            {isSuccess
                ? <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                : <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
            }
            <span style={{
                color: isSuccess ? '#6ee7b7' : '#fca5a5',
                fontWeight: '500',
                fontSize: '0.9rem',
                fontFamily: "'Poppins', 'Inter', sans-serif",
            }}>{message}</span>
            <button
                onClick={onClose}
                style={{
                    marginLeft: 'auto',
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    lineHeight: 1,
                    padding: '0 4px',
                }}
            >✕</button>
        </div>
    );
};

/* ─── Main Component ─────────────────────────────────────────── */
const Settings = () => {
    const { user, token } = useContext(AuthContext);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // UI state
    const [showForm, setShowForm] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [userFaculty, setUserFaculty] = useState(user?.faculty || 'N/A');

    useEffect(() => {
        const fetchUserFaculty = async () => {
            if (user?.role === 'admin') return;

            try {
                const res = await fetch(`${API_BASE_URL}/complaints`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();

                if (data.success && data.data) {
                    // Find a complaint by this user that has a faculty set
                    const userComplaint = data.data.find(c =>
                        (c.studentEmail === user.email || c.studentId === user.studentId) && c.faculty
                    );

                    if (userComplaint) {
                        setUserFaculty(userComplaint.faculty);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch complaints to determine faculty:", error);
            }
        };

        if (token && user) {
            fetchUserFaculty();
        }
    }, [token, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (newPassword !== confirmPassword) {
            setMessage({ text: 'New passwords do not match', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ text: data.message || 'Password updated successfully', type: 'success' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                // Hide form after success
                setShowForm(false);
            } else {
                setMessage({ text: data.message || 'Failed to update password', type: 'error' });
            }
        } catch {
            setMessage({ text: 'Server error. Please try again later.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    /* ── Shared input style builder ── */
    const inputStyle = (fieldName) => ({
        width: '100%',
        padding: '13px 16px',
        borderRadius: '12px',
        border: focusedField === fieldName
            ? '1.5px solid transparent'
            : '1.5px solid rgba(99,102,241,0.2)',
        backgroundImage: focusedField === fieldName
            ? 'linear-gradient(var(--background,#0f1117), var(--background,#0f1117)), linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4)'
            : 'none',
        backgroundOrigin: 'border-box',
        backgroundClip: focusedField === fieldName ? 'padding-box, border-box' : 'border-box',
        background: focusedField === fieldName ? undefined : 'rgba(255,255,255,0.04)',
        color: 'var(--text-primary)',
        fontSize: '0.95rem',
        fontFamily: "'Poppins','Inter',sans-serif",
        outline: 'none',
        transition: 'all 0.3s ease',
        boxShadow: focusedField === fieldName
            ? '0 0 0 4px rgba(99,102,241,0.15), inset 0 2px 6px rgba(0,0,0,0.2)'
            : 'inset 0 2px 4px rgba(0,0,0,0.1)',
    });

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '500',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        letterSpacing: '0.4px',
        fontFamily: "'Poppins','Inter',sans-serif",
        textTransform: 'uppercase',
    };

    return (
        <DashboardLayout>
            {/* Animated Toast Notification */}
            {message.text && (
                <Toast
                    message={message.text}
                    type={message.type}
                    onClose={() => setMessage({ text: '', type: '' })}
                />
            )}

            {/* ── Page Header ── */}
            <div className="section-header" style={{ marginBottom: '32px', animation: 'settingsFadeUp 0.5s ease both' }}>
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    fontFamily: "'Poppins','Inter',sans-serif",
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.5px',
                }}>
                    Settings
                </h1>
                <p style={{
                    color: 'var(--text-secondary)',
                    marginTop: '6px',
                    fontSize: '0.95rem',
                    fontFamily: "'Poppins','Inter',sans-serif",
                }}>
                    Manage your account preferences and security.
                </p>
            </div>

            {/* ── Cards Container ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '620px' }}>

                {/* Profile Details Card / Toggle */}
                <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '18px',
                    padding: showProfile ? '32px' : '0', // Conditional padding
                    border: '1px solid rgba(16,185,129,0.18)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.06) inset',
                    animation: 'settingsFadeUp 0.55s 0.04s ease both',
                    transition: 'box-shadow 0.3s ease, transform 0.3s ease, padding 0.3s ease', // Add padding to transition
                }}
                    onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = '0 16px 48px rgba(16,185,129,0.18), 0 1px 0 rgba(255,255,255,0.06) inset';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.06) inset';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    {/* Card Header / Toggle */}
                    <div
                        onClick={() => setShowProfile(!showProfile)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            marginBottom: showProfile ? '24px' : '0',
                            borderBottom: showProfile ? '1px solid rgba(16,185,129,0.15)' : 'none',
                            padding: '32px', // Always apply padding to the toggle itself
                            paddingBottom: showProfile ? '20px' : '32px', // Adjust bottom padding based on state
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.2))',
                                padding: '12px',
                                borderRadius: '14px',
                                color: '#34d399',
                                border: '1px solid rgba(16,185,129,0.25)',
                                boxShadow: '0 4px 12px rgba(16,185,129,0.2)',
                            }}>
                                <User size={22} />
                            </div>
                            <div>
                                <h2 style={{
                                    fontSize: '1.15rem',
                                    fontWeight: '600',
                                    fontFamily: "'Poppins','Inter',sans-serif",
                                    background: 'linear-gradient(135deg, #d1fae5, #6ee7b7)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}>
                                    Profile Details
                                </h2>
                                <p style={{
                                    fontSize: '0.8rem',
                                    color: 'var(--text-secondary)',
                                    marginTop: '2px',
                                    fontFamily: "'Poppins','Inter',sans-serif",
                                }}>
                                    View your account information
                                </p>
                            </div>
                        </div>
                        <div style={{
                            background: 'rgba(16,185,129,0.1)',
                            borderRadius: '50%',
                            padding: '6px',
                            border: '1px solid rgba(16,185,129,0.2)',
                            transition: 'all 0.3s ease',
                        }}>
                            <ChevronRight
                                size={18}
                                style={{
                                    color: '#34d399',
                                    transition: 'transform 0.3s ease',
                                    display: 'block',
                                    transform: showProfile ? 'rotate(90deg)' : 'rotate(0deg)',
                                }}
                            />
                        </div>
                    </div>

                    {showProfile && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', animation: 'settingsFadeUp 0.35s ease both' }}>
                            {/* Avatar / Icon */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.2))',
                                padding: '16px',
                                borderRadius: '16px',
                                color: '#34d399',
                                border: '1px solid rgba(16,185,129,0.25)',
                                boxShadow: '0 4px 12px rgba(16,185,129,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <User size={32} />
                            </div>

                            {/* Details */}
                            <div style={{ flex: 1 }}>
                                <h2 style={{
                                    fontSize: '1.4rem',
                                    fontWeight: '700',
                                    fontFamily: "'Poppins','Inter',sans-serif",
                                    color: 'var(--text-primary)',
                                    marginBottom: '4px',
                                    letterSpacing: '-0.3px'
                                }}>
                                    {user?.name || 'Student Name'}
                                </h2>
                                <p style={{
                                    fontSize: '0.95rem',
                                    color: 'var(--text-secondary)',
                                    fontFamily: "'Poppins','Inter',sans-serif",
                                    marginBottom: '16px',
                                    display: 'inline-block',
                                    padding: '4px 12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    {user?.role === 'admin' ? 'Administrator' : (user?.studentId || 'N/A')}
                                </p>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '16px',
                                    marginTop: '8px',
                                    paddingTop: '20px',
                                    borderTop: '1px solid rgba(255,255,255,0.06)'
                                }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '600' }}>Email Address</label>
                                        <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '500' }}>{user?.email || 'N/A'}</div>
                                    </div>
                                    {user?.role !== 'admin' && (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '600' }}>Faculty</label>
                                            <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '500' }}>{userFaculty}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Password Settings Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '18px',
                    padding: '32px',
                    border: '1px solid rgba(99,102,241,0.18)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.06) inset',
                    animation: 'settingsFadeUp 0.55s 0.08s ease both',
                    transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                }}
                    onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = '0 16px 48px rgba(99,102,241,0.18), 0 1px 0 rgba(255,255,255,0.06) inset';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.06) inset';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    {/* Card Header / Toggle */}
                    <div
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            marginBottom: showForm ? '24px' : '0',
                            borderBottom: showForm ? '1px solid rgba(99,102,241,0.15)' : 'none',
                            paddingBottom: showForm ? '20px' : '0',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
                                padding: '12px',
                                borderRadius: '14px',
                                color: '#818cf8',
                                border: '1px solid rgba(99,102,241,0.25)',
                                boxShadow: '0 4px 12px rgba(99,102,241,0.2)',
                            }}>
                                <Lock size={22} />
                            </div>
                            <div>
                                <h2 style={{
                                    fontSize: '1.15rem',
                                    fontWeight: '600',
                                    fontFamily: "'Poppins','Inter',sans-serif",
                                    background: 'linear-gradient(135deg, #e0e7ff, #c4b5fd)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}>
                                    Password Settings
                                </h2>
                                <p style={{
                                    fontSize: '0.8rem',
                                    color: 'var(--text-secondary)',
                                    marginTop: '2px',
                                    fontFamily: "'Poppins','Inter',sans-serif",
                                }}>
                                    Update your account password
                                </p>
                            </div>
                        </div>
                        <div style={{
                            background: 'rgba(99,102,241,0.1)',
                            borderRadius: '50%',
                            padding: '6px',
                            border: '1px solid rgba(99,102,241,0.2)',
                            transition: 'all 0.3s ease',
                        }}>
                            <ChevronRight
                                size={18}
                                style={{
                                    color: '#818cf8',
                                    transition: 'transform 0.3s ease',
                                    display: 'block',
                                    transform: showForm ? 'rotate(90deg)' : 'rotate(0deg)',
                                }}
                            />
                        </div>
                    </div>

                    {/* Form */}
                    {showForm && (
                        <form onSubmit={handleSubmit} style={{ animation: 'settingsFadeUp 0.35s ease both' }}>
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    onFocus={() => setFocusedField('current')}
                                    onBlur={() => setFocusedField(null)}
                                    style={inputStyle('current')}
                                    required
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    onFocus={() => setFocusedField('new')}
                                    onBlur={() => setFocusedField(null)}
                                    style={inputStyle('new')}
                                    required
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '28px' }}>
                                <label style={labelStyle}>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onFocus={() => setFocusedField('confirm')}
                                    onBlur={() => setFocusedField(null)}
                                    style={inputStyle('confirm')}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {/* Gradient Submit */}
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '12px 28px',
                                        borderRadius: '12px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        border: 'none',
                                        background: loading
                                            ? 'rgba(99,102,241,0.5)'
                                            : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        color: 'white',
                                        fontWeight: '600',
                                        fontSize: '0.92rem',
                                        fontFamily: "'Poppins','Inter',sans-serif",
                                        boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
                                        transition: 'all 0.3s ease',
                                        opacity: loading ? 0.7 : 1,
                                    }}
                                    onMouseEnter={e => {
                                        if (!loading) {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.55)';
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.4)';
                                    }}
                                    onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0) scale(0.97)'; }}
                                    onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1)'; }}
                                >
                                    <Save size={17} />
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>

                                {/* Cancel */}
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => {
                                        setShowForm(false);
                                        setMessage({ text: '', type: '' });
                                    }}
                                    style={{
                                        padding: '12px 24px',
                                        borderRadius: '12px',
                                        background: 'transparent',
                                        border: '1.5px solid rgba(99,102,241,0.25)',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        fontFamily: "'Poppins','Inter',sans-serif",
                                        fontWeight: '500',
                                        fontSize: '0.92rem',
                                        transition: 'all 0.3s ease',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.55)';
                                        e.currentTarget.style.color = '#818cf8';
                                        e.currentTarget.style.background = 'rgba(99,102,241,0.07)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)';
                                        e.currentTarget.style.color = 'var(--text-secondary)';
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* ── Global keyframes ── */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

                @keyframes settingsFadeUp {
                    from { opacity: 0; transform: translateY(18px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                @keyframes toastSlideIn {
                    from { opacity: 0; transform: translateX(60px) scale(0.92); }
                    to   { opacity: 1; transform: translateX(0) scale(1); }
                }
            `}</style>
        </DashboardLayout>
    );
};

export default Settings;
