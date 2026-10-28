// Ensure offline test suite runs deterministically against local store
process.env.SUPABASE_URL = '';
process.env.SUPABASE_ANON_KEY = '';

const assert = require('assert');
const authController = require('./controllers/auth.controller');
const complaintsController = require('./controllers/complaints.controller');
const usersController = require('./controllers/users.controller');
const notificationsController = require('./controllers/notifications.controller');
const { mockUsers, mockComplaints, mockNotifications } = require('./config/mockStore');

// Helper to simulate Express req, res
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

async function runTestSuite() {
    console.log('🧪 Starting Direct Controller Verification Suite...\n');
    let passed = 0;
    let failed = 0;

    async function test(name, fn) {
        try {
            await fn();
            console.log(`  ✅ PASS: ${name}`);
            passed++;
        } catch (err) {
            console.error(`  ❌ FAIL: ${name}`);
            console.error('    ', err.message);
            failed++;
        }
    }

    let studentToken = '';
    let adminToken = '';
    let hostelAdminToken = '';
    let createdComplaintId = '';

    // --- AUTH CONTROLLER TESTS ---
    await test('Auth: Admin login succeeds with admin/admin', async () => {
        const req = { body: { id: 'admin', password: 'admin' } };
        const res = createMockRes();
        await authController.login(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.user.role, 'admin');
        assert.ok(res.data.token);
        adminToken = res.data.token;
    });

    await test('Auth: Admin login succeeds with admin/admin123', async () => {
        const req = { body: { id: 'admin', password: 'admin123' } };
        const res = createMockRes();
        await authController.login(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.user.role, 'admin');
    });

    await test('Auth: Student login succeeds with student/student', async () => {
        const req = { body: { id: 'student', password: 'student' } };
        const res = createMockRes();
        await authController.login(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.user.role, 'student');
        assert.ok(res.data.token);
        studentToken = res.data.token;
    });

    await test('Auth: Department Admin (Hostel) login returns staff role and Hostel dept', async () => {
        const req = { body: { id: 'dept_hostel', password: 'password123' } };
        const res = createMockRes();
        await authController.login(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.user.role, 'staff');
        assert.strictEqual(res.data.user.dept, 'Hostel');
        assert.ok(res.data.token);
        hostelAdminToken = res.data.token;
    });

    await test('Auth: Department Admin (Academic) login returns staff role and Academic dept', async () => {
        const req = { body: { id: 'dept_academic', password: 'password123' } };
        const res = createMockRes();
        await authController.login(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.user.role, 'staff');
        assert.strictEqual(res.data.user.dept, 'Academic');
    });

    await test('Auth: Incorrect password returns 401', async () => {
        const req = { body: { id: 'student', password: 'wrong_password' } };
        const res = createMockRes();
        await authController.login(req, res);
        assert.strictEqual(res.statusCode, 401);
        assert.strictEqual(res.data.success, false);
    });

    await test('Auth: Missing fields return 400', async () => {
        const req = { body: { id: 'student' } };
        const res = createMockRes();
        await authController.login(req, res);
        assert.strictEqual(res.statusCode, 400);
    });

    const testStudentId = 'STU_TEST_' + Date.now();
    await test('Auth: Student registration succeeds', async () => {
        const req = {
            body: {
                id: testStudentId,
                name: 'Test Student Runner',
                email: `${testStudentId.toLowerCase()}@test.edu`,
                password: 'password123',
                course: 'B.Tech Computer Science'
            }
        };
        const res = createMockRes();
        await authController.register(req, res);
        assert.strictEqual(res.statusCode, 201);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.user.id, testStudentId);
    });

    await test('Auth: Duplicate registration is rejected (400)', async () => {
        const req = {
            body: {
                id: testStudentId,
                name: 'Test Student Duplicate',
                email: `${testStudentId.toLowerCase()}@test.edu`,
                password: 'password123'
            }
        };
        const res = createMockRes();
        await authController.register(req, res);
        assert.strictEqual(res.statusCode, 400);
    });

    await test('Auth: Password change with valid current password succeeds', async () => {
        const req = {
            user: { id: testStudentId, role: 'student' },
            body: { currentPassword: 'password123', newPassword: 'newpassword456' }
        };
        const res = createMockRes();
        await authController.changePassword(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.data.success, true);
    });

    await test('Auth: Password change with wrong current password fails (400)', async () => {
        const req = {
            user: { id: testStudentId, role: 'student' },
            body: { currentPassword: 'wrong_password', newPassword: 'newpassword456' }
        };
        const res = createMockRes();
        await authController.changePassword(req, res);
        assert.strictEqual(res.statusCode, 400);
    });

    await test('Auth: Reset password succeeds for valid student', async () => {
        const req = { body: { userId: testStudentId, newPassword: 'resetpass99' } };
        const res = createMockRes();
        await authController.resetPassword(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.data.success, true);
    });

    await test('Auth: Reset password fails for unknown user ID', async () => {
        const req = { body: { userId: 'nonexistent_user_xyz', newPassword: 'resetpass99' } };
        const res = createMockRes();
        await authController.resetPassword(req, res);
        assert.strictEqual(res.statusCode, 404);
    });

    await test('Auth: Reset password blocked for primary admin', async () => {
        const req = { body: { userId: 'admin', newPassword: 'newadmin123' } };
        const res = createMockRes();
        await authController.resetPassword(req, res);
        assert.strictEqual(res.statusCode, 403);
    });

    await test('Auth: Reset password fails with short password', async () => {
        const req = { body: { userId: testStudentId, newPassword: '123' } };
        const res = createMockRes();
        await authController.resetPassword(req, res);
        assert.strictEqual(res.statusCode, 400);
    });

    // --- COMPLAINTS CONTROLLER TESTS ---
    await test('Complaints: Student submits new complaint with attachment', async () => {
        const req = {
            user: { id: 'student', role: 'student' },
            body: {
                type: 'Hostel',
                subject: 'Hot Water Issue',
                description: 'Hot water not working in bathroom 3.',
                course: 'MCA',
                school: 'School of Computer Science'
            },
            file: {
                originalname: 'photo.jpg',
                mimetype: 'image/jpeg',
                buffer: Buffer.from('mock-image-bytes')
            }
        };
        const res = createMockRes();
        await complaintsController.createComplaint(req, res);
        assert.strictEqual(res.statusCode, 201);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.data.type, 'Hostel');
        assert.strictEqual(res.data.data.status, 'New');
        assert.ok(res.data.data.attachment_url.startsWith('data:image/jpeg;base64,'));
        createdComplaintId = res.data.data.id;
    });

    await test('Complaints: Student views only their own complaints', async () => {
        const req = { user: { id: 'student', role: 'student', dept: '' } };
        const res = createMockRes();
        await complaintsController.getComplaints(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.data.success, true);
        const allMine = res.data.data.every(c => c.studentId === 'student');
        assert.ok(allMine, 'Student saw complaints belonging to someone else!');
    });

    await test('Complaints: Central Admin views all complaints across departments', async () => {
        const req = { user: { id: 'admin', role: 'admin', dept: 'Central Administration' } };
        const res = createMockRes();
        await complaintsController.getComplaints(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.data.success, true);
        assert.ok(res.data.data.length >= 2);
    });

    await test('Complaints: Hostel Admin is restricted to Hostel complaints', async () => {
        const req = { user: { id: 'dept_hostel', role: 'staff', dept: 'Hostel' } };
        const res = createMockRes();
        await complaintsController.getComplaints(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.data.success, true);
        const onlyHostel = res.data.data.every(c =>
            (c.type && c.type.toLowerCase() === 'hostel') ||
            (c.referral && c.referral.toLowerCase().includes('hostel'))
        );
        assert.ok(onlyHostel, 'Hostel Admin saw complaints outside Hostel department!');
    });

    await test('Complaints: Hostel Admin can update their department complaint', async () => {
        const req = {
            user: { id: 'dept_hostel', role: 'staff', dept: 'Hostel' },
            params: { id: createdComplaintId },
            body: { status: 'In Progress', remarks: 'Plumber dispatched.' }
        };
        const res = createMockRes();
        await complaintsController.updateComplaint(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.data.status, 'In Progress');
    });

    await test('Complaints: Academic Admin CANNOT update Hostel complaint (403 Forbidden)', async () => {
        const req = {
            user: { id: 'dept_academic', role: 'staff', dept: 'Academic' },
            params: { id: createdComplaintId },
            body: { status: 'Resolved' }
        };
        const res = createMockRes();
        await complaintsController.updateComplaint(req, res);
        assert.strictEqual(res.statusCode, 403);
        assert.strictEqual(res.data.success, false);
    });

    await test('Complaints: Status can be updated to Reopened', async () => {
        const req = {
            user: { id: 'admin', role: 'admin', dept: '' },
            params: { id: createdComplaintId },
            body: { status: 'Reopened', remarks: 'Problem reported again by student.' }
        };
        const res = createMockRes();
        await complaintsController.updateComplaint(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.data.status, 'Reopened');
    });

    await test('Complaints: Student CANNOT reopen a complaint that is not Resolved (400)', async () => {
        const req = {
            user: { id: 'student', role: 'student' },
            params: { id: createdComplaintId },
            body: { status: 'Reopened' }
        };
        const res = createMockRes();
        await complaintsController.updateComplaint(req, res);
        assert.strictEqual(res.statusCode, 400);
        assert.strictEqual(res.data.success, false);
    });

    await test('Complaints: Student CANNOT change status to Resolved (403)', async () => {
        const req = {
            user: { id: 'student', role: 'student' },
            params: { id: createdComplaintId },
            body: { status: 'Resolved' }
        };
        const res = createMockRes();
        await complaintsController.updateComplaint(req, res);
        assert.strictEqual(res.statusCode, 403);
        assert.strictEqual(res.data.success, false);
    });

    await test('Complaints: Student CANNOT reopen another student complaint (403)', async () => {
        const req = {
            user: { id: 'other_student', role: 'student' },
            params: { id: 'CMP10002' },
            body: { status: 'Reopened' }
        };
        const res = createMockRes();
        await complaintsController.updateComplaint(req, res);
        assert.strictEqual(res.statusCode, 403);
        assert.strictEqual(res.data.success, false);
    });

    await test('Complaints: Student reopen request sets status to Reopen Requested (200)', async () => {
        const req = {
            user: { id: 'student', role: 'student' },
            params: { id: 'CMP10002' },
            body: { status: 'Reopened', remarks: 'Issue reoccurred.' }
        };
        const res = createMockRes();
        await complaintsController.updateComplaint(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.data.status, 'Reopen Requested');
    });

    await test('Complaints: Admin can approve Reopen Requested complaint to Reopened (200)', async () => {
        const req = {
            user: { id: 'admin', role: 'admin' },
            params: { id: 'CMP10002' },
            body: { status: 'Reopened', remarks: 'Reopen approved by administrator.' }
        };
        const res = createMockRes();
        await complaintsController.updateComplaint(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.data.status, 'Reopened');
    });

    // --- USERS CONTROLLER TESTS ---
    await test('Users: Admin creates new staff user', async () => {
        const newStaffId = 'STAFF_' + Date.now();
        const req = {
            body: {
                id: newStaffId,
                name: 'New Staff Member',
                email: `${newStaffId.toLowerCase()}@test.edu`,
                role: 'staff',
                dept: 'Infrastructure'
            }
        };
        const res = createMockRes();
        await usersController.createUser(req, res);
        assert.strictEqual(res.statusCode, 201);
        assert.strictEqual(res.data.success, true);
        assert.strictEqual(res.data.data.id, newStaffId);
    });

    await test('Users: Admin lists users', async () => {
        const req = { query: {} };
        const res = createMockRes();
        await usersController.getUsers(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.data.success, true);
        assert.ok(Array.isArray(res.data.data));
        assert.ok(res.data.data.length >= 2);
    });

    await test('Users: Admin filters users by role=student', async () => {
        const req = { query: { role: 'student' } };
        const res = createMockRes();
        await usersController.getUsers(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.data.success, true);
        const allStudents = res.data.data.every(u => u.role === 'student');
        assert.ok(allStudents);
    });

    await test('Users: Admin toggles user status to blocked and back', async () => {
        // 1. Block student
        const reqBlock = { params: { id: testStudentId } };
        const resBlock = createMockRes();
        await usersController.toggleUserStatus(reqBlock, resBlock);
        assert.strictEqual(resBlock.statusCode, 200);
        assert.strictEqual(resBlock.data.data.status, 'blocked');

        // 2. Blocked student cannot log in
        const reqLogin = { body: { id: testStudentId, password: 'newpassword456' } };
        const resLogin = createMockRes();
        await authController.login(reqLogin, resLogin);
        assert.strictEqual(resLogin.statusCode, 403);

        // 3. Unblock student
        const reqUnblock = { params: { id: testStudentId } };
        const resUnblock = createMockRes();
        await usersController.toggleUserStatus(reqUnblock, resUnblock);
        assert.strictEqual(resUnblock.statusCode, 200);
        assert.strictEqual(resUnblock.data.data.status, 'active');
    });

    await test('Users: Prevent blocking primary admin account (400)', async () => {
        const req = { params: { id: 'admin' } };
        const res = createMockRes();
        await usersController.toggleUserStatus(req, res);
        assert.strictEqual(res.statusCode, 400);
    });

    await test('Users: Delete user succeeds', async () => {
        const req = { params: { id: testStudentId } };
        const res = createMockRes();
        await usersController.deleteUser(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.data.success, true);
    });

    await test('Users: Prevent deleting primary admin account (400)', async () => {
        const req = { params: { id: 'admin' } };
        const res = createMockRes();
        await usersController.deleteUser(req, res);
        assert.strictEqual(res.statusCode, 400);
    });

    // --- NOTIFICATIONS CONTROLLER TESTS ---
    await test('Notifications: Retrieve notifications for student', async () => {
        const req = { user: { id: 'student', role: 'student' } };
        const res = createMockRes();
        await notificationsController.getNotifications(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.data.success, true);
        assert.ok(Array.isArray(res.data.data));
    });

    await test('Notifications: Mark notification read', async () => {
        const req = {
            user: { id: 'student', role: 'student' },
            params: { id: 'notif-1' }
        };
        const res = createMockRes();
        await notificationsController.markRead(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.data.success, true);
    });

    await test('Notifications: Mark all notifications read', async () => {
        const req = { user: { id: 'student', role: 'student' } };
        const res = createMockRes();
        await notificationsController.markAllRead(req, res);
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.data.success, true);
    });

    console.log(`\n========================================`);
    console.log(`🏁 Complete Verification Results: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
}

runTestSuite();
