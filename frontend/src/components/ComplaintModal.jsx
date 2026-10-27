import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { X, Edit } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { DEPARTMENTS, STUDY_LEVELS, getCourses } from '../config/academicData';

const ComplaintModal = ({ isOpen, onClose, onSuccess }) => {
    const { user, token } = useContext(AuthContext);

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [gender, setGender] = useState('');
    const [department, setDepartment] = useState('');
    const [studyLevel, setStudyLevel] = useState('');
    const [course, setCourse] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');

    // Derived: available courses based on dept + level
    const availableCourses = getCourses(department, studyLevel);

    // Check if selected dept has PG options
    const selectedDept = DEPARTMENTS.find(d => d.name === department);
    const availableLevels = selectedDept
        ? STUDY_LEVELS.filter(lvl => selectedDept[lvl] && selectedDept[lvl].length > 0)
        : STUDY_LEVELS;

    if (!isOpen) return null;

    const resetForm = () => {
        setName(user?.name || '');
        setEmail(user?.email || '');
        setGender('');
        setDepartment('');
        setStudyLevel('');
        setCourse('');
        setCategory('');
        setDescription('');
        setError('');
    };

    const handleClose = () => { resetForm(); onClose(); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE_URL}/complaints`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token || localStorage.getItem('erp_token')}`
                },
                body: JSON.stringify({
                    type: category,
                    subject: category,
                    description,
                    course,
                    school: department
                })
            });

            const data = await res.json();
            if (data.success) {
                resetForm();
                onSuccess();
            } else {
                setError(data.message || 'Failed to submit complaint.');
            }
        } catch {
            setError('Server error. Please try again later.');
        } finally {
            setSubmitLoading(false);
        }
    };

    const selectStyle = {
        width: '100%', padding: '10px 14px',
        borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
        background: 'var(--bg)', color: 'var(--text-primary)',
        outline: 'none', appearance: 'auto', fontSize: '0.9rem'
    };
    const disabledSelectStyle = { ...selectStyle, opacity: 0.55, cursor: 'not-allowed', background: 'var(--surface-2)' };
    const labelStyle = { display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                background: 'var(--surface)', width: '100%', maxWidth: '520px',
                maxHeight: '92vh', overflowY: 'auto',
                borderRadius: 'var(--radius-lg)', padding: '28px 28px 24px', margin: '20px',
                boxShadow: 'var(--shadow-xl)', position: 'relative', border: '1px solid var(--border)'
            }}>
                {/* Header */}
                <button onClick={handleClose} style={{
                    position: 'absolute', top: '18px', right: '18px', background: 'transparent',
                    border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px'
                }}>
                    <X size={22} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                    <Edit size={20} style={{ color: 'var(--primary)' }} />
                    <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Submit a Complaint</h2>
                </div>

                {error && (
                    <div style={{ padding: '12px', background: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ margin: 0 }}>

                    {/* Full Name */}
                    <div className="form-group" style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)}
                            style={{ ...selectStyle }} placeholder="Your full name" required />
                    </div>

                    {/* Email */}
                    <div className="form-group" style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            style={{ ...selectStyle }} placeholder="your@email.com" required />
                    </div>

                    {/* Gender */}
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Gender</label>
                        <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            {['Male', 'Female', 'Others'].map(g => (
                                <label key={g} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                    <input type="radio" name="modal_gender" value={g} onChange={e => setGender(e.target.value)} required />
                                    {g}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ height: '1px', background: 'var(--border)', margin: '6px 0 16px' }} />

                    {/* Department */}
                    <div className="form-group" style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Department</label>
                        <select
                            value={department}
                            onChange={e => { setDepartment(e.target.value); setStudyLevel(''); setCourse(''); }}
                            style={selectStyle}
                            required
                        >
                            <option value="" disabled>— Select Department —</option>
                            {DEPARTMENTS.map(d => (
                                <option key={d.name} value={d.name}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Study Level */}
                    <div className="form-group" style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>
                            Study Level
                            {!department && <span style={{ fontWeight: '400', fontStyle: 'italic', opacity: 0.6, marginLeft: '6px' }}>(select department first)</span>}
                        </label>
                        <select
                            value={studyLevel}
                            onChange={e => { setStudyLevel(e.target.value); setCourse(''); }}
                            style={department ? selectStyle : disabledSelectStyle}
                            disabled={!department}
                            required
                        >
                            <option value="" disabled>— UG / PG —</option>
                            {availableLevels.map(lvl => (
                                <option key={lvl} value={lvl}>{lvl}</option>
                            ))}
                        </select>
                    </div>

                    {/* Course */}
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>
                            Course / Programme
                            {!studyLevel && <span style={{ fontWeight: '400', fontStyle: 'italic', opacity: 0.6, marginLeft: '6px' }}>(select study level first)</span>}
                        </label>
                        <select
                            value={course}
                            onChange={e => setCourse(e.target.value)}
                            style={studyLevel ? selectStyle : disabledSelectStyle}
                            disabled={!studyLevel}
                            required
                        >
                            <option value="" disabled>— Select Course —</option>
                            {availableCourses.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Divider */}
                    <div style={{ height: '1px', background: 'var(--border)', margin: '6px 0 16px' }} />

                    {/* Category */}
                    <div className="form-group" style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Complaint Category</label>
                        <select value={category} onChange={e => setCategory(e.target.value)} style={selectStyle} required>
                            <option value="" disabled>— Select Category —</option>
                            <option value="Academic">Academic</option>
                            <option value="Infrastructure">Infrastructure</option>
                            <option value="Transport">Transport</option>
                            <option value="Hostel">Hostel</option>
                            <option value="Discipline">Discipline</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div className="form-group" style={{ marginBottom: '22px' }}>
                        <label style={labelStyle}>Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            style={{ ...selectStyle, resize: 'vertical', minHeight: '90px' }}
                            placeholder="Describe your complaint in detail…"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '13px', borderRadius: 'var(--radius-md)', fontWeight: '700', fontSize: '0.95rem' }}
                        disabled={submitLoading}
                    >
                        {submitLoading ? 'Submitting…' : 'Submit Complaint'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ComplaintModal;
