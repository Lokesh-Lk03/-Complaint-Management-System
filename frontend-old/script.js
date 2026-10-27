/* ============================================================
   University ERP System — Main Script
   Modular JavaScript: Auth, Complaints, Notifications,
   User Management, Settings, UI (Sidebar, Profile Dropdown,
   Dark Mode, Notification Badge)
   ============================================================ */

'use strict';

// ═══════════════════════════════════════════════════════════
// MODULE: University Academic Data
// ═══════════════════════════════════════════════════════════
// Scalable nested structure: add new faculties/schools/courses here.
// Each faculty has unique schools; each school has unique courses.
// No cross-mapping is possible by design.
const ACADEMIC_DATA = [
    // ─────────────────────────────────────────────────────────
    // Faculty of Engineering & Technology
    // ─────────────────────────────────────────────────────────
    {
        id: 'FET',
        name: 'Faculty of Engineering & Technology',
        schools: [
            {
                id: 'SCE',
                name: 'School of Computational Engineering',
                courses: [
                    'B.Tech Computer Science and Engineering',
                    'B.Tech Artificial Intelligence and Data Science',
                    'B.Tech CSE (AI & ML)',
                    'B.Tech Information Technology',
                    'B.Tech CSE (Cyber Security)',
                    'B.Tech CSE (Applied AI)',
                    'M.Tech Computer Science and Engineering (AI)',
                    'M.Tech Computer Science and Engineering (Big Data)',
                    'M.Tech Computer Science and Engineering (IoT Cloud Computing)',
                    'Ph.D Computer Science & Engineering',
                ],
            },
        ],
    },

    // ─────────────────────────────────────────────────────────
    // Faculty of Management & Commerce
    // ─────────────────────────────────────────────────────────
    {
        id: 'FMC',
        name: 'Faculty of Management & Commerce',
        schools: [
            {
                id: 'SMS',
                name: 'School of Management Studies',
                courses: [
                    'BBA (FINTECH)',
                    'Master of Business Administration',
                ],
            },
            {
                id: 'SCM',
                name: 'School of Commerce',
                courses: [
                    'B.Com (General)',
                    'B.Com (Accounting and Finance)',
                    'M.Com',
                ],
            },
        ],
    },

    // ─────────────────────────────────────────────────────────
    // Faculty of Sciences  (merged — no duplicate)
    // ─────────────────────────────────────────────────────────
    {
        id: 'FS',
        name: 'Faculty of Sciences',
        schools: [
            {
                id: 'SBS',
                name: 'School of Basic Sciences',
                courses: [
                    'B.Sc Chemistry',
                    'M.Sc Chemistry',
                    'M.Sc Mathematics',
                    'M.Sc Physics',
                ],
            },
            {
                id: 'SCS',
                name: 'School of Computer Science',
                courses: [
                    'B.Sc Computer Science (AI & DS)',
                    'B.Sc Computer Science (AI & ML)',
                    'Master of Computer Applications',
                    'BCA',
                ],
            },
            {
                id: 'SAS',
                name: 'School of Agricultural Sciences',
                courses: [
                    'B.Sc (Hons) Agriculture',
                ],
            },
            {
                id: 'SSS',
                name: 'School of Social Sciences',
                courses: [
                    'B.A Defense and Strategic Studies',
                    'B.A International Relations and Public Policy',
                    'Master of Social Work',
                ],
            },
            {
                id: 'SH',
                name: 'School of Humanities',
                courses: [
                    'B.A Tamil',
                    'M.A English',
                ],
            },
        ],
    },

    // ─────────────────────────────────────────────────────────
    // Faculty of Health Sciences
    // ─────────────────────────────────────────────────────────
    {
        id: 'FHS',
        name: 'Faculty of Health Sciences',
        schools: [
            {
                id: 'SAHS',
                name: 'School of Allied Health Sciences',
                courses: [
                    'B.Sc Cardiac Technology',
                    'B.Sc Medical Laboratory Technology',
                    'B.Sc Optometry',
                    'B.Sc Operation Theatre and Anesthesia Technology',
                    'B.Sc Physician Assistant',
                    'B.Sc Radio Imaging Technology',
                    'B.Sc Cardiac Perfusion Technology',
                ],
            },
            {
                id: 'SPT',
                name: 'School of Physiotherapy',
                courses: [
                    'Bachelor of Physiotherapy',
                ],
            },
            {
                id: 'SPHR',
                name: 'School of Pharmacy',
                courses: [
                    'Bachelor of Pharmacy',
                ],
            },
            {
                id: 'SNR',
                name: 'School of Nursing',
                courses: [
                    'B.Sc Nursing',
                ],
            },
            {
                id: 'SMED',
                name: 'School of Medicine',
                courses: [
                    'Takshashila Medical College',
                ],
            },
        ],
    },
];

