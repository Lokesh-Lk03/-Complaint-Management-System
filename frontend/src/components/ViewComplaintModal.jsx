import { X, FileText, User, Calendar, Tag, BookOpen, School, MessageSquare, Paperclip, AlertCircle, ArrowRightLeft, Clock } from 'lucide-react';

const statusColors = {
    'New': { bg: 'var(--info-bg)', text: 'var(--info-text)' },
    'In Progress': { bg: 'var(--warning-bg)', text: 'var(--warning-text)' },
    'Resolved': { bg: 'var(--success-bg)', text: 'var(--success-text)' },
    'Reopened': { bg: 'var(--danger-bg)', text: 'var(--danger-text)' },
    'Reopen Requested': { bg: 'rgba(245, 158, 11, 0.2)', text: '#d97706' },
};

const ViewComplaintModal = ({ isOpen, onClose, complaint }) => {
    if (!isOpen || !complaint) return null;

    const colors = statusColors[complaint.status] || statusColors['New'];

    const DetailRow = ({ icon: Icon, label, value, isLink }) => (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>{label}</p>
                {isLink ? (
                    <a href={value} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '500', textDecoration: 'none', wordBreak: 'break-all' }}>
                        <Paperclip size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />View Attachment
                    </a>
                ) : (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '500', margin: 0, wordBreak: 'break-word' }}>{value || '—'}</p>
                )}
            </div>
        </div>
    );

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                background: 'var(--surface)', width: '100%', maxWidth: '540px',
                maxHeight: '90vh', overflowY: 'auto',
                borderRadius: 'var(--radius-lg)', padding: '28px', margin: '20px',
                boxShadow: 'var(--shadow-2xl)', position: 'relative', border: '1px solid var(--border)',
                animation: 'slide-up 0.3s ease-out'
            }}>
                {/* Close Button */}
                <button onClick={onClose} style={{
                    position: 'absolute', top: '20px', right: '20px', background: 'transparent',
                    border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                }}>
                    <X size={24} />
                </button>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={20} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Complaint Details</h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{complaint.id}</p>
                    </div>
                    <span style={{
                        marginLeft: 'auto', padding: '5px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                        background: colors.bg, color: colors.text
                    }}>
                        {complaint.status}
                    </span>
                </div>

                {complaint.status === 'Reopen Requested' && (
                    <div style={{
                        padding: '12px 14px',
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px'
                    }}>
                        <Clock size={18} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ fontSize: '0.83rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                            <strong style={{ color: '#d97706' }}>Reopen Approval Pending:</strong>
                            <div>The student has requested to reopen this complaint. Awaiting action from Department Admin and Super Admin.</div>
                        </div>
                    </div>
                )}

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <DetailRow icon={User} label="Student" value={complaint.studentId && complaint.studentId !== complaint.studentName ? `${complaint.studentName} (${complaint.studentId})` : complaint.studentName} />
                    <DetailRow icon={BookOpen} label="Course" value={complaint.course} />
                    <DetailRow icon={Calendar} label="Date Filed" value={complaint.date} />
                    <DetailRow icon={Tag} label="Category" value={complaint.subject} />
                    <DetailRow icon={AlertCircle} label="Type" value={complaint.type} />
                    <DetailRow icon={MessageSquare} label="Description" value={complaint.description} />
                    <DetailRow icon={ArrowRightLeft} label="Referral" value={complaint.referral} />
                    <DetailRow icon={MessageSquare} label="Admin Remarks" value={complaint.remarks} />
                    {complaint.attachment_url && (
                        <DetailRow icon={Paperclip} label="Attachment" value={complaint.attachment_url} isLink />
                    )}
                </div>

                {/* Close Button */}
                <button onClick={onClose} style={{
                    width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', fontWeight: '600',
                    marginTop: '24px', background: 'var(--surface-2)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.9rem'
                }}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default ViewComplaintModal;
