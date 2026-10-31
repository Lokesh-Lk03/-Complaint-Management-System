// Deep Comprehensive Diagnostic Suite for Takshashila University Grievance Redressal System
process.env.SUPABASE_URL = '';
process.env.SUPABASE_ANON_KEY = '';

const assert = require('assert');
const path = require('path');
const authController = require('./controllers/auth.controller');
const complaintsController = require('./controllers/complaints.controller');
const usersController = require('./controllers/users.controller');
const notificationsController = require('./controllers/notifications.controller');
const { mockUsers, mockComplaints, mockNotifications } = require('./config/mockStore');

function createMockRes() {
    return {
        statusCode: 200,
        data: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.data = payload;
            return this;
        }
    };
}

async function runDiagnostics() {
    console.log('====================================================');
    console.log('🔬 DEEP INCH-BY-INCH DIAGNOSTIC AND AUDIT HARNESS');
    console.log('====================================================\n');

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    const testResults = [];

    async function check(category, description, fn) {
        totalTests++;
        try {
            await fn();
            passedTests++;
            console.log(`  ✅ [${category}] ${description}`);
            testResults.push({ category, description, status: 'PASS' });
        } catch (err) {
            failedTests++;
            console.error(`  ❌ [${category}] ${description}`);
            console.error(`     Error: ${err.message}`);
            testResults.push({ category, description, status: 'FAIL', error: err.message });
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 1. AUTHENTICATION & STUDENT SIGNUP DIAGNOSTICS
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- 1. AUTHENTICATION & REGISTRATION ---');

    const testStudentId = 'TU_' + Date.now();
    const testStudentEmail = `test_${Date.now()}@takshashila.edu`;

    await check('Auth', 'Student self-registration creates valid account with course & dept', async () => {
        const req = {
            body: {
                id: testStudentId,
                name: 'Diagnostic Test Student',
                email: testStudentEmail,
                password: 'password123',
                dept: 'Computational Engineering',
                study_level: 'UG',
                course: 'B.Tech Artificial Intelligence and Data Science'
            }
        };
        const res = createMockRes();
        await authController.register(req, res);
        assert.strictEqual(res.statusCode, 201);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.user.role, 'student');
        assert.strictEqual(res.data.user.id, testStudentId);
        assert.ok(res.data.token, 'Token must be issued');
    });

    await check('Auth', 'Student registration rejects duplicate student ID', async () => {
        const req = {
            body: {
                id: testStudentId,
                name: 'Duplicate Student',
                email: 'another@takshashila.edu',
                password: 'password123'
            }
        };
        const res = createMockRes();
        await authController.register(req, res);
        assert.strictEqual(res.statusCode, 400);
        assert.strictEqual(res.data.success, false);
    });

    await check('Auth', 'Student registration rejects duplicate email', async () => {
        const req = {
            body: {
                id: 'DIFFERENT_ID_' + Date.now(),
                name: 'Another Student',
                email: testStudentEmail,
                password: 'password123'
            }
        };
        const res = createMockRes();
        await authController.register(req, res);
        assert.strictEqual(res.statusCode, 400);
        assert.strictEqual(res.data.success, false);
    });

    await check('Auth', 'Newly registered student can authenticate with login()', async () => {
        const req = {
            body: {
                id: testStudentId,
                password: 'password123'
            }
        };
        const res = createMockRes();
        await authController.login(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.user.id, testStudentId);
    });

    await check('Auth', 'Login fails with incorrect password', async () => {
        const req = {
            body: {
                id: testStudentId,
                password: 'wrong_password_999'
            }
        };
        const res = createMockRes();
        await authController.login(req, res);
        assert.strictEqual(res.statusCode, 401);
        assert.strictEqual(res.data.success, false);
    });

    await check('Auth', 'Super admin login works with seeded admin credentials', async () => {
        const req = { body: { id: 'admin', password: 'admin' } };
        const res = createMockRes();
        await authController.login(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.data.user.role, 'admin');
    });

    await check('Auth', 'Department Admin (Hostel) login returns staff role and Hostel dept claim', async () => {
        const req = { body: { id: 'dept_hostel', password: 'password123' } };
        const res = createMockRes();
        await authController.login(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.data.user.role, 'staff');
        assert.strictEqual(res.data.user.dept, 'Hostel');
    });

    await check('Auth', 'Password Reset: Valid user ID reset succeeds with new password', async () => {
        const req = {
            body: {
                userId: testStudentId,
                newPassword: 'newsecurepassword123'
            }
        };
        const res = createMockRes();
        await authController.resetPassword(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.data.success, true);
    });

    await check('Auth', 'Password Reset: Primary admin account is protected against public reset', async () => {
        const req = {
            body: {
                userId: 'admin',
                newPassword: 'hackadmin123'
            }
        };
        const res = createMockRes();
        await authController.resetPassword(req, res);
        assert.strictEqual(res.statusCode, 403);
        assert.strictEqual(res.data.success, false);
    });

    await check('Auth', 'Password Reset: Rejects passwords shorter than 6 characters', async () => {
        const req = {
            body: {
                userId: testStudentId,
                newPassword: '123'
            }
        };
        const res = createMockRes();
        await authController.resetPassword(req, res);
        assert.strictEqual(res.statusCode, 400);
    });

    // ─────────────────────────────────────────────────────────────
    // 2. COMPLAINT SUBMISSION & LIFECYCLE DIAGNOSTICS
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- 2. COMPLAINT LIFECYCLE & 2-TIER REOPEN ---');

    let complaintId = '';

    await check('Complaints', 'Student submits complaint with academic course & attachment', async () => {
        const req = {
            user: { id: testStudentId, role: 'student', dept: '' },
            body: {
                title: 'Hostel Water Heater Malfunction',
                description: 'Geyser in Room 204 Block B trips circuit breaker intermittently.',
                category: 'Hostel',
                type: 'Hostel',
                dept: 'Hostel',
                priority: 'High',
                course: 'B.Tech AI and Data Science'
            },
            file: {
                originalname: 'fuse_damage.jpg',
                mimetype: 'image/jpeg',
                buffer: Buffer.from('fake_image_bytes')
            }
        };
        const res = createMockRes();
        await complaintsController.createComplaint(req, res);
        assert.strictEqual(res.statusCode, 201);
        assert.strictEqual(res.data.success, true);
        assert.ok(res.data.data.id, 'Complaint must have ID');
        complaintId = res.data.data.id;
    });

    await check('Complaints', 'Student only sees their own complaints in GET list', async () => {
        const req = { user: { id: testStudentId, role: 'student' }, query: {} };
        const res = createMockRes();
        await complaintsController.getComplaints(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.ok(res.data.data.every(c => c.studentId === testStudentId));
    });

    await check('Complaints', 'Hostel Admin sees Hostel complaints but Academic Admin does NOT see it', async () => {
        // Hostel admin check
        const hostelReq = { user: { id: 'dept_hostel', role: 'staff', dept: 'Hostel' }, query: {} };
        const hostelRes = createMockRes();
        await complaintsController.getComplaints(hostelReq, hostelRes);
        assert.strictEqual(hostelRes.statusCode, 200);
        const hasComplaint = hostelRes.data.data.some(c => c.id === complaintId);
        assert.strictEqual(hasComplaint, true, 'Hostel admin should see complaint');

        // Academic admin check
        const acadReq = { user: { id: 'dept_academic', role: 'staff', dept: 'Academic' }, query: {} };
        const acadRes = createMockRes();
        await complaintsController.getComplaints(acadReq, acadRes);
        const acadHasIt = acadRes.data.data.some(c => c.id === complaintId);
        assert.strictEqual(acadHasIt, false, 'Academic admin must NOT see hostel complaint');
    });

    await check('Complaints', 'Super Admin has global visibility across all departments', async () => {
        const req = { user: { id: 'admin', role: 'admin' }, query: {} };
        const res = createMockRes();
        await complaintsController.getComplaints(req, res);
        assert.strictEqual(res.statusCode, 200);
        const hasIt = res.data.data.some(c => c.id === complaintId);
        assert.strictEqual(hasIt, true, 'Super Admin must see all tickets');
    });

    await check('Complaints', 'Academic Admin is blocked (403) from updating Hostel complaint', async () => {
        const req = {
            user: { id: 'dept_academic', role: 'staff', dept: 'Academic' },
            params: { id: complaintId },
            body: { status: 'In Progress', remarks: 'Unauthorized update' }
        };
        const res = createMockRes();
        await complaintsController.updateComplaint(req, res);
        assert.strictEqual(res.statusCode, 403);
        assert.strictEqual(res.data.success, false);
    });

    await check('Complaints', 'Hostel Admin successfully updates complaint to In Progress & Resolved', async () => {
        // 1. Move to In Progress
        const req1 = {
            user: { id: 'dept_hostel', role: 'staff', dept: 'Hostel' },
            params: { id: complaintId },
            body: { status: 'In Progress', remarks: 'Technician assigned.' }
        };
        const res1 = createMockRes();
        await complaintsController.updateComplaint(req1, res1);
        assert.strictEqual(res1.statusCode, 200);
        assert.strictEqual(res1.data.data.status, 'In Progress');

        // 2. Move to Resolved
        const req2 = {
            user: { id: 'dept_hostel', role: 'staff', dept: 'Hostel' },
            params: { id: complaintId },
            body: { status: 'Resolved', remarks: 'Heating element replaced and breaker tested.' }
        };
        const res2 = createMockRes();
        await complaintsController.updateComplaint(req2, res2);
        assert.strictEqual(res2.statusCode, 200);
        assert.strictEqual(res2.data.data.status, 'Resolved');
    });

    await check('Complaints', 'Student cannot set status to Resolved directly (403)', async () => {
        const req = {
            user: { id: testStudentId, role: 'student' },
            params: { id: complaintId },
            body: { status: 'Resolved' }
        };
        const res = createMockRes();
        await complaintsController.updateComplaint(req, res);
        assert.strictEqual(res.statusCode, 403);
    });

    await check('Complaints', 'Student reopen request sets status to "Reopen Requested" (2-Tier Approval)', async () => {
        const req = {
            user: { id: testStudentId, role: 'student' },
            params: { id: complaintId },
            body: { status: 'Reopened', remarks: 'Water is still cold in the morning.' }
        };
        const res = createMockRes();
        await complaintsController.updateComplaint(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.data.data.status, 'Reopen Requested');
    });

    await check('Complaints', 'Admin reviews and approves Reopen Request → transitions to "Reopened"', async () => {
        const req = {
            user: { id: 'dept_hostel', role: 'staff', dept: 'Hostel' },
            params: { id: complaintId },
            body: { status: 'Reopened', remarks: 'Approved reopen request. Electrician reinspecting.' }
        };
        const res = createMockRes();
        await complaintsController.updateComplaint(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.data.data.status, 'Reopened');
    });

    // ─────────────────────────────────────────────────────────────
    // 3. USER MANAGEMENT & INVARIANTS DIAGNOSTICS
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- 3. USER MANAGEMENT & ADMIN INVARIANTS ---');

    const newStaffId = 'STAFF_DIAG_' + Date.now();

    await check('Users', 'Super Admin creates new Department Staff account', async () => {
        const req = {
            body: {
                id: newStaffId,
                name: 'Diagnostic Officer',
                email: `${newStaffId.toLowerCase()}@takshashila.edu`,
                role: 'staff',
                dept: 'Core Engineering',
                contact: '+91 99999 11111'
            }
        };
        const res = createMockRes();
        await usersController.createUser(req, res);
        assert.strictEqual(res.statusCode, 201);
        assert.strictEqual(res.data.data.id, newStaffId);
    });

    await check('Users', 'Admin filters users by role="student"', async () => {
        const req = { query: { role: 'student' } };
        const res = createMockRes();
        await usersController.getUsers(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.ok(res.data.data.every(u => u.role === 'student'));
    });

    await check('Users', 'Admin toggles user status from active to blocked and back', async () => {
        // Block
        const req1 = { params: { id: newStaffId }, body: { status: 'blocked' } };
        const res1 = createMockRes();
        await usersController.toggleUserStatus(req1, res1);
        assert.strictEqual(res1.statusCode, 200);
        assert.strictEqual(res1.data.data.status, 'blocked');

        // Unblock
        const req2 = { params: { id: newStaffId }, body: { status: 'active' } };
        const res2 = createMockRes();
        await usersController.toggleUserStatus(req2, res2);
        assert.strictEqual(res2.statusCode, 200);
        assert.strictEqual(res2.data.data.status, 'active');
    });

    await check('Users', 'Root Admin safety invariant: Prevent blocking primary admin account (400)', async () => {
        const req = { params: { id: 'admin' }, body: { status: 'blocked' } };
        const res = createMockRes();
        await usersController.toggleUserStatus(req, res);
        assert.strictEqual(res.statusCode, 400);
    });

    await check('Users', 'Root Admin safety invariant: Prevent deleting primary admin account (400)', async () => {
        const req = { params: { id: 'admin' } };
        const res = createMockRes();
        await usersController.deleteUser(req, res);
        assert.strictEqual(res.statusCode, 400);
    });

    await check('Users', 'Admin deletes created test staff user', async () => {
        const req = { params: { id: newStaffId } };
        const res = createMockRes();
        await usersController.deleteUser(req, res);
        assert.strictEqual(res.statusCode, 200);
    });

    // ─────────────────────────────────────────────────────────────
    // 4. NOTIFICATIONS SYSTEM DIAGNOSTICS
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- 4. NOTIFICATIONS & ROLE ROUTING ---');

    let notifId = '';

    await check('Notifications', 'Student receives notifications for complaint status changes', async () => {
        const req = { user: { id: testStudentId, role: 'student' } };
        const res = createMockRes();
        await notificationsController.getNotifications(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.ok(Array.isArray(res.data.data));
        assert.ok(res.data.data.length > 0, 'Student should have notifications');
        notifId = res.data.data[0].id;
    });

    await check('Notifications', 'Student can mark an individual notification as read', async () => {
        const req = { params: { id: notifId } };
        const res = createMockRes();
        await notificationsController.markRead(req, res);
        assert.strictEqual(res.statusCode, 200);
    });

    await check('Notifications', 'Student can mark all notifications as read', async () => {
        const req = { user: { id: testStudentId, role: 'student' } };
        const res = createMockRes();
        await notificationsController.markAllRead(req, res);
        assert.strictEqual(res.statusCode, 200);
    });

    // ─────────────────────────────────────────────────────────────
    // 5. ACADEMIC DATA CASCADE DIAGNOSTICS
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- 5. ACADEMIC DATA CASCADE VERIFICATION ---');

    await check('AcademicData', 'All 13 canonical departments exist with valid UG/PG structures', async () => {
        const academicData = require('../frontend/src/config/academicData');
        assert.strictEqual(academicData.DEPARTMENTS.length, 13, 'Must have exactly 13 departments');
        assert.deepStrictEqual(academicData.STUDY_LEVELS, ['UG', 'PG']);

        for (const dept of academicData.DEPARTMENTS) {
            assert.ok(dept.name, 'Department must have a name');
            assert.ok(Array.isArray(dept.UG), `${dept.name} must have UG array`);
            assert.ok(Array.isArray(dept.PG), `${dept.name} must have PG array`);
        }

        // Test dynamic courses retrieval
        const compUg = academicData.getCourses('Computational Engineering', 'UG');
        assert.ok(compUg.length >= 5, 'Computational Engineering UG courses must be populated');
        assert.ok(compUg.includes('B.Tech Computer Science and Engineering'));

        const pharmacyPg = academicData.getCourses('Pharmacy', 'PG');
        assert.strictEqual(pharmacyPg.length, 0, 'Pharmacy has no PG degrees');
    });

    // ─────────────────────────────────────────────────────────────
    // SUMMARY
    // ─────────────────────────────────────────────────────────────
    console.log('\n====================================================');
    console.log(`🏁 DIAGNOSTIC COMPLETE: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
    console.log('====================================================\n');

    if (failedTests > 0) {
        process.exit(1);
    }
}

runDiagnostics().catch(err => {
    console.error('Fatal diagnostic crash:', err);
    process.exit(1);
});
