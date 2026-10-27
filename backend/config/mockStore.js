const bcrypt = require('bcryptjs');

// Pre-computed bcrypt hash for 'admin' and 'admin123', 'student' and 'student123', 'password123'
// '$2a$10$eE0mEDD8d/y4jItJOS1i8e8s.zT8S2sZ/YFz8X5n/Z3h9Qc8o9q/S' -> 'admin123'
const defaultHashedPassword = bcrypt.hashSync('password123', 10);
const adminHashedPassword = bcrypt.hashSync('admin123', 10);
const studentHashedPassword = bcrypt.hashSync('student123', 10);

const mockUsers = [
    {
        id: 'admin',
        name: 'System Administrator',
        email: 'admin@university.edu',
        password: adminHashedPassword,
        role: 'admin',
        course: null,
        contact: '+91 98765 43210',
        dept: 'Central Administration',
        status: 'active',
        created_at: new Date('2026-01-01T00:00:00Z').toISOString()
    },
    {
        id: 'student',
        name: 'Demo Student',
        email: 'student@university.edu',
        password: studentHashedPassword,
        role: 'student',
        course: 'MCA',
        contact: '+91 91234 56789',
        dept: 'School of Computer Science',
        status: 'active',
        created_at: new Date('2026-01-15T00:00:00Z').toISOString()
    },
    {
        id: 'dept_academic',
        name: 'Academic Affairs Admin',
        email: 'academic@university.edu',
        password: defaultHashedPassword,
        role: 'staff',
        course: null,
        contact: '+91 98765 00001',
        dept: 'Academic',
        status: 'active',
        created_at: new Date('2026-02-01T00:00:00Z').toISOString()
    },
    {
        id: 'dept_infra',
        name: 'Infrastructure Officer',
        email: 'infra@university.edu',
        password: defaultHashedPassword,
        role: 'staff',
        course: null,
        contact: '+91 98765 00002',
        dept: 'Infrastructure',
        status: 'active',
        created_at: new Date('2026-02-01T00:00:00Z').toISOString()
    },
    {
        id: 'dept_transport',
        name: 'Transport Coordinator',
        email: 'transport@university.edu',
        password: defaultHashedPassword,
        role: 'staff',
        course: null,
        contact: '+91 98765 00003',
        dept: 'Transport',
        status: 'active',
        created_at: new Date('2026-02-01T00:00:00Z').toISOString()
    },
    {
        id: 'dept_hostel',
        name: 'Hostel Chief Warden',
        email: 'hostel@university.edu',
        password: defaultHashedPassword,
        role: 'staff',
        course: null,
        contact: '+91 98765 00004',
        dept: 'Hostel',
        status: 'active',
        created_at: new Date('2026-02-01T00:00:00Z').toISOString()
    },
    {
        id: 'dept_discipline',
        name: 'Discipline Committee Chair',
        email: 'discipline@university.edu',
        password: defaultHashedPassword,
        role: 'staff',
        course: null,
        contact: '+91 98765 00005',
        dept: 'Discipline',
        status: 'active',
        created_at: new Date('2026-02-01T00:00:00Z').toISOString()
    }
];

const mockComplaints = [
    {
        id: 'CMP10001',
        studentId: 'student',
        type: 'Academic',
        subject: 'Academic - Course Schedule Conflict',
        description: 'Faculty: FS, School: SCS, Course: MCA. Timetable overlap between Advanced Algorithms and Cloud Computing.',
        course: 'MCA',
        school: 'School of Computer Science',
        status: 'In Progress',
        referral: 'Academic Department',
        remarks: 'Examining revised slot for MCA Semester 2.',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        attachment_url: null
    },
    {
        id: 'CMP10002',
        studentId: 'student',
        type: 'Hostel',
        subject: 'Hostel - Water supply in Block B',
        description: 'Intermittent water pressure on the 3rd floor of Hostel Block B.',
        course: 'MCA',
        school: 'School of Computer Science',
        status: 'Resolved',
        referral: 'Maintenance Team',
        remarks: 'Pump repaired and pressure restored.',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        attachment_url: null
    },
    {
        id: 'CMP10003',
        studentId: 'student',
        type: 'Transport',
        subject: 'Transport - Route 4 Bus Delay',
        description: 'Route 4 bus consistently arriving 20 minutes late at City Junction.',
        course: 'MCA',
        school: 'School of Computer Science',
        status: 'New',
        referral: '',
        remarks: '',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        attachment_url: null
    },
    {
        id: 'CMP10004',
        studentId: 'student',
        type: 'Infrastructure',
        subject: 'Infrastructure - Lab AC Unit Down',
        description: 'Lab 3 air conditioning unit is not cooling properly.',
        course: 'MCA',
        school: 'School of Computer Science',
        status: 'Reopened',
        referral: 'HVAC Contractor',
        remarks: 'Compressor issue reoccurred; vendor recalled.',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        attachment_url: null
    }
];

const mockNotifications = [
    {
        id: 'notif-1',
        userId: 'student',
        role: null,
        title: 'Complaint Update',
        message: 'Your complaint CMP10001 status changed to In Progress.',
        icon: 'fa-circle-dot',
        read: false,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'notif-2',
        userId: 'student',
        role: null,
        title: 'Complaint Resolved',
        message: 'Your complaint CMP10002 has been marked as Resolved.',
        icon: 'fa-check',
        read: true,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'notif-3',
        userId: null,
        role: 'admin',
        title: 'New Complaint Filed',
        message: 'Student submitted complaint CMP10003 (Transport).',
        icon: 'fa-inbox',
        read: false,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
];

module.exports = {
    mockUsers,
    mockComplaints,
    mockNotifications
};
