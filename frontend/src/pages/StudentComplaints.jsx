import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { CheckCircle, RotateCcw, List, Inbox, Eye, Plus } from 'lucide-react';
import ViewComplaintModal from '../components/ViewComplaintModal';
import { API_BASE_URL } from '../config/api';

const StudentComplaints = () => {
    const { token } = useContext(AuthContext);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewComplaint, setViewComplaint] = useState(null);

    const handleReopen = async (complaintId) => {
        if (!window.confirm(`Are you sure you want to reopen complaint ${complaintId}?`)) return;
        try {
            const res = await fetch(`${API_BASE_URL}/complaints/${complaintId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Reopened', remarks: 'Reopened by student.' })
            });
            const data = await res.json();
            if (data.success) {
                fetchComplaints();
            } else {
                alert(data.message || 'Failed to reopen complaint.');
            }
        } catch {
            alert('Server error reopening complaint.');
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
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px', marginBottom: '24px' }}>
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
            </div>

            {/* Table wrapper - takes full width now */}
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
                                    <th style={{ padding: '16px 24px', fontWeight: '600' }}>School</th>
                                    <th style={{ padding: '16px 24px', fontWeight: '600' }}>Course</th>
                                    <th style={{ padding: '16px 24px', fontWeight: '600' }}>Status</th>
                                    <th style={{ padding: '16px 24px', fontWeight: '600' }}>Referral</th>
                                    <th style={{ padding: '16px 24px', fontWeight: '600' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.map(c => (
                                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '16px 24px', fontSize: '0.85rem', fontFamily: 'monospace' }}>{c.id}</td>
                                        <td style={{ padding: '16px 24px', fontSize: '0.85rem', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={c.description}>{c.description}</td>
                                        <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.school || '—'}</td>
                                        <td style={{ padding: '16px 24px', fontSize: '0.85rem', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={c.course}>{c.course || '—'}</td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                background: c.status === 'New' ? 'rgba(59, 130, 246, 0.15)' : c.status === 'Resolved' ? 'rgba(16, 185, 129, 0.15)' : c.status === 'In Progress' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                color: c.status === 'New' ? 'var(--primary)' : c.status === 'Resolved' ? 'var(--success)' : c.status === 'In Progress' ? 'var(--warning)' : '#ef4444',
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
                                                            school: c.school || '-'
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
                                                        onClick={() => handleReopen(c.id)}
                                                        title="Reopen this resolved complaint"
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
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

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