// ── Helpers for fast lookup (O(1) by id) ──────────────────────
const _facultyMap = {};
const _schoolMap = {};
ACADEMIC_DATA.forEach(f => {
    _facultyMap[f.id] = f;
    f.schools.forEach(s => { _schoolMap[s.id] = { ...s, facultyId: f.id }; });
});

// ── Dropdown initialisation ───────────────────────────────────
function initAcademicDropdowns() {
    const fSel = document.getElementById('cFaculty');
    if (!fSel) return;

    // Populate Faculty options
    ACADEMIC_DATA.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.id;
        opt.textContent = f.name;
        fSel.appendChild(opt);
    });
}

// Called when Faculty changes
window.onFacultyChange = function (facultyId) {
    const sSel = document.getElementById('cSchool');
    const cSel = document.getElementById('cCourse');
    const sHint = document.getElementById('schoolHint');
    const cHint = document.getElementById('courseHint');
    if (!sSel || !cSel) return;

    // Reset & disable downstream
    resetSelect(sSel, '— Select School —');
    resetSelect(cSel, '— Select Course —');
    cSel.disabled = true;
    if (cHint) cHint.textContent = ' (select a school first)';

    if (!facultyId) { sSel.disabled = true; return; }

    const faculty = _facultyMap[facultyId];
    if (!faculty) { sSel.disabled = true; return; }

    // Populate schools that belong ONLY to this faculty
    faculty.schools.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = s.name;
        sSel.appendChild(opt);
    });
    sSel.disabled = false;
    if (sHint) sHint.textContent = '';
};

// Called when School changes
window.onSchoolChange = function (schoolId) {
    const cSel = document.getElementById('cCourse');
    const cHint = document.getElementById('courseHint');
    if (!cSel) return;

    resetSelect(cSel, '— Select Course —');

    if (!schoolId) { cSel.disabled = true; return; }

    const school = _schoolMap[schoolId];
    if (!school) { cSel.disabled = true; return; }

    // Populate courses belonging ONLY to this school
    school.courses.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        cSel.appendChild(opt);
    });
    cSel.disabled = false;
    if (cHint) cHint.textContent = '';
};

// Util: clear a select back to its placeholder
function resetSelect(sel, placeholder) {
    sel.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
    sel.value = '';
}

// ═══════════════════════════════════════════════════════════
// MODULE: API Helpers
// ═══════════════════════════════════════════════════════════
const API_URL = 'http://localhost:5001/api';

const Store = {
    get(key, fallback = null) {
        try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
        catch { return fallback; }
    },
    set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
    remove(key) { localStorage.removeItem(key); }
};

async function apiFetch(endpoint, method = 'GET', body = null) {
    const token = Store.get('erp_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    try {
        const res = await fetch(`${API_URL}${endpoint}`, options);
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'API Error');
        return data.data !== undefined ? data.data : data;
    } catch (err) {
        console.error('API Error:', err);
        throw err;
    }
}

// ═══════════════════════════════════════════════════════════
// UI Helpers for Badge and Dates
// ═══════════════════════════════════════════════════════════
function statusBadge(status) {
    const map = {
        'New': 'badge-new',
        'In Progress': 'badge-inprogress',
        'Resolved': 'badge-resolved',
        'Reopened': 'badge-reopened',
    };
    return `<span class="badge ${map[status] || 'badge-new'}">${status}</span>`;
}

