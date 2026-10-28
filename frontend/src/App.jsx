import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext, useEffect } from 'react';

// Pages
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import StudentComplaints from './pages/StudentComplaints';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminStatistics from './pages/AdminStatistics';
import ForgotPassword from './pages/ForgotPassword';

// Simple Route Guard Placeholder
const ADMIN_ROLES = ['admin', 'faculty', 'staff'];

const ProtectedRoute = ({ children, roleRequired }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  // Role check: support array or string
  if (roleRequired) {
    const allowedRoles = Array.isArray(roleRequired) ? roleRequired : [roleRequired];
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to={user.role === 'student' ? '/student-dashboard' : '/admin/dashboard'} replace />;
    }
  }

  return children;
};

function App() {
  useEffect(() => {
    const isDark = localStorage.getItem('erp_dark_mode') === 'true';
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Login initialMode="signup" />} />
          <Route path="/register" element={<Login initialMode="signup" />} />
          <Route path="/admin" element={<Navigate to="/login" replace />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route path="/student-dashboard" element={
            <ProtectedRoute roleRequired="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />

          <Route path="/student-complaints" element={
            <ProtectedRoute roleRequired="student">
              <StudentComplaints />
            </ProtectedRoute>
          } />

          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />

          {/* Admin Dashboard */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roleRequired={ADMIN_ROLES}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/users" element={
            <ProtectedRoute roleRequired={ADMIN_ROLES}>
              <AdminUserManagement />
            </ProtectedRoute>
          } />

          <Route path="/admin/statistics" element={
            <ProtectedRoute roleRequired={ADMIN_ROLES}>
              <AdminStatistics />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
