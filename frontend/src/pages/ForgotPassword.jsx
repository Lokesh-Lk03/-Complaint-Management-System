import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-react';
import takshashilaLogo from '../assets/takshashila_icon.png';
import { API_BASE_URL } from '../config/api';

const ForgotPassword = () => {
    const navigate = useNavigate();

    // Step 1: enter User ID → Step 2: set new password → Step 3: success
    const [step, setStep] = useState(1);
    const [userId, setUserId] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleStep1 = (e) => {
        e.preventDefault();
        setError('');
        if (!userId.trim()) {
            setError('Please enter your User ID.');
            return;
        }
        setStep(2);
    };

    const handleStep2 = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userId.trim(), newPassword })
            });
            const data = await res.json();

            if (data.success) {
                setStep(3);
            } else {
                setError(data.message || 'Reset failed. Please try again.');
            }
        } catch {
            setError('Server error. Make sure the backend is running.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg"></div>
            <div className="login-card">

                {/* Header */}
                <div className="login-logo" style={{ marginBottom: '24px' }}>
                    <div style={{
                        width: '60px', height: '60px', margin: '0 auto 14px',
                        background: 'var(--primary-glow)', borderRadius: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <img src={takshashilaLogo} alt="Logo" style={{ width: '38px', objectFit: 'contain' }} />
                    </div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary-dark)', marginBottom: '6px' }}>
                        {step === 3 ? 'Password Reset!' : 'Reset Password'}
                    </h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {step === 1 && 'Enter your User ID to get started'}
                        {step === 2 && `Setting new password for: ${userId}`}
                        {step === 3 && 'You can now sign in with your new password'}
                    </p>
                </div>

                {/* Step indicators */}
                {step < 3 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px', justifyContent: 'center' }}>
                        {[1, 2].map(s => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{
                                    width: '28px', height: '28px', borderRadius: '50%',
                                    background: step >= s ? 'var(--primary)' : 'var(--border)',
                                    color: step >= s ? '#fff' : 'var(--text-muted)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.75rem', fontWeight: '700',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {s}
                                </div>
                                {s < 2 && <div style={{ width: '40px', height: '2px', background: step > s ? 'var(--primary)' : 'var(--border)', transition: 'all 0.3s ease' }} />}
                            </div>
                        ))}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>
                )}

                {/* STEP 1 — Enter User ID */}
                {step === 1 && (
                    <form onSubmit={handleStep1}>
                        <div className="form-group">
                            <label style={{ fontWeight: '600', fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                User ID
                            </label>
                            <div className="login-input-icon">
                                <i><User size={16} /></i>
                                <input
                                    type="text"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    required
                                    placeholder="Enter your User ID"
                                    autoFocus
                                    style={{ fontWeight: '500' }}
                                />
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                                This is the ID you use to log in (e.g. student roll number or staff ID).
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-full"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '700', padding: '13px' }}
                        >
                            <KeyRound size={16} /> Continue
                        </button>
                    </form>
                )}

                {/* STEP 2 — Set new password */}
                {step === 2 && (
                    <form onSubmit={handleStep2}>
                        <div className="form-group">
                            <label style={{ fontWeight: '600', fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                New Password
                            </label>
                            <div className="login-input-icon" style={{ position: 'relative' }}>
                                <i><Lock size={16} /></i>
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    placeholder="Min. 6 characters"
                                    autoFocus
                                    style={{ paddingRight: '42px', fontWeight: '500' }}
                                />
                                <button type="button" tabIndex={-1} onClick={() => setShowNew(v => !v)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex', alignItems: 'center', boxShadow: 'none', minWidth: 'unset', height: 'auto' }}>
                                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label style={{ fontWeight: '600', fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Confirm New Password
                            </label>
                            <div className="login-input-icon" style={{ position: 'relative' }}>
                                <i><Lock size={16} /></i>
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="Re-enter new password"
                                    style={{ paddingRight: '42px', fontWeight: '500' }}
                                />
                                <button type="button" tabIndex={-1} onClick={() => setShowConfirm(v => !v)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex', alignItems: 'center', boxShadow: 'none', minWidth: 'unset', height: 'auto' }}>
                                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>

                            {/* Password strength hint */}
                            {newPassword && (
                                <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} style={{
                                            height: '4px', flex: 1, borderRadius: '2px',
                                            background: newPassword.length >= i * 4
                                                ? (newPassword.length >= 10 ? 'var(--success)' : newPassword.length >= 6 ? 'var(--warning)' : 'var(--danger)')
                                                : 'var(--border)',
                                            transition: 'background 0.3s'
                                        }} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="button" onClick={() => { setStep(1); setError(''); }}
                                style={{ flex: '0 0 auto', padding: '13px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem' }}>
                                <ArrowLeft size={15} /> Back
                            </button>
                            <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '700', padding: '13px' }}>
                                {isSubmitting ? (
                                    <>
                                        <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }}></span>
                                        Resetting...
                                    </>
                                ) : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                )}

                {/* STEP 3 — Success */}
                {step === 3 && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '50%',
                            background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px', animation: 'slide-up 0.4s cubic-bezier(0.34,1.56,0.64,1)'
                        }}>
                            <CheckCircle2 size={34} />
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.6' }}>
                            Password for <strong style={{ color: 'var(--text-primary)' }}>{userId}</strong> has been reset successfully.
                        </p>
                        <button
                            className="btn btn-primary btn-full"
                            onClick={() => navigate('/')}
                            style={{ fontWeight: '700', padding: '13px' }}
                        >
                            Go to Sign In
                        </button>
                    </div>
                )}

                {/* Back to login link */}
                {step < 3 && (
                    <div style={{ textAlign: 'center', marginTop: '22px' }}>
                        <Link to="/" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            color: 'var(--text-muted)', textDecoration: 'none',
                            fontSize: '0.82rem', fontWeight: '500'
                        }}>
                            <ArrowLeft size={14} /> Back to Sign In
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