function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function timeAgo(iso) {
    if (!iso) return '';
    const diff = (Date.now() - new Date(iso)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

// ═══════════════════════════════════════════════════════════
// MODULE: Notifications
// ═══════════════════════════════════════════════════════════
window.updateNotifBadge = async function (role) {
    try {
        const list = await apiFetch('/notifications');
        const unread = list.filter(n => !n.read).length;

        const show = (id, count) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.textContent = count;
            el.classList.toggle('show', count > 0);
        };
        show('sidebarNotifBadge', unread);
        show('headerNotifBadge', unread);
    } catch (e) {
        console.error('Failed to update notif badge', e);
    }
}

window.renderNotifications = async function (role, listElId) {
    const el = document.getElementById(listElId);
    if (!el) return;

    try {
        const list = await apiFetch('/notifications');

        if (list.length === 0) {
            el.innerHTML = `<div class="notif-empty"><i class="fa-solid fa-bell-slash"></i><p>No notifications yet</p></div>`;
            return;
        }

        el.innerHTML = list.map(n => `
        <div class="notif-item ${n.read ? '' : 'unread'}" onclick="markNotifRead('${role}', '${n._id}')">
          <div class="notif-item-icon"><i class="fa-solid ${n.icon || 'fa-bell'}"></i></div>
          <div class="notif-item-body">
            <div class="notif-title">${n.title}</div>
            <div class="notif-msg">${n.message}</div>
            <div class="notif-time">${timeAgo(n.createdAt)}</div>
          </div>
          ${!n.read ? '<div style="width:8px;height:8px;border-radius:50%;background:var(--primary);flex-shrink:0;margin-top:6px;"></div>' : ''}
        </div>
      `).join('');
    } catch (e) {
        el.innerHTML = `<div class="notif-empty"><p>Error loading notifications</p></div>`;
    }
}

window.markNotifRead = async function (role, id) {
    try {
        await apiFetch(`/notifications/${id}/read`, 'PATCH');
        const listId = role === 'admin' ? 'adminNotificationsList' : 'studentNotificationsList';
        await renderNotifications(role, listId);
        await updateNotifBadge(role);
    } catch (e) {
        console.error(e);
    }
};

window.markAllAsRead = async function (role) {
    try {
        await apiFetch('/notifications/read-all', 'POST');
        const listId = role === 'admin' ? 'adminNotificationsList' : 'studentNotificationsList';
        await renderNotifications(role, listId);
        await updateNotifBadge(role);
    } catch (e) {
        console.error(e);
    }
};

window.clearNotifications = async function (role) {
    try {
        await apiFetch('/notifications', 'DELETE');
        const listId = role === 'admin' ? 'adminNotificationsList' : 'studentNotificationsList';
        await renderNotifications(role, listId);
        await updateNotifBadge(role);
    } catch (e) {
        console.error(e);
    }
};

// ═══════════════════════════════════════════════════════════
// MODULE: Auth
// ═══════════════════════════════════════════════════════════
function getActiveUser() { return Store.get('erp_active_user'); }
function setActiveUser(u, token) {
    Store.set('erp_active_user', u);
    if (token) Store.set('erp_token', token);
}

window.logoutUser = function () {
    Store.remove('erp_active_user');
    Store.remove('erp_token');
    const isAdmin = window.location.pathname.includes('/admin/');
    window.location.href = isAdmin ? '../admin-login.html' : 'login.html';
};

window.logout = window.logoutUser;

function requireAuth(role) {
    const user = getActiveUser();
    const token = Store.get('erp_token');
    if (!user || user.role !== role || !token) {
        const isAdmin = window.location.pathname.includes('/admin/');
        window.location.href = isAdmin ? '../admin-login.html' : 'login.html';
        return false;
    }
    return true;
}

// ═══════════════════════════════════════════════════════════
// MODULE: UI Helpers
// ═══════════════════════════════════════════════════════════
window.togglePassword = function (inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    if (!input || !icon) return;
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fa-solid fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fa-solid fa-eye';
    }
};

window.toggleProfileMenu = function () {
    const trigger = document.getElementById('profileTrigger');
    const menu = document.getElementById('profileMenu');
    if (!trigger || !menu) return;
    const isOpen = menu.classList.contains('open');
    menu.classList.toggle('open', !isOpen);
    trigger.classList.toggle('open', !isOpen);
};

// Close profile menu on outside click
document.addEventListener('click', e => {
    const dd = document.querySelector('.profile-dropdown');
    if (dd && !dd.contains(e.target)) {
        document.getElementById('profileMenu')?.classList.remove('open');
        document.getElementById('profileTrigger')?.classList.remove('open');
    }
});

