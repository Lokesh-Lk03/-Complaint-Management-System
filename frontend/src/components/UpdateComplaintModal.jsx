import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { X, Edit } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const UpdateComplaintModal = ({ isOpen, onClose, onSuccess, complaint }) => {
    const { token } = useContext(AuthContext);

    const [status, setStatus] = useState('');
    const [referral, setReferral] = useState('');
    const [remarks, setRemarks] = useState('');

    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (complaint) {
            setStatus(complaint.status || 'New');
            setReferral(complaint.referral && complaint.referral !== '-' ? complaint.referral : '');
            setRemarks(complaint.remarks || '');
            setError('');
        }
    }, [complaint]);

    if (!isOpen || !complaint) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE_URL}/complaints/${complaint.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status,
                    referral,
                    remarks
                })
            });

            const data = await res.json();
            if (data.success) {
                onSuccess();
            } else {
                setError(data.message || 'Failed to update complaint.');
            }
        } catch {
            setError('Server error. Please try again later.');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                background: 'var(--surface)', width: '100%', maxWidth: '500px',
                borderRadius: 'var(--radius-lg)', padding: '24px', margin: '20px',
                boxShadow: 'var(--shadow-2xl)', position: 'relative', border: '1px solid var(--border)'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '20px', right: '20px', background: 'transparent',
                    border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                }}>
                    <X size={24} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                    <Edit size={20} style={{ color: 'var(--primary)' }} />
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Update Complaint {complaint.id}</h2>
                </div>

                {error && <div style={{ padding: '12px', background: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ margin: 0 }}>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' }} required>
                            {complaint.status === 'New' && <option value="New">New</option>}
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Reopened">Reopened</option>
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Referral (Optional)</label>
                        <input type="text" value={referral} onChange={e => setReferral(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' }} placeholder="e.g. IT Department" />
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Remarks (Optional)</label>
                        <textarea value={remarks} onChange={e => setRemarks(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical', minHeight: '80px' }} placeholder="Admin remarks..." />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', fontWeight: '600' }} disabled={submitLoading}>
                        {submitLoading ? 'Updating...' : 'Update Complaint'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdateComplaintModal;
