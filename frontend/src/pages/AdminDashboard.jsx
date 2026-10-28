import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Edit2, Search, Eye, Check, X, Clock } from 'lucide-react';
import UpdateComplaintModal from '../components/UpdateComplaintModal';
import ViewComplaintModal from '../components/ViewComplaintModal';
import { API_BASE_URL } from '../config/api';

const AdminDashboard = () => {
    const { token, user } = useContext(AuthContext);
    const [complaints, setComplaints] = useState([]);
    const [, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [categoryFilter, setCategoryFilter] = useState(
        (user?.dept && user?.role !== 'admin') ? user.dept : 'All Categories'
    );
    const [searchQuery, setSearchQuery] = useState('');

    // Update Modal States
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    // View Modal States
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewComplaint, setViewComplaint] = useState(null);

    const isDepartmentAdmin = user?.dept && user?.role !== 'admin';

    const handleQuickStatus = async (complaintId, targetStatus, remarksText) => {
        try {
            const res = await fetch(`${API_BASE_URL}/complaints/${complaintId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: targetStatus,
                    remarks: remarksText
                })
            });
            const data = await res.json();
            if (data.success) {
                fetchAllComplaints();
            } else {
                alert(data.message || `Failed to update status to ${targetStatus}`);
            }
        } catch {
            alert('Server error updating complaint status.');
        }
    };

    const fetchAllComplaints = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/complaints`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                // Map the DB fields to the format the table expects
                const formattedComplaints = data.data.map(c => ({
                    id: c.id,
                    studentName: c.studentName || c.users?.name || c.studentId,
                    studentId: c.studentId,
                    course: c.course || 'N/A',
                    date: new Date(c.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    status: c.status,
                    referral: c.referral || '-',
                    attachment_url: c.attachment_url || null,
                    subject: c.subject || '-',
                    type: c.type || '-',
                    description: c.description || '-',
                    remarks: c.remarks || '-',
                    school: c.school || '-'
                }));
                setComplaints(formattedComplaints);
            }
        } catch (error) {
            console.error('Failed to fetch complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchAllComplaints();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const filteredComplaints = complaints.filter(c => {
        const matchesStatus = statusFilter === 'All Status' || c.status === statusFilter;
        const matchesCategory = isDepartmentAdmin
            ? (c.type && c.type.toLowerCase().includes(user.dept.toLowerCase()))
            : (categoryFilter === 'All Categories' || c.type === categoryFilter);
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery ||
            String(c.studentName || '').toLowerCase().includes(searchLower) ||
            String(c.studentId || '').toLowerCase().includes(searchLower) ||
            String(c.id || '').toLowerCase().includes(searchLower) ||
            String(c.course || '').toLowerCase().includes(searchLower);
        return matchesStatus && matchesCategory && matchesSearch;
    });

    return (
        <DashboardLayout>
            <div className="section-header" style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {isDepartmentAdmin ? `${user.dept} Department Dashboard` : 'Dashboard'}
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.85rem' }}>
                    Admin / Dashboard {isDepartmentAdmin ? `(${user.dept} Portal)` : ''}
                </p>
            </div>



            {/* Main Table Area */}
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>

                {/* Table Header Controls */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>Complaint Management</h2>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                <Search size={16} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search complaints..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ padding: '8px 16px 8px 36px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem', minWidth: '200px' }}
                            />
                        </div>
                        {!isDepartmentAdmin && (
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem', appearance: 'auto' }}
                            >
                                <option value="All Categories">All Categories</option>
                                <option value="Academic">Academic</option>
                                <option value="Infrastructure">Infrastructure</option>
                                <option value="Transport">Transport</option>
                                <option value="Hostel">Hostel</option>
                                <option value="Discipline">Discipline</option>
                                <option value="Other">Other</option>
                            </select>
                        )}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem', appearance: 'auto' }}
                        >
                            <option value="All Status">All Status</option>
                            <option value="New">New</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Reopened">Reopened</option>
                            <option value="Reopen Requested">Reopen Requested</option>
                        </select>
                    </div>
                </div >

                {/* Table */}
                < div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>ID</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Student Name</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Course</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Category</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Date</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Status</th>

                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredComplaints.map((c) => (
                                <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '16px 24px', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>{c.id}</td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                        <div style={{ fontWeight: '600' }}>{c.studentName}</div>
                                        {c.studentId && c.studentId !== c.studentName && (
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>ID: {c.studentId}</div>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{c.course}</td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{c.type}</td>
                                    <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{c.date}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            background: c.status === 'Resolved' ? 'var(--success-bg)' : c.status === 'New' ? 'var(--info-bg)' : c.status === 'In Progress' ? 'var(--warning-bg)' : c.status === 'Reopen Requested' ? 'rgba(245, 158, 11, 0.2)' : 'var(--danger-bg)',
                                            color: c.status === 'Resolved' ? 'var(--success-text)' : c.status === 'New' ? 'var(--info-text)' : c.status === 'In Progress' ? 'var(--warning-text)' : c.status === 'Reopen Requested' ? '#d97706' : 'var(--danger-text)',
                                        }}>
                                            {c.status}
                                        </span>
                                    </td>


                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            {c.status === 'Reopen Requested' && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm(`Approve reopening for complaint ${c.id}?`)) {
                                                                handleQuickStatus(c.id, 'Reopened', 'Reopen approved by administrator.');
                                                            }
                                                        }}
                                                        title="Approve Reopen Request"
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            padding: '6px 10px',
                                                            borderRadius: '6px',
                                                            border: 'none',
                                                            background: 'rgba(16, 185, 129, 0.15)',
                                                            color: 'var(--success)',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '600',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <Check size={14} /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const reason = prompt(`Decline reopening for complaint ${c.id}? Provide remarks (optional):`, 'Reopen request reviewed and kept resolved.');
                                                            if (reason !== null) {
                                                                handleQuickStatus(c.id, 'Resolved', reason);
                                                            }
                                                        }}
                                                        title="Decline Reopen Request"
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            padding: '6px 10px',
                                                            borderRadius: '6px',
                                                            border: 'none',
                                                            background: 'rgba(239, 68, 68, 0.12)',
                                                            color: '#ef4444',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '600',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <X size={14} /> Decline
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setViewComplaint(c);
                                                    setIsViewModalOpen(true);
                                                }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '8px 14px',
                                                    borderRadius: '6px',
                                                    border: '1px solid var(--border)',
                                                    background: 'var(--surface-2)',
                                                    color: 'var(--text-primary)',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Eye size={14} /> View
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedComplaint(c);
                                                    setIsUpdateModalOpen(true);
                                                }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '8px 14px',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    background: 'var(--primary)',
                                                    color: 'white',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Edit2 size={14} /> Update
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {
                        filteredComplaints.length === 0 && (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                No complaints found matching the current criteria.
                            </div>
                        )
                    }
                </div >
            </div >

            <ViewComplaintModal
                isOpen={isViewModalOpen}
                complaint={viewComplaint}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setViewComplaint(null);
                }}
            />

            <UpdateComplaintModal
                isOpen={isUpdateModalOpen}
                complaint={selectedComplaint}
                onClose={() => {
                    setIsUpdateModalOpen(false);
                    setSelectedComplaint(null);
                }}
                onSuccess={() => {
                    setIsUpdateModalOpen(false);
                    setSelectedComplaint(null);
                    fetchAllComplaints();
                }}
            />
        </DashboardLayout >
    );
};

export default AdminDashboard;