window.toggleSidebar = function () {
    document.getElementById('sidebar')?.classList.toggle('open');
    document.getElementById('sidebarOverlay')?.classList.toggle('show');
};
window.closeSidebar = function () {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebarOverlay')?.classList.remove('show');
};

// Dark Mode
window.toggleDarkMode = function (on) {
    document.body.classList.toggle('dark-mode', on);
    Store.set('erp_dark_mode', on);
    const label = document.getElementById('currentThemeLabel');
    if (label) label.textContent = on ? 'Dark' : 'Light';
};

function applyStoredTheme() {
    const dark = Store.get('erp_dark_mode', false);
    if (dark) document.body.classList.add('dark-mode');
    const toggle = document.getElementById('darkModeToggle');
    if (toggle) toggle.checked = dark;
    const label = document.getElementById('currentThemeLabel');
    if (label) label.textContent = dark ? 'Dark' : 'Light';
}

// Show/hide alert helper
function showAlert(el, type, msg) {
    if (!el) return;
    el.className = `alert alert-${type}`;
    const iconMap = { error: 'fa-circle-exclamation', success: 'fa-check-circle', info: 'fa-circle-info', warning: 'fa-triangle-exclamation' };
    el.innerHTML = `<i class="fa-solid ${iconMap[type] || 'fa-circle-info'}"></i> ${msg}`;
    el.classList.remove('hidden');
}
function hideAlert(el) {
    if (el) el.classList.add('hidden');
}
function flashAlert(el, type, msg, duration = 3500) {
    showAlert(el, type, msg);
    setTimeout(() => hideAlert(el), duration);
}

// ═══════════════════════════════════════════════════════════
// MODULE: Save Profile (settings pages)
// ═══════════════════════════════════════════════════════════
window.saveProfile = function () {
    const msgEl = document.getElementById('settingsMsg');
    flashAlert(msgEl, 'success', 'Profile updated successfully!');
};

// ═══════════════════════════════════════════════════════════
// PAGE INITIALIZATION
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    applyStoredTheme();
    initPage();
});

function initPage() {
    const path = window.location.pathname;
    const fname = path.split('/').pop().toLowerCase();

    // Login pages
    if (fname === 'login.html') return initStudentLogin();
    if (fname === 'admin-login.html') return initAdminLogin();

    // Forgot password
    if (fname === 'forgot-password.html') return initForgotPassword();

    // Dashboards & sub-pages
    if (fname === 'student-dashboard.html') return initStudentDashboard();
    if (fname === 'admin-dashboard.html') return initAdminDashboard();
    if (fname === 'user-management.html') return initUserManagement();
    if (fname === 'notifications.html') {
        if (path.includes('/admin/')) return initAdminNotifications();
        return initStudentNotifications();
    }
    if (fname === 'settings.html') {
        if (path.includes('/admin/')) return initAdminSettings();
        return initStudentSettings();
    }
}

// ════════════════════════════════════════════
// Student Login
// ════════════════════════════════════════════
function initStudentLogin() {
    // Auto-redirect if already logged in
    const user = getActiveUser();
    if (user?.role === 'student') { window.location.href = 'student-dashboard.html'; return; }
    if (user?.role === 'admin') { window.location.href = 'admin/admin-dashboard.html'; return; }

    const form = document.getElementById('studentLoginForm');
    const errEl = document.getElementById('loginError');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert(errEl);
        const u = document.getElementById('username')?.value.trim();
        const p = document.getElementById('password')?.value;

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: u, password: p })
            });
            const data = await res.json();

            if (data.success) {
                setActiveUser({ ...data.user, role: 'student' }, data.token);
                window.location.href = 'student-dashboard.html';
            } else {
                showAlert(errEl, 'error', data.message || 'Invalid Student ID or password.');
            }
        } catch (error) {
            showAlert(errEl, 'error', 'Server error. Please ensure the backend is running.');
        }
    });
}

// ════════════════════════════════════════════
// Admin Login
// ════════════════════════════════════════════
function initAdminLogin() {
    const user = getActiveUser();
    if (user?.role === 'admin') { window.location.href = 'admin-dashboard.html'; return; }

    const form = document.getElementById('adminLoginForm');
    const errEl = document.getElementById('adminLoginError');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert(errEl);
        const u = document.getElementById('adminUsername')?.value.trim();
        const p = document.getElementById('adminPassword')?.value;

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: u, password: p })
            });
            const data = await res.json();

            if (data.success && (data.user.role === 'admin' || data.user.role === 'staff')) {
                setActiveUser(data.user, data.token);
                window.location.href = 'admin-dashboard.html';
            } else {
                showAlert(errEl, 'error', data.message || 'Invalid admin credentials.');
            }
        } catch (error) {
            showAlert(errEl, 'error', 'Server error. Please ensure the backend is running.');
        }
    });
}

