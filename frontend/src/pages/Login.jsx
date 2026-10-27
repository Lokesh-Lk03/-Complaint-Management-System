import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import takshashilaLogo from '../assets/takshashila_icon.png';
import { API_BASE_URL } from '../config/api';

const Login = () => {
    const { user, login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // If already logged in, redirect to respective dashboard
    useEffect(() => {
        if (user) {
            if (user.role === 'student') {
                navigate('/student-dashboard', { replace: true });
            } else if (['admin', 'faculty', 'staff'].includes(user.role)) {
                navigate('/admin/dashboard', { replace: true });
            }
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id.trim(), password })
            });
            const data = await res.json();

            if (data.success) {
                login(data.user, data.token);
                if (data.user.role === 'student') {
                    navigate('/student-dashboard');
                } else if (['admin', 'faculty', 'staff'].includes(data.user.role)) {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/');
                }
            } else {
                setError(data.message || 'Invalid ID or password.');
            }
        } catch {
            setError('Server error. Please ensure the backend server is running on port 5001.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg"></div>
            <div className="login-card">
                <div className="login-logo">
                    <img
                        src={takshashilaLogo}
                        alt="Takshashila University"
                        style={{ width: '72px', height: '72px', objectFit: 'contain', marginBottom: '16px', filter: 'drop-shadow(0 4px 12px rgba(30,58,138,0.18))' }}
                    />
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--primary-dark)', fontWeight: '800', marginBottom: '6px', letterSpacing: '-0.3px' }}>
                        Takshashila University
                    </h2>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: '500' }}>
                        ERP &amp; Grievance Portal
                    </p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="id" style={{ fontWeight: '600', fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User ID</label>
                        <div className="login-input-icon">
                            <i><User size={16} /></i>
                            <input
                                type="text"
                                id="id"
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                required
                                placeholder="Enter your User ID"
                                autoFocus
                                style={{ fontWeight: '500' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" style={{ fontWeight: '600', fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
                        <div className="login-input-icon" style={{ position: 'relative' }}>
                            <i><Lock size={16} /></i>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Enter your password"
                                style={{ paddingRight: '42px', fontWeight: '500' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                tabIndex={-1}
                                style={{
                                    position: 'absolute', right: '12px', top: '50%',
                                    transform: 'translateY(-50%)', background: 'none',
                                    border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                                    padding: '4px', display: 'flex', alignItems: 'center', lineHeight: 1,
                                    boxShadow: 'none', minWidth: 'unset', height: 'auto'
                                }}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={loading}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '8px', fontWeight: '700', fontSize: '0.95rem',
                            letterSpacing: '0.2px', padding: '13px'
                        }}
                    >
                        {loading ? (
                            <>
                                <span style={{ width: '15px', height: '15px', border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }}></span>
                                Authenticating...
                            </>
                        ) : (
                            <>Sign In <ArrowRight size={17} /></>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
