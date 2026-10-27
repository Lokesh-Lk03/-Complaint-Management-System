import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Users, GraduationCap, Plus, Search, Shield, Ban, CheckCircle, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { DEPARTMENTS, STUDY_LEVELS, getCourses } from '../config/academicData';

const AdminUserManagement = () => {
    const { token, user: activeAdmin } = useContext(AuthContext);
    const [staffLoading, setStaffLoading] = useState(false);
    const [studentLoading, setStudentLoading] = useState(false);
    const [usersLoading, setUsersLoading] = useState(false);

    // Users list state
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [tableMessage, setTableMessage] = useState({ text: '', type: '' });

    // Staff Form State
    const [staffForm, setStaffForm] = useState({
        fullName: '',
        email: '',
        username: '',
        password: '',
        role: '',
        dept: '',
        contactNumber: ''
    });

    // Student Form State — includes dept + studyLevel for cascade
    const [studentForm, setStudentForm] = useState({
        studentId: '',
        fullName: '',
        email: '',
        studentDept: '',
        studyLevel: '',
        course: '',
        defaultPassword: '',
        contactNumber: ''
    });

    const [staffError, setStaffError] = useState('');
    const [staffSuccess, setStaffSuccess] = useState('');
    const [studentError, setStudentError] = useState('');
    const [studentSuccess, setStudentSuccess] = useState('');

    const authToken = token || localStorage.getItem('erp_token');

    const fetchUsers = useCallback(async () => {
        try {
            setUsersLoading(true);
            const res = await fetch(`${API_BASE_URL}/users`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setUsers(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setUsersLoading(false);
        }
    }, [authToken]);

    useEffect(() => {
        if (authToken) {
            fetchUsers();
        }
    }, [authToken, fetchUsers]);

    const handleStaffChange = (e) => setStaffForm({ ...staffForm, [e.target.name]: e.target.value });
    const handleStudentChange = (e) => setStudentForm({ ...studentForm, [e.target.name]: e.target.value });

    const handleStaffSubmit = async (e) => {
        e.preventDefault();
        setStaffLoading(true);
        setStaffError('');
        setStaffSuccess('');

        try {
            const res = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    id: staffForm.username,
                    name: staffForm.fullName,
                    email: staffForm.email,
                    password: staffForm.password,
                    role: staffForm.role.toLowerCase(),
                    dept: staffForm.dept || staffForm.role,
                    contact: staffForm.contactNumber
                })
            });

            const data = await res.json();

            if (data.success) {
                setStaffSuccess(`Account ${data.data.id} created successfully!`);
                setStaffForm({ fullName: '', email: '', username: '', password: '', role: '', dept: '', contactNumber: '' });
                fetchUsers();
                setTimeout(() => setStaffSuccess(''), 4000);
            } else {
                setStaffError(data.message || 'Failed to create staff account');
            }
        } catch {
            setStaffError('Server error communicating with API');
        } finally {
            setStaffLoading(false);
        }
    };

    const handleStudentSubmit = async (e) => {
        e.preventDefault();
        setStudentLoading(true);
        setStudentError('');
        setStudentSuccess('');

        try {
            const res = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    id: studentForm.studentId,
                    name: studentForm.fullName,
                    email: studentForm.email,
                    password: studentForm.defaultPassword,
                    role: 'student',
                    course: studentForm.course,
                    contact: studentForm.contactNumber
                })
            });

            const data = await res.json();

            if (data.success) {
                setStudentSuccess(`Student ${data.data.id} registered!`);
                setStudentForm({ studentId: '', fullName: '', email: '', studentDept: '', studyLevel: '', course: '', defaultPassword: '', contactNumber: '' });
                fetchUsers();
                setTimeout(() => setStudentSuccess(''), 4000);
            } else {
                setStudentError(data.message || 'Failed to create student account');
            }
        } catch {
            setStudentError('Server error communicating with API');
        } finally {
            setStudentLoading(false);
        }
    };

    const handleToggleStatus = async (targetId) => {
        if (targetId === 'admin') {
            setTableMessage({ text: 'The primary admin account cannot be deactivated.', type: 'error' });
            setTimeout(() => setTableMessage({ text: '', type: '' }), 4000);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/users/${targetId}/status`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await res.json();
            if (data.success) {
                setUsers(prev => prev.map(u => u.id === targetId ? { ...u, status: data.data.status } : u));
                setTableMessage({ text: `User ${targetId} is now ${data.data.status}.`, type: 'success' });
            } else {
                setTableMessage({ text: data.message || 'Action failed', type: 'error' });
            }
        } catch {
            setTableMessage({ text: 'Error contacting server', type: 'error' });
        } finally {
            setTimeout(() => setTableMessage({ text: '', type: '' }), 4000);
        }
    };

    const handleDeleteUser = async (targetId) => {
        if (targetId === 'admin' || targetId === activeAdmin?.id) {
            setTableMessage({ text: 'Cannot delete active administrator account.', type: 'error' });
            setTimeout(() => setTableMessage({ text: '', type: '' }), 4000);
            return;
        }

        if (!window.confirm(`Are you sure you want to permanently delete user "${targetId}"?`)) {
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/users/${targetId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await res.json();
            if (data.success) {
                setUsers(prev => prev.filter(u => u.id !== targetId));
                setTableMessage({ text: `User ${targetId} was deleted successfully.`, type: 'success' });
            } else {
                setTableMessage({ text: data.message || 'Delete failed', type: 'error' });
            }
        } catch {
            setTableMessage({ text: 'Error contacting server', type: 'error' });
        } finally {
            setTimeout(() => setTableMessage({ text: '', type: '' }), 4000);
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesRole = roleFilter === 'All' || u.role.toLowerCase() === roleFilter.toLowerCase();
        const q = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery ||
            String(u.id || '').toLowerCase().includes(q) ||
            String(u.name || '').toLowerCase().includes(q) ||
            String(u.email || '').toLowerCase().includes(q) ||
            String(u.course || '').toLowerCase().includes(q) ||
            String(u.dept || '').toLowerCase().includes(q);
        return matchesRole && matchesSearch;
    });

    return (
        <DashboardLayout>
            <div className="section-header" style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-primary)' }}>User Management</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.85rem' }}>Admin / Users</p>
            </div>

            {/* Creation Forms Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start', marginBottom: '32px' }}>

                {/* Staff Account Form */}
                <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={20} style={{ color: '#d97706' }} />
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>Add Staff Account</h2>
                    </div>
                    {staffError && <div style={{ margin: '16px 24px 0', padding: '12px', background: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>{staffError}</div>}
                    {staffSuccess && <div style={{ margin: '16px 24px 0', padding: '12px', background: 'var(--success-bg)', color: 'var(--success-text)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>{staffSuccess}</div>}

                    <form onSubmit={handleStaffSubmit} style={{ padding: '24px' }}>
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Full Name</label>
                            <input type="text" name="fullName" value={staffForm.fullName} onChange={handleStaffChange} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' }} placeholder="Full name" required />
                        </div>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Email Address</label>
                            <input type="email" name="email" value={staffForm.email} onChange={handleStaffChange} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' }} placeholder="staff@university.edu" required />
                        </div>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Username / ID</label>
                            <input type="text" name="username" value={staffForm.username} onChange={handleStaffChange} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' }} placeholder="Username" required />
                        </div>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Password</label>
                            <input type="password" name="password" value={staffForm.password} onChange={handleStaffChange} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' }} placeholder="Password" required />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Role</label>
                                <select name="role" value={staffForm.role} onChange={handleStaffChange} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', appearance: 'auto' }} required>
                                    <option value="" disabled>Select Role</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Staff">Staff</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Department</label>
                                <select name="dept" value={staffForm.dept} onChange={handleStaffChange} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', appearance: 'auto' }}>
                                    <option value="">General</option>
                                    <option value="Academic">Academic</option>
                                    <option value="Infrastructure">Infrastructure</option>
                                    <option value="Transport">Transport</option>
                                    <option value="Hostel">Hostel</option>
                                    <option value="Discipline">Discipline</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Contact Number</label>
                            <input type="tel" name="contactNumber" value={staffForm.contactNumber} onChange={handleStaffChange} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' }} placeholder="+91 00000 00000" />
                        </div>

                        <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', fontWeight: '600', backgroundColor: '#d97706', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={staffLoading}>
                            <Plus size={18} />
                            {staffLoading ? 'Creating...' : 'Create Staff Account'}
                        </button>
                    </form>
                </div>

                {/* Student Account Form */}
                <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <GraduationCap size={20} style={{ color: 'var(--primary)' }} />
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>Add Student Account</h2>
                    </div>
                    {studentError && <div style={{ margin: '16px 24px 0', padding: '12px', background: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>{studentError}</div>}
                    {studentSuccess && <div style={{ margin: '16px 24px 0', padding: '12px', background: 'var(--success-bg)', color: 'var(--success-text)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>{studentSuccess}</div>}

                    <form onSubmit={handleStudentSubmit} style={{ padding: '24px' }}>
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Student ID</label>
                            <input type="text" name="studentId" value={studentForm.studentId} onChange={handleStudentChange} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' }} placeholder="e.g. STU2024001" required />
                        </div>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Full Name</label>
                            <input type="text" name="fullName" value={studentForm.fullName} onChange={handleStudentChange} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' }} placeholder="Full name" required />
                        </div>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Email Address</label>
                            <input type="email" name="email" value={studentForm.email} onChange={handleStudentChange} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' }} placeholder="student@university.edu" required />
                        </div>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Department</label>
                            <select name="studentDept" value={studentForm.studentDept} onChange={(e) => setStudentForm({ ...studentForm, studentDept: e.target.value, studyLevel: '', course: '' })} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', appearance: 'auto' }} required>
                                <option value="" disabled>— Select Department —</option>
                                {DEPARTMENTS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Study Level</label>
                            <select name="studyLevel" value={studentForm.studyLevel} onChange={(e) => setStudentForm({ ...studentForm, studyLevel: e.target.value, course: '' })} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: studentForm.studentDept ? 'var(--bg)' : 'var(--surface-2)', color: 'var(--text-primary)', outline: 'none', appearance: 'auto', opacity: studentForm.studentDept ? 1 : 0.55 }} disabled={!studentForm.studentDept} required>
                                <option value="" disabled>— UG / PG —</option>
                                {(() => { const d = DEPARTMENTS.find(x => x.name === studentForm.studentDept); return d ? STUDY_LEVELS.filter(l => d[l] && d[l].length > 0) : STUDY_LEVELS; })().map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Course</label>
                            <select name="course" value={studentForm.course} onChange={handleStudentChange} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: studentForm.studyLevel ? 'var(--bg)' : 'var(--surface-2)', color: 'var(--text-primary)', outline: 'none', appearance: 'auto', opacity: studentForm.studyLevel ? 1 : 0.55 }} disabled={!studentForm.studyLevel} required>
                                <option value="" disabled>— Select Course —</option>
                                {getCourses(studentForm.studentDept, studentForm.studyLevel).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Default Password</label>
                            <input type="password" name="defaultPassword" value={studentForm.defaultPassword} onChange={handleStudentChange} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' }} placeholder="Default password" required />
                        </div>

                        <div className="form-group" style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Contact Number</label>
                            <input type="tel" name="contactNumber" value={studentForm.contactNumber} onChange={handleStudentChange} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none' }} placeholder="+91 00000 00000" />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={studentLoading}>
                            <Plus size={18} />
                            {studentLoading ? 'Creating...' : 'Create Student Account'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Registered Users Table */}
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shield size={20} style={{ color: 'var(--primary)' }} />
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Registered Users Directory</h2>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                <Search size={16} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name, ID, email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ padding: '8px 16px 8px 36px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem', minWidth: '220px' }}
                            />
                        </div>

                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem', appearance: 'auto' }}
                        >
                            <option value="All">All Roles</option>
                            <option value="student">Students</option>
                            <option value="staff">Staff</option>
                            <option value="faculty">Faculty</option>
                            <option value="admin">Admins</option>
                        </select>
                    </div>
                </div>

                {tableMessage.text && (
                    <div style={{
                        padding: '12px 24px',
                        background: tableMessage.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
                        color: tableMessage.type === 'success' ? 'var(--success-text)' : 'var(--danger-text)',
                        fontSize: '0.85rem',
                        fontWeight: '500'
                    }}>
                        {tableMessage.text}
                    </div>
                )}

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>User ID</th>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Name</th>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Email</th>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Role</th>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Dept / Course</th>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersLoading ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading users...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No users found matching current filters.</td>
                                </tr>
                            ) : (
                                filteredUsers.map(u => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '14px 20px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>{u.id}</td>
                                        <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{u.name}</td>
                                        <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                                        <td style={{ padding: '14px 20px', fontSize: '0.85rem' }}>
                                            <span style={{
                                                padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600',
                                                background: u.role === 'admin' ? 'rgba(59, 130, 246, 0.15)' : u.role === 'student' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                                color: u.role === 'admin' ? 'var(--primary)' : u.role === 'student' ? 'var(--success)' : '#d97706'
                                            }}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {u.course || u.dept || '—'}
                                        </td>
                                        <td style={{ padding: '14px 20px' }}>
                                            <span style={{
                                                padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600',
                                                background: u.status === 'blocked' ? 'var(--danger-bg)' : 'var(--success-bg)',
                                                color: u.status === 'blocked' ? 'var(--danger-text)' : 'var(--success-text)'
                                            }}>
                                                {u.status === 'blocked' ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 20px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {u.id !== 'admin' && (
                                                    <button
                                                        onClick={() => handleToggleStatus(u.id)}
                                                        title={u.status === 'blocked' ? 'Activate Account' : 'Block Account'}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: '4px',
                                                            padding: '6px 10px', borderRadius: '6px',
                                                            border: '1px solid var(--border)',
                                                            background: u.status === 'blocked' ? 'var(--success-bg)' : 'var(--surface-2)',
                                                            color: u.status === 'blocked' ? 'var(--success-text)' : 'var(--text-primary)',
                                                            fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer'
                                                        }}
                                                    >
                                                        {u.status === 'blocked' ? <CheckCircle size={14} /> : <Ban size={14} />}
                                                        {u.status === 'blocked' ? 'Activate' : 'Block'}
                                                    </button>
                                                )}

                                                {u.id !== 'admin' && u.id !== activeAdmin?.id && (
                                                    <button
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        title="Delete User"
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: '4px',
                                                            padding: '6px 8px', borderRadius: '6px',
                                                            border: '1px solid var(--border)',
                                                            background: 'transparent',
                                                            color: 'var(--danger-text, #ef4444)',
                                                            fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer'
                                                        }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminUserManagement;