// ════════════════════════════════════════════
// Forgot Password
// ════════════════════════════════════════════
function initForgotPassword() {
    const form = document.getElementById('forgotPasswordForm');
    const successEl = document.getElementById('fpSuccess');
    const errorEl = document.getElementById('fpError');
    if (!form) return;

    form.addEventListener('submit', e => {
        e.preventDefault();
        hideAlert(successEl);
        hideAlert(errorEl);
        const email = document.getElementById('fpEmail')?.value.trim();
        if (email.includes('@')) {
            showAlert(successEl, 'success', `Reset link sent to <strong>${email}</strong>. Check your inbox.`);
            form.reset();
        } else {
            showAlert(errorEl, 'error', 'Please enter a valid email address.');
        }
    });
}

// ════════════════════════════════════════════
// Student Dashboard
// ════════════════════════════════════════════
async function initStudentDashboard() {
    if (!requireAuth('student')) return;

    const user = getActiveUser();
    setStudentHeaderInfo(user);
    updateNotifBadge('student');

    // Initialise the three-level academic dropdowns
    initAcademicDropdowns();

    await renderStudentComplaints();
    await updateStudentStats();

    const form = document.getElementById('complaintForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            const genderEl = document.querySelector('input[name="cGender"]:checked');
            const facultyEl = document.getElementById('cFaculty');
            const schoolEl = document.getElementById('cSchool');
            const courseEl = document.getElementById('cCourse');

            if (!genderEl) { alert('Please select a gender.'); if (submitBtn) submitBtn.disabled = false; return; }
            if (!facultyEl?.value) { alert('Please select a Faculty.'); if (submitBtn) submitBtn.disabled = false; return; }
            if (!schoolEl?.value) { alert('Please select a School.'); if (submitBtn) submitBtn.disabled = false; return; }
            if (!courseEl?.value) { alert('Please select a Course.'); if (submitBtn) submitBtn.disabled = false; return; }

            // Resolve human-readable names from IDs
            const facultyName = _facultyMap[facultyEl.value]?.name || facultyEl.value;
            const schoolName = _schoolMap[schoolEl.value]?.name || schoolEl.value;

            const payload = {
                name: document.getElementById('cName')?.value.trim(),
                email: document.getElementById('cEmail')?.value.trim(),
                gender: genderEl.value,
                facultyId: facultyEl.value,
                faculty: facultyName,
                schoolId: schoolEl.value,
                school: schoolName,
                course: courseEl.value,
                desc: document.getElementById('cDesc')?.value.trim(),
            };

            try {
                const cmp = await apiFetch('/complaints', 'POST', payload);

                flashAlert(document.getElementById('successMsg'), 'success', `Complaint <strong>${cmp.id}</strong> submitted successfully!`);
                await renderStudentComplaints();
                await updateStudentStats();
                await updateNotifBadge('student');
            } catch (err) {
                flashAlert(document.getElementById('successMsg'), 'error', err.message || 'Failed to submit complaint.');
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }
}

function setStudentHeaderInfo(user) {
    const name = user?.name || user?.id || 'Student';
    const initials = name.substring(0, 1).toUpperCase();
    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl('studentName', name);
    setEl('menuStudentName', name);
    setEl('menuStudentEmail', user?.email || 'student@university.edu');
    setEl('studentAvatar', initials);
}

async function renderStudentComplaints() {
    const tbody = document.getElementById('studentTableBody');
    if (!tbody) return;

    try {
        const list = await apiFetch('/complaints');

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="table-empty"><i class="fa-solid fa-inbox"></i><br>No complaints yet</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map(c => `
        <tr>
          <td><code style="font-size:0.8rem;">${c.id}</code></td>
          <td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${c.desc}">${c.desc?.substring(0, 35) || '—'}${c.desc?.length > 35 ? '…' : ''}</td>
          <td style="font-size:0.78rem;color:var(--text-secondary);">${c.school || '—'}</td>
          <td style="font-size:0.78rem;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${c.course}">${c.course || '—'}</td>
          <td>${statusBadge(c.status)}</td>
          <td>${c.referral ? `<span class="badge badge-student">${c.referral}</span>` : '—'}</td>
        </tr>
      `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" class="table-empty" style="color:var(--danger);"><i class="fa-solid fa-triangle-exclamation"></i><br>Failed to load complaints.</td></tr>`;
    }
}

async function updateStudentStats() {
    try {
        const list = await apiFetch('/complaints');

        const cRes = list.filter(c => c.status === 'Resolved').length;
        const cRe = list.filter(c => c.status === 'Reopened').length;

        animateValue('stRes', cRes);
        animateValue('stRe', cRe);
    } catch (err) {
        console.error('Failed to update stats:', err);
    }
}

// ════════════════════════════════════════════
// Admin Dashboard
// ════════════════════════════════════════════
let currentFilter = { status: 'all', search: '' };

function initAdminDashboard() {
    if (!requireAuth('admin')) return;
    setAdminHeaderInfo();
    updateNotifBadge('admin');
    renderAdminDashboard();

    // Search & filter
    document.getElementById('searchComplaints')?.addEventListener('input', e => {
        currentFilter.search = e.target.value.toLowerCase();
        renderAdminDashboard();
    });
    document.getElementById('filterStatus')?.addEventListener('change', e => {
        currentFilter.status = e.target.value;
        renderAdminDashboard();
    });
}

function setAdminHeaderInfo() {
    const user = getActiveUser();
    const name = user?.name || 'Administrator';
    const initials = name.substring(0, 1).toUpperCase();
    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl('adminName', name);
    setEl('menuFullName', name);
    setEl('adminAvatar', initials);
}

function animateValue(id, end, duration = 1500) {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * end);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = end;
        }
    };
    window.requestAnimationFrame(step);
}

