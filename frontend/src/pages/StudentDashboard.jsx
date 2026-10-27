import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Search, Clock, CheckCircle, Edit } from 'lucide-react';
import AnimatedCounter from '../components/AnimatedCounter';
import { API_BASE_URL } from '../config/api';
import { DEPARTMENTS, STUDY_LEVELS, getCourses } from '../config/academicData';

const StudentDashboard = () => {
    const { user, token } = useContext(AuthContext);
    const [recentComplaints, setRecentComplaints] = useState([]);
    const [, setLoading] = useState(true);

    // Form states
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [department, setDepartment] = useState('');
    const [studyLevel, setStudyLevel] = useState('');
    const [course, setCourse] = useState('');
    const [category, setCategory] = useState('Academic');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [attachment, setAttachment] = useState(null);

    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);

    // Derived courses
    const availableCourses = getCourses(department, studyLevel);
    const selectedDept = DEPARTMENTS.find(d => d.name === department);
    const availableLevels = selectedDept
        ? STUDY_LEVELS.filter(lvl => selectedDept[lvl] && selectedDept[lvl].length > 0)
        : STUDY_LEVELS;

    const fetchComplaints = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/complaints`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setRecentComplaints(data.data.slice(0, 5)); // Get top 5 recent
            }
        } catch (error) {
            console.error('Failed to fetch complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchComplaints();
        if (user) {
            if (!name && user.name) setName(user.name);
            if (!email && user.email) setEmail(user.email);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const formData = new FormData();
            formData.append('type', category || 'Other');
            formData.append('subject', subject || `${category || 'Grievance'} regarding ${course || 'General'}`);
            formData.append('description', description);
            formData.append('course', course);
            formData.append('school', department);

            if (attachment) {
                formData.append('attachment', attachment);
            }

            const res = await fetch(`${API_BASE_URL}/complaints`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token || localStorage.getItem('erp_token')}`
                },
                body: formData
            });

            const data = await res.json();
            if (data.success) {
                setSubject('');
                setDescription('');
                setDepartment('');
                setStudyLevel('');
                setCourse('');
                setAttachment(null);
                setSuccessMessage('Complaint submitted successfully!');
                setIsFormVisible(false);
                fetchComplaints(); // refresh stats
                setTimeout(() => setSuccessMessage(''), 5000);
            } else {
                setError(data.message || 'Failed to submit complaint.');
            }
        } catch {
            setError('Server error. Please try again later.');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleClear = () => {
        setName(user?.name || '');
        setEmail(user?.email || '');
        setDepartment('');
        setStudyLevel('');
        setCourse('');
        setSubject('');
        setDescription('');
        setAttachment(null);
        setError('');
        setSuccessMessage('');
    };

    const stats = {
        total: recentComplaints.length, // Or from a separate endpoint if needed
        pending: recentComplaints.filter(c => c.status !== 'Resolved').length,
        resolved: recentComplaints.filter(c => c.status === 'Resolved').length
    };

    return (
        <DashboardLayout>
            <div className="section-header" style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-primary)' }}>Welcome back, {user?.name || 'Student'}!</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Here is an overview of your academic and complaint status.</p>
            </div>

            {/* Stats Grid Setup from CSS Framework */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>

                <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)', cursor: 'default', animation: 'cardEnter 0.5s cubic-bezier(0.4,0,0.2,1) 0.05s both' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Search size={22} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: '700', lineHeight: '1' }}>{<AnimatedCounter end={stats.total} />}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px', fontWeight: '500' }}>Total Complaints</p>
                    </div>
                </div>

                <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)', cursor: 'default', animation: 'cardEnter 0.5s cubic-bezier(0.4,0,0.2,1) 0.1s both' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--warning-bg)', color: 'var(--warning-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={22} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: '700', lineHeight: '1' }}>{<AnimatedCounter end={stats.pending} />}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px', fontWeight: '500' }}>Pending</p>
                    </div>
                </div>

                <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)', cursor: 'default', animation: 'cardEnter 0.5s cubic-bezier(0.4,0,0.2,1) 0.15s both' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--success-bg)', color: 'var(--success-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={22} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: '700', lineHeight: '1' }}>{<AnimatedCounter end={stats.resolved} />}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px', fontWeight: '500' }}>Resolved</p>
                    </div>
                </div>
            </div>

            {user?.role !== 'admin' && !isFormVisible && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '30px' }}>
                    <button
                        onClick={() => setIsFormVisible(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: 'var(--radius-md)', fontWeight: '600', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                        <Edit size={18} /> Log a New Complaint
                    </button>
                </div>
            )}

            {user?.role !== 'admin' && isFormVisible && (
                <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                        <Edit size={20} style={{ color: 'var(--primary)' }} />
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Log a New Complaint</h2>
                    </div>

                    {error && <div style={{ padding: '12px', background: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem' }}>{error}</div>}
                    {successMessage && <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px', animation: 'cardEnter 0.4s ease-out both' }}><CheckCircle size={18} /> {successMessage}</div>}

                    <form onSubmit={handleSubmit} style={{ margin: 0 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Full Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' }} required />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Email Address</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' }} required />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                            <div className="form-group">
                                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>🏛 Department</label>
                                <select value={department} onChange={e => { setDepartment(e.target.value); setStudyLevel(''); setCourse(''); }} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontWeight: '600', outline: 'none' }} required>
                                    <option value="" disabled>— Select Department —</option>
                                    {DEPARTMENTS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>📚 Study Level {!department && <span style={{ fontWeight: 'normal', fontStyle: 'italic', opacity: 0.6 }}>(select department first)</span>}</label>
                                <select value={studyLevel} onChange={e => { setStudyLevel(e.target.value); setCourse(''); }} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: department ? 'var(--bg)' : 'var(--surface-2)', color: 'var(--text-primary)', fontWeight: '600', outline: 'none', opacity: department ? 1 : 0.55 }} disabled={!department} required>
                                    <option value="" disabled>— UG / PG —</option>
                                    {availableLevels.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>🎓 Course {!studyLevel && <span style={{ fontWeight: 'normal', fontStyle: 'italic', opacity: 0.6 }}>(select level first)</span>}</label>
                                <select value={course} onChange={e => setCourse(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: studyLevel ? 'var(--bg)' : 'var(--surface-2)', color: 'var(--text-primary)', fontWeight: '600', outline: 'none', opacity: studyLevel ? 1 : 0.55 }} disabled={!studyLevel} required>
                                    <option value="" disabled>— Select Course —</option>
                                    {availableCourses.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Select Category</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-muted)', fontWeight: '600', outline: 'none' }} required>
                                <option value="" disabled>— Select Category —</option>
                                <option value="Academic">Academic</option>
                                <option value="Infrastructure">Infrastructure</option>
                                <option value="Transport">Transport</option>
                                <option value="Hostel">Hostel</option>
                                <option value="Discipline">Discipline</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical', minHeight: '80px' }} placeholder="Details of your complaint" required />
                        </div>

                        <div className="form-group" style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                Add Photos / Videos (Optional)
                            </label>
                            <div style={{ padding: '20px', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', textAlign: 'center', background: 'var(--bg)', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}>
                                <input
                                    type="file"
                                    id="file-upload"
                                    accept="image/*,video/*"
                                    onChange={(e) => setAttachment(e.target.files[0])}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', margin: 0 }}>
                                    <div style={{ height: '40px', width: '40px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                    </div>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '500' }}>{attachment ? attachment.name : "Click to upload an attachment"}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PNG, JPG or MP4 (max. 10MB)</span>
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)', fontWeight: '600' }} disabled={submitLoading}>
                                {submitLoading ? 'Submitting...' : 'Submit Complaint'}
                            </button>
                            <button type="button" onClick={handleClear} className="btn btn-secondary" style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)', fontWeight: '600', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer' }} disabled={submitLoading}>
                                Clear Form
                            </button>
                            <button type="button" onClick={() => setIsFormVisible(false)} className="btn btn-secondary" style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)', fontWeight: '600', background: 'transparent', border: '1px solid var(--border)', color: 'var(--danger-text)', borderColor: 'var(--danger-text)', cursor: 'pointer' }} disabled={submitLoading}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </DashboardLayout>
    );
};

export default StudentDashboard;
