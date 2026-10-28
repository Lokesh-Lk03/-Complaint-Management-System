import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, ArrowRight, Eye, EyeOff, Mail, GraduationCap, BookOpen, Building2, AlertCircle, UserPlus, LogIn } from 'lucide-react';
import takshashilaLogo from '../assets/takshashila_icon.png';
import { API_BASE_URL } from '../config/api';
import { DEPARTMENTS, STUDY_LEVELS, getCourses } from '../config/academicData';

const Login = ({ initialMode = 'login' }) => {
    const { user, login } = useContext(AuthContext);
    const navigate = useNavigate();

    // Mode: 'login' | 'signup'
    const [mode, setMode] = useState(initialMode);

    // Login Form State
    const [loginId, setLoginId] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    // Signup Form State (Student Only)
    const [signupForm, setSignupForm] = useState({
        studentId: '',
        fullName: '',
        email: '',
        dept: '',
        studyLevel: '',
        course: '',
        password: '',
        confirmPassword: ''
    });
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

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

    // Available study levels based on selected department
    const selectedDeptObj = DEPARTMENTS.find(d => d.name === signupForm.dept);
    const availableStudyLevels = selectedDeptObj
        ? STUDY_LEVELS.filter(lvl => Array.isArray(selectedDeptObj[lvl]) && selectedDeptObj[lvl].length > 0)
        : STUDY_LEVELS;

    // Available courses based on selected department and study level
    const availableCourses = (signupForm.dept && signupForm.studyLevel)
        ? getCourses(signupForm.dept, signupForm.studyLevel)
        : [];

    const handleSignupDeptChange = (e) => {
        const newDept = e.target.value;
        const deptObj = DEPARTMENTS.find(d => d.name === newDept);
        let newLevel = signupForm.studyLevel;

        if (deptObj) {
            const validLevels = STUDY_LEVELS.filter(lvl => Array.isArray(deptObj[lvl]) && deptObj[lvl].length > 0);
            if (!validLevels.includes(newLevel)) {
                newLevel = validLevels[0] || '';
            }
        } else {
            newLevel = '';
        }

        setSignupForm(prev => ({
            ...prev,
            dept: newDept,
            studyLevel: newLevel,
            course: ''
        }));
    };

    const handleSignupLevelChange = (e) => {
        const newLevel = e.target.value;
        setSignupForm(prev => ({
            ...prev,
            studyLevel: newLevel,
            course: ''
        }));
    };

    // ─── LOGIN SUBMIT ───
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: loginId.trim(), password: loginPassword })
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

    // ─── STUDENT SIGNUP SUBMIT ───
    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (signupForm.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (signupForm.password !== signupForm.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (!signupForm.dept || !signupForm.studyLevel || !signupForm.course) {
            setError('Please select your Department, Study Level, and Course.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: signupForm.studentId.trim(),
                    name: signupForm.fullName.trim(),
                    email: signupForm.email.trim().toLowerCase(),
                    dept: signupForm.dept,
                    study_level: signupForm.studyLevel,
                    course: signupForm.course,
                    password: signupForm.password
                })
            });
            const data = await res.json();

            if (data.success) {
                // Directly log in the student with their new credentials
                login(data.user, data.token);
                navigate('/student-dashboard');
            } else {
                setError(data.message || 'Failed to create student account.');
            }
        } catch {
            setError('Server error during registration. Please verify the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg"></div>
            <div
                className="login-card"
                style={{
                    maxWidth: mode === 'signup' ? '540px' : '430px',
                    transition: 'max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    padding: mode === 'signup' ? '36px 36px 32px' : '42px 38px 36px'
                }}
            >
                <div className="login-logo" style={{ marginBottom: '20px' }}>
                    <img
                        src={takshashilaLogo}
                        alt="Takshashila University"
                        style={{ width: '64px', height: '64px', objectFit: 'contain', marginBottom: '12px', filter: 'drop-shadow(0 4px 12px rgba(30,58,138,0.18))' }}
                    />
                    <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-dark)', fontWeight: '800', marginBottom: '4px', letterSpacing: '-0.3px' }}>
                        Takshashila University
                    </h2>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: '500' }}>
                        ERP &amp; Grievance Portal
                    </p>
                </div>

                {/* ─── Mode Selector Tabs ─── */}
                <div style={{
                    display: 'flex',
                    background: 'var(--surface-2, rgba(0,0,0,0.04))',
                    padding: '4px',
                    borderRadius: '10px',
                    marginBottom: '20px',
                    border: '1px solid var(--border)'
                }}>
                    <button
                        type="button"
                        onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }}
                        style={{
                            flex: 1,
                            padding: '9px 12px',
                            border: 'none',
                            borderRadius: '8px',
                            background: mode === 'login' ? 'var(--surface, #fff)' : 'transparent',
                            color: mode === 'login' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: mode === 'login' ? '700' : '600',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            boxShadow: mode === 'login' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <LogIn size={15} /> Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode('signup'); setError(''); setSuccessMessage(''); }}
                        style={{
                            flex: 1,
                            padding: '9px 12px',
                            border: 'none',
                            borderRadius: '8px',
                            background: mode === 'signup' ? 'var(--surface, #fff)' : 'transparent',
                            color: mode === 'signup' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: mode === 'signup' ? '700' : '600',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            boxShadow: mode === 'signup' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <GraduationCap size={16} /> Student Sign Up
                    </button>
                </div>

                {error && <div className="alert alert-error" style={{ marginBottom: '16px', fontSize: '0.85rem' }}>{error}</div>}
                {successMessage && <div className="alert alert-success" style={{ marginBottom: '16px', fontSize: '0.85rem' }}>{successMessage}</div>}

                {/* ════════════════════ SIGN IN FORM ════════════════════ */}
                {mode === 'login' && (
                    <form onSubmit={handleLoginSubmit}>
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label htmlFor="id" style={{ fontWeight: '600', fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User ID</label>
                            <div className="login-input-icon">
                                <i><User size={16} /></i>
                                <input
                                    type="text"
                                    id="id"
                                    value={loginId}
                                    onChange={(e) => setLoginId(e.target.value)}
                                    required
                                    placeholder="Enter your User ID"
                                    autoFocus
                                    style={{ fontWeight: '500' }}
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <label htmlFor="password" style={{ fontWeight: '600', fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Password</label>
                                <Link
                                    to="/forgot-password"
                                    style={{ fontSize: '0.76rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="login-input-icon" style={{ position: 'relative' }}>
                                <i><Lock size={16} /></i>
                                <input
                                    type={showLoginPassword ? 'text' : 'password'}
                                    id="password"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    required
                                    placeholder="Enter your password"
                                    style={{ paddingRight: '42px', fontWeight: '500' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowLoginPassword(v => !v)}
                                    tabIndex={-1}
                                    style={{
                                        position: 'absolute', right: '12px', top: '50%',
                                        transform: 'translateY(-50%)', background: 'none',
                                        border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                                        padding: '4px', display: 'flex', alignItems: 'center', lineHeight: 1,
                                        boxShadow: 'none', minWidth: 'unset', height: 'auto'
                                    }}
                                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                                letterSpacing: '0.2px', padding: '13px', borderRadius: 'var(--radius-md)'
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

                        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            New student at Takshashila?{' '}
                            <button
                                type="button"
                                onClick={() => { setMode('signup'); setError(''); }}
                                style={{
                                    background: 'none', border: 'none', padding: 0,
                                    color: 'var(--primary)', fontWeight: '700', cursor: 'pointer',
                                    fontSize: '0.82rem', textDecoration: 'underline'
                                }}
                            >
                                Create Student Account
                            </button>
                        </div>
                    </form>
                )}

                {/* ════════════════════ STUDENT SIGN UP FORM ════════════════════ */}
                {mode === 'signup' && (
                    <form onSubmit={handleSignupSubmit}>
                        {/* Notice Banner */}
                        <div style={{
                            padding: '10px 12px',
                            background: 'rgba(59, 130, 246, 0.08)',
                            border: '1px solid rgba(59, 130, 246, 0.25)',
                            borderRadius: '8px',
                            marginBottom: '18px',
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center'
                        }}>
                            <AlertCircle size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                            <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                                <strong>Student Self-Registration Only.</strong> Staff and Admin accounts are provisioned exclusively by Central Administration.
                            </p>
                        </div>

                        {/* ID & Full Name Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                    Roll No / Student ID <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <div className="login-input-icon">
                                    <i><User size={15} /></i>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 22BCSE101"
                                        value={signupForm.studentId}
                                        onChange={e => setSignupForm({ ...signupForm, studentId: e.target.value })}
                                        style={{ fontSize: '0.85rem' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                    Full Name <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <div className="login-input-icon">
                                    <i><GraduationCap size={15} /></i>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Lokesh V"
                                        value={signupForm.fullName}
                                        onChange={e => setSignupForm({ ...signupForm, fullName: e.target.value })}
                                        style={{ fontSize: '0.85rem' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="form-group" style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontWeight: '600', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                College Email <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <div className="login-input-icon">
                                <i><Mail size={15} /></i>
                                <input
                                    type="email"
                                    required
                                    placeholder="e.g. student@takshashila.edu"
                                    value={signupForm.email}
                                    onChange={e => setSignupForm({ ...signupForm, email: e.target.value })}
                                    style={{ fontSize: '0.85rem' }}
                                />
                            </div>
                        </div>

                        {/* Department & Study Level Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                    Department <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <div className="login-input-icon">
                                    <i><Building2 size={15} /></i>
                                    <select
                                        required
                                        value={signupForm.dept}
                                        onChange={handleSignupDeptChange}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px 10px 38px',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid var(--border)',
                                            background: 'var(--bg)',
                                            color: 'var(--text-primary)',
                                            outline: 'none',
                                            fontSize: '0.85rem',
                                            fontWeight: '500'
                                        }}
                                    >
                                        <option value="">Select Department</option>
                                        {DEPARTMENTS.map(d => (
                                            <option key={d.name} value={d.name}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                    Level <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <select
                                    required
                                    value={signupForm.studyLevel}
                                    onChange={handleSignupLevelChange}
                                    disabled={!signupForm.dept}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--border)',
                                        background: 'var(--bg)',
                                        color: 'var(--text-primary)',
                                        outline: 'none',
                                        fontSize: '0.85rem',
                                        fontWeight: '500'
                                    }}
                                >
                                    <option value="">Level</option>
                                    {availableStudyLevels.map(lvl => (
                                        <option key={lvl} value={lvl}>{lvl}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Course (Dynamically Filtered) */}
                        <div className="form-group" style={{ marginBottom: '14px' }}>
                            <label style={{ display: 'block', fontWeight: '600', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                Course <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <div className="login-input-icon">
                                <i><BookOpen size={15} /></i>
                                <select
                                    required
                                    value={signupForm.course}
                                    onChange={e => setSignupForm({ ...signupForm, course: e.target.value })}
                                    disabled={!signupForm.dept || !signupForm.studyLevel}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px 10px 38px',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--border)',
                                        background: 'var(--bg)',
                                        color: 'var(--text-primary)',
                                        outline: 'none',
                                        fontSize: '0.85rem',
                                        fontWeight: '500'
                                    }}
                                >
                                    <option value="">
                                        {!signupForm.dept
                                            ? 'Select Department first'
                                            : !signupForm.studyLevel
                                                ? 'Select Study Level'
                                                : availableCourses.length === 0
                                                    ? 'No courses available'
                                                    : 'Select Enrolled Course'}
                                    </option>
                                    {availableCourses.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Password & Confirm Password Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                    Password <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <div className="login-input-icon" style={{ position: 'relative' }}>
                                    <i><Lock size={15} /></i>
                                    <input
                                        type={showSignupPassword ? 'text' : 'password'}
                                        required
                                        placeholder="Min 6 chars"
                                        value={signupForm.password}
                                        onChange={e => setSignupForm({ ...signupForm, password: e.target.value })}
                                        style={{ paddingRight: '36px', fontSize: '0.85rem' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowSignupPassword(v => !v)}
                                        tabIndex={-1}
                                        style={{
                                            position: 'absolute', right: '8px', top: '50%',
                                            transform: 'translateY(-50%)', background: 'none',
                                            border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                                            padding: '4px', display: 'flex', alignItems: 'center'
                                        }}
                                        aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showSignupPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                    Confirm <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <div className="login-input-icon" style={{ position: 'relative' }}>
                                    <i><Lock size={15} /></i>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        placeholder="Re-enter password"
                                        value={signupForm.confirmPassword}
                                        onChange={e => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                                        style={{ paddingRight: '36px', fontSize: '0.85rem' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(v => !v)}
                                        tabIndex={-1}
                                        style={{
                                            position: 'absolute', right: '8px', top: '50%',
                                            transform: 'translateY(-50%)', background: 'none',
                                            border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                                            padding: '4px', display: 'flex', alignItems: 'center'
                                        }}
                                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-full"
                            disabled={loading}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '8px', fontWeight: '700', fontSize: '0.95rem',
                                letterSpacing: '0.2px', padding: '13px', borderRadius: 'var(--radius-md)'
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={{ width: '15px', height: '15px', border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }}></span>
                                    Creating Account...
                                </>
                            ) : (
                                <>Register &amp; Sign In <UserPlus size={17} /></>
                            )}
                        </button>

                        <div style={{ marginTop: '18px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => { setMode('login'); setError(''); }}
                                style={{
                                    background: 'none', border: 'none', padding: 0,
                                    color: 'var(--primary)', fontWeight: '700', cursor: 'pointer',
                                    fontSize: '0.82rem', textDecoration: 'underline'
                                }}
                            >
                                Sign In
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