async function renderAdminDashboard() {
    try {
        const all = await apiFetch('/complaints');
        let list = all;

        // Filter by status
        if (currentFilter.status !== 'all') {
            list = list.filter(c => c.status === currentFilter.status);
        }
        // Filter by search
        if (currentFilter.search) {
            const q = currentFilter.search;
            list = list.filter(c =>
                c.name?.toLowerCase().includes(q) ||
                c.id?.toLowerCase().includes(q) ||
                c.course?.toLowerCase().includes(q)
            );
        }

        // Counts from full list
        const cNew = all.filter(c => c.status === 'New').length;
        const cIP = all.filter(c => c.status === 'In Progress').length;
        const cRes = all.filter(c => c.status === 'Resolved').length;
        const cRe = all.filter(c => c.status === 'Reopened').length;

        animateValue('countNew', cNew);
        animateValue('countIP', cIP);
        animateValue('countRes', cRes);
        animateValue('countRe', cRe);

        // Chart.js render
        const ctx = document.getElementById('adminChart');
        if (ctx && window.Chart) {
            const chartStatus = Chart.getChart('adminChart');
            if (chartStatus) chartStatus.destroy();

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['New', 'In Progress', 'Resolved', 'Reopened'],
                    datasets: [{
                        label: 'Complaints',
                        data: [cNew, cIP, cRes, cRe],
                        backgroundColor: [
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(239, 68, 68, 0.8)'
                        ],
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
                }
            });
        }

        const tbody = document.getElementById('adminTableBody');
        if (!tbody) return;

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="table-empty"><i class="fa-solid fa-inbox"></i><br>No complaints found</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map(c => `
        <tr>
          <td><code style="font-size:0.8rem;">${c.id}</code></td>
          <td>${c.name || '—'}</td>
          <td>${c.course || '—'}</td>
          <td>${formatDate(c.createdAt)}</td>
          <td>${statusBadge(c.status)}</td>
          <td>${c.referral ? `<span class="badge badge-student">${c.referral}</span>` : '—'}</td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="openModal('${c._id || c.id}')">
              <i class="fa-solid fa-pen"></i> Update
            </button>
          </td>
        </tr>
      `).join('');
    } catch (e) {
        console.error('Error rendering admin dashboard:', e);
    }
}

