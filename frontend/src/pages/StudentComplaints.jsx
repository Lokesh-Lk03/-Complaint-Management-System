import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { CheckCircle, RotateCcw, List, Inbox, Eye, Plus, Clock, AlertTriangle, X, Send } from 'lucide-react';
import ViewComplaintModal from '../components/ViewComplaintModal';
import { API_BASE_URL } from '../config/api';

const StudentComplaints = () => {
    const { token } = useContext(AuthContext);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewComplaint, setViewComplaint] = useState(null);

    // Reopen Request Modal State
    const [reopenModalComplaint, setReopenModalComplaint] = useState(null);
    const [reopenReason, setReopenReason] = useState('');
    const [reopenSubmitting, setReopenSubmitting] = useState(false);
    const [reopenError, setReopenError] = useState('');

    const handleReopenSubmit = async (e) => {
        e.preventDefault();
        if (!reopenReason.trim()) {
            setReopenError('Please provide a specific reason why this complaint needs to be reopened.');
            return;
        }

        setReopenSubmitting(true);
        setReopenError('');

        try {
            const res = await fetch(`${API_BASE_URL}/complaints/${reopenModalComplaint.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: 'Reopen Requested',
                    remarks: reopenReason.trim()
                })
            });
            const data = await res.json();
            if (data.success) {
                setReopenModalComplaint(null);
                setReopenReason('');
                alert(`Reopen request submitted successfully for ${reopenModalComplaint.id}.\n\nYour Department Administrator and the Super Administrator have been notified and will review your request.`);
                fetchComplaints();
            } else {
                setReopenError(data.message || 'Failed to submit reopen request.');
            }
        } catch {
            setReopenError('Server error while submitting reopen request.');
        } finally {
            setReopenSubmitting(false);
        }
    };

    const fetchComplaints = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/complaints`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setComplaints(data.data);
        } catch (error) {
            console.error('Failed to fetch complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchComplaints();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
    const reopenedCount = complaints.filter(c => c.status === 'Reopened').length;
    const reopenRequestedCount = complaints.filter(c => c.status === 'Reopen Requested').length;

    const getStatusStyle = (status) => {
        switch (status) {
            case 'New':
                return { bg: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary)' };
            case 'Resolved':
                return { bg: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' };
            case 'In Progress':
                return { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' };
            case 'Reopen Requested':
                return { bg: 'rgba(245, 158, 11, 0.2)', color: '#d97706' };
            case 'Reopened':
                return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' };
            default:
                return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' };
        }
    };

    return (
        <DashboardLayout>
            <div className="section-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-primary)' }}>My Complaints</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.85rem' }}>Student / Complaints</p>
                </div>
                <Link
                    to="/student-dashboard"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 18px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--primary)',
                        color: 'white',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                    }}
                >
                    <Plus size={16} /> Log New Complaint
                </Link>
            </div>

            {/* Top Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: reopenRequestedCount > 0 ? 'repeat(auto-fit, minmax(200px, 1fr))' : 'minmax(0, 1fr) minmax(0, 1fr)',
                gap: '20px',
                marginBottom: '24px'
            }}>
                <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '4px solid var(--success)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resolved</p>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: '700', lineHeight: '1', marginTop: '4px' }}>{resolvedCount}</h3>
                    </div>
                </div>

                <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '4px solid #ef4444' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <RotateCcw size={24} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reopened</p>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: '700', lineHeight: '1', marginTop: '4px' }}>{reopenedCount}</h3>
                    </div>
                </div>

                {reopenRequestedCount > 0 && (
                    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '4px solid #d97706' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock size={24} />
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reopen Pending</p>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: '700', lineHeight: '1', marginTop: '4px', color: '#d97706' }}>{reopenRequestedCount}</h3>
                        </div>
                    </div>
                )}
            </div>

            {/* Table wrapper */}
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <List size={20} style={{ color: 'var(--text-secondary)' }} />
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>My Complaints</h2>
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading complaints...</div>
                ) : complaints.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '64px', height: '64px', background: 'var(--surface-2)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Inbox size={32} style={{ opacity: 0.5 }} />
                        </div>
                        <p style={{ fontSize: '0.95rem' }}>No complaints yet</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: 'var(--surface-2)', fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                    <th style={{ padding: '16px 24px', fontWeight: '600' }}>ID</th>
                                    <th style={{ padding: '16px 24px', fontWeight: '600' }}>Description</th>
                                    <th style={{ padding: '16px 24px', fontWeight: '600' }}>School / Dept</th>
                                    <th style={{ padding: '16px 24px', fontWeight: '600' }}>Course</th>
                                    <th style={{ padding: '16px 24px', fontWeight: '600' }}>Status</th>
                                    <th style={{ padding: '16px 24px', fontWeight: '600' }}>Referral</th>
                                    <th style={{ padding: '16px 24px', fontWeight: '600' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.map(c => {
                                    const style = getStatusStyle(c.status);
                                    return (
                                        <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '16px 24px', fontSize: '0.85rem', fontFamily: 'monospace' }}>{c.id}</td>
                                            <td style={{ padding: '16px 24px', fontSize: '0.85rem', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={c.description}>{c.description}</td>
                                            <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.dept || c.school || '—'}</td>
                                            <td style={{ padding: '16px 24px', fontSize: '0.85rem', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={c.course}>{c.course || '—'}</td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    background: style.bg,
                                                    color: style.color,
                                                }}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 24px', fontSize: '0.85rem' }}>{c.referral || '—'}</td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <button
                                                        onClick={() => {
                                                            setViewComplaint({
                                                                id: c.id,
                                                                studentName: c.studentId,
                                                                course: c.course || 'N/A',
                                                                date: c.created_at ? new Date(c.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
                                                                status: c.status,
                                                                referral: c.referral || '-',
                                                                attachment_url: c.attachment_url || null,
                                                                subject: c.subject || '-',
                                                                type: c.type || '-',
                                                                description: c.description || '-',
                                                                remarks: c.remarks || '-',
                                                                school: c.school || c.dept || '-'
                                                            });
                                                            setIsViewModalOpen(true);
                                                        }}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            padding: '6px 12px',
                                                            borderRadius: '6px',
                                                            border: '1px solid var(--border)',
                                                            background: 'var(--surface-2)',
                                                            color: 'var(--text-primary)',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '600',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <Eye size={14} /> View
                                                    </button>

                                                    {c.status === 'Resolved' && (
                                                        <button
                                                            onClick={() => {
                                                                setReopenModalComplaint(c);
                                                                setReopenReason('');
                                                                setReopenError('');
                                                            }}
                                                            title="Request to reopen this resolved complaint"
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                padding: '6px 12px',
                                                                borderRadius: '6px',
                                                                border: '1px solid #ef4444',
                                                                background: 'rgba(239, 68, 68, 0.1)',
                                                                color: '#ef4444',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '600',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <RotateCcw size={14} /> Reopen
                                                        </button>
                                                    )}

                                                    {c.status === 'Reopen Requested' && (
                                                        <span
                                                            title="Awaiting approval from your department admin and super admin"
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '5px',
                                                                padding: '6px 10px',
                                                                borderRadius: '6px',
                                                                background: 'rgba(245, 158, 11, 0.12)',
                                                                color: '#d97706',
                                                                fontSize: '0.75rem',
                                                                fontWeight: '600'
                                                            }}
                                                        >
                                                            <Clock size={13} /> Awaiting Approval
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Reopen Request Modal */}
            {reopenModalComplaint && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'var(--surface)', width: '100%', maxWidth: '520px',
                        borderRadius: 'var(--radius-lg)', padding: '28px', margin: '20px',
                        boxShadow: 'var(--shadow-2xl)', position: 'relative', border: '1px solid var(--border)',
                        animation: 'slide-up 0.3s ease-out'
                    }}>
                        <button
                            onClick={() => setReopenModalComplaint(null)}
                            style={{
                                position: 'absolute', top: '20px', right: '20px', background: 'transparent',
                                border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                            }}
                        >
                            <X size={22} />
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <RotateCcw size={22} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Request to Reopen Complaint</h2>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>ID: {reopenModalComplaint.id}</p>
                            </div>
                        </div>

                        {/* Informative alert banner */}
                        <div style={{
                            padding: '12px 14px',
                            background: 'rgba(59, 130, 246, 0.08)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '18px',
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'flex-start'
                        }}>
                            <AlertTriangle size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                                Reopening requires administrative review. Your request and reason will be immediately forwarded to your <strong>Department Administrator ({reopenModalComplaint.dept || reopenModalComplaint.school || reopenModalComplaint.type || 'Department'})</strong> and the <strong>Super Administrator</strong> for verification.
                            </p>
                        </div>

                        {reopenError && (
                            <div style={{
                                padding: '10px 14px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.85rem',
                                marginBottom: '16px'
                            }}>
                                {reopenError}
                            </div>
                        )}

                        <form onSubmit={handleReopenSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    Reason for Reopening <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <textarea
                                    value={reopenReason}
                                    onChange={(e) => setReopenReason(e.target.value)}
                                    placeholder="Explain specifically why this issue persists or why the previous resolution was unsatisfactory..."
                                    rows={4}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border)',
                                        background: 'var(--bg)',
                                        color: 'var(--text-primary)',
                                        outline: 'none',
                                        fontSize: '0.9rem',
                                        resize: 'vertical',
                                        lineHeight: 1.5
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setReopenModalComplaint(null)}
                                    disabled={reopenSubmitting}
                                    style={{
                                        padding: '10px 18px',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'var(--surface-2)',
                                        border: '1px solid var(--border)',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={reopenSubmitting}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '10px 20px',
                                        borderRadius: 'var(--radius-md)',
                                        background: '#ef4444',
                                        border: 'none',
                                        color: 'white',
                                        cursor: reopenSubmitting ? 'not-allowed' : 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.85rem',
                                        opacity: reopenSubmitting ? 0.7 : 1
                                    }}
                                >
                                    <Send size={15} />
                                    {reopenSubmitting ? 'Submitting Request...' : 'Send Reopen Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ViewComplaintModal
                isOpen={isViewModalOpen}
                complaint={viewComplaint}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setViewComplaint(null);
                }}
            />
        </DashboardLayout>
    );
};

export default StudentComplaints;