window.openModal = async function (id) {
    try {
        const c = await apiFetch(`/complaints/${id}`);
        if (!c) return;
        document.getElementById('modalId').value = c._id || c.id;
        document.getElementById('modalStatus').value = c.status;
        document.getElementById('modalReferral').value = c.referral || '';
        document.getElementById('modalRemarks').value = c.remarks || '';
        document.getElementById('updateModal').classList.add('open');
    } catch (e) {
        console.error('Error fetching complaint details for modal:', e);
    }
};

window.closeModal = function () {
    document.getElementById('updateModal')?.classList.remove('open');
};

window.submitUpdateForm = async function () {
    const btn = document.querySelector('#updateModal .btn-primary');
    if (btn) btn.disabled = true;

    try {
        const id = document.getElementById('modalId')?.value;
        const payload = {
            status: document.getElementById('modalStatus').value,
            referral: document.getElementById('modalReferral').value.trim(),
            remarks: document.getElementById('modalRemarks').value.trim()
        };

        await apiFetch(`/complaints/${id}`, 'PUT', payload);

        closeModal();
        await renderAdminDashboard();
        await updateNotifBadge('admin');
    } catch (e) {
        console.error('Failed to update complaint:', e);
    } finally {
        if (btn) btn.disabled = false;
    }
};

// ════════════════════════════════════════════
// User Management
// ════════════════════════════════════════════
function initUserManagement() {
    if (!requireAuth('admin')) return;
    setAdminHeaderInfo();
    updateNotifBadge('admin');
    renderUsersTable();

    const staffForm = document.getElementById('addStaffForm');
    const studentForm = document.getElementById('addStudentForm');
    const successEl = document.getElementById('umSuccessMsg');
    const successText = document.getElementById('umSuccessText');

    if (staffForm) {
        staffForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = staffForm.querySelector('button[type="submit"]');
            if (btn) btn.disabled = true;

            const account = {
                id: document.getElementById('staffUsername')?.value.trim(),
                name: document.getElementById('staffName')?.value.trim(),
                email: document.getElementById('staffEmail')?.value.trim(),
                password: document.getElementById('staffPassword')?.value,
                role: document.getElementById('staffRole')?.value,
                dept: document.getElementById('staffDept')?.value.trim(),
                contact: document.getElementById('staffContact')?.value.trim(),
                type: 'staff',
                status: 'active'
            };

            try {
                const res = await apiFetch('/users', 'POST', account);
                staffForm.reset();
                document.getElementById('staffDeptGroup').style.display = 'none';
                flashAlert(successEl, 'success', `Staff account <strong>${res.name}</strong> created successfully!`);
                await renderUsersTable();
                await updateNotifBadge('admin');
            } catch (err) {
                flashAlert(successEl, 'error', err.message || 'Failed to create staff account.');
            } finally {
                if (btn) btn.disabled = false;
            }
        });
    }

    if (studentForm) {
        studentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = studentForm.querySelector('button[type="submit"]');
            if (btn) btn.disabled = true;

            const student = {
                id: document.getElementById('stId')?.value.trim(),
                name: document.getElementById('stName')?.value.trim(),
                email: document.getElementById('stEmail')?.value.trim(),
                course: document.getElementById('stCourse')?.value,
                password: document.getElementById('stPassword')?.value,
                contact: document.getElementById('stContact')?.value.trim(),
                type: 'student',
                status: 'active'
            };

            try {
                const res = await apiFetch('/users', 'POST', student);
                studentForm.reset();
                flashAlert(successEl, 'success', `Student account <strong>${res.name}</strong> created!`);
                await renderUsersTable();
                await updateNotifBadge('admin');
            } catch (err) {
                flashAlert(successEl, 'error', err.message || 'Failed to create student account.');
            } finally {
                if (btn) btn.disabled = false;
            }
        });
    }

    // Search + filter
    document.getElementById('searchStudent')?.addEventListener('input', renderUsersTable);
    document.getElementById('filterStatus')?.addEventListener('change', renderUsersTable);
}

async function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    try {
        const query = document.getElementById('searchStudent')?.value.toLowerCase() || '';
        const statusFil = document.getElementById('filterStatus')?.value || 'all';

        const allUsers = await apiFetch('/users');
        let students = allUsers.filter(s => s.type === 'student' || s.role === 'student');

        if (query) {
            students = students.filter(s =>
                s.name?.toLowerCase().includes(query) ||
                s.id?.toLowerCase().includes(query)
            );
        }
        if (statusFil !== 'all') {
            students = students.filter(s => s.status === statusFil);
        }

        if (students.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="table-empty"><i class="fa-solid fa-users"></i><br>No students found</td></tr>`;
            return;
        }

        tbody.innerHTML = students.map(s => `
        <tr>
          <td><code style="font-size:0.8rem;">${s.id}</code></td>
          <td>${s.name}</td>
          <td>${s.course || '—'}</td>
          <td>${s.email || '—'}</td>
          <td><span class="badge ${s.status === 'blocked' ? 'badge-blocked' : 'badge-active'}">${s.status || 'active'}</span></td>
          <td style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-sm btn-outline" onclick="toggleStudentStatus('${s._id || s.id}', '${s.status}')">
              <i class="fa-solid ${s.status === 'blocked' ? 'fa-unlock' : 'fa-ban'}"></i>
              ${s.status === 'blocked' ? 'Unblock' : 'Block'}
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteStudent('${s._id || s.id}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="table-empty" style="color:var(--danger);"><i class="fa-solid fa-triangle-exclamation"></i><br>Failed to load users</td></tr>`;
    }
}

window.toggleStudentStatus = async function (id, currentStatus) {
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    try {
        await apiFetch(`/users/${id}`, 'PUT', { status: newStatus });
        await renderUsersTable();
        await updateNotifBadge('admin');
    } catch (e) {
        alert('Failed to update student status');
    }
};

window.deleteStudent = async function (id) {
    if (!confirm('Delete this user account? This cannot be undone.')) return;
    try {
        await apiFetch(`/users/${id}`, 'DELETE');
        await renderUsersTable();
    } catch (e) {
        alert('Failed to delete student account');
    }
};

// ════════════════════════════════════════════
// Admin Notifications
// ════════════════════════════════════════════
function initAdminNotifications() {
    if (!requireAuth('admin')) return;
    setAdminHeaderInfo();
    updateNotifBadge('admin');
    renderNotifications('admin', 'adminNotificationsList');
}

// ════════════════════════════════════════════
// Student Notifications
// ════════════════════════════════════════════
function initStudentNotifications() {
    if (!requireAuth('student')) return;
    const user = getActiveUser();
    setStudentHeaderInfo(user);
    updateNotifBadge('student');
    renderNotifications('student', 'studentNotificationsList');
}

// ════════════════════════════════════════════
// Admin Settings
// ════════════════════════════════════════════
function initAdminSettings() {
    if (!requireAuth('admin')) return;
    setAdminHeaderInfo();
    updateNotifBadge('admin');
    initSettingsCommon();
}

// ════════════════════════════════════════════
// Student Settings
// ════════════════════════════════════════════
function initStudentSettings() {
    if (!requireAuth('student')) return;
    const user = getActiveUser();
    setStudentHeaderInfo(user);
    updateNotifBadge('student');
    initSettingsCommon();
}

function initSettingsCommon() {
    // Password change
    const pwForm = document.getElementById('changePasswordForm');
    const pwErr = document.getElementById('pwError');
    const msgEl = document.getElementById('settingsMsg');

    if (pwForm) {
        pwForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideAlert(pwErr);
            const btn = pwForm.querySelector('button[type="submit"]');
            if (btn) btn.disabled = true;

            const cur = document.getElementById('currentPassword')?.value;
            const nw = document.getElementById('newPassword')?.value;
            const conf = document.getElementById('confirmPassword')?.value;

            if (!cur) { showAlert(pwErr, 'error', 'Please enter your current password.'); if (btn) btn.disabled = false; return; }
            if (nw.length < 6) { showAlert(pwErr, 'error', 'New password must be at least 6 characters.'); if (btn) btn.disabled = false; return; }
            if (nw !== conf) { showAlert(pwErr, 'error', 'Passwords do not match.'); if (btn) btn.disabled = false; return; }

            try {
                await apiFetch('/auth/change-password', 'POST', { currentPassword: cur, newPassword: nw });
                pwForm.reset();
                flashAlert(msgEl, 'success', 'Password updated successfully!');
            } catch (err) {
                showAlert(pwErr, 'error', err.message || 'Failed to update password. Please check your current password.');
            } finally {
                if (btn) btn.disabled = false;
            }
        });
    }
}
