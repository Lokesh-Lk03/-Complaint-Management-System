import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { Home, List, Settings, LogOut, Menu, ChevronLeft, BarChart3 } from 'lucide-react';
import takshashilaLogo from '../assets/takshashila_icon.png';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    if (!user) return null;

    const isActive = (path) => location.pathname === path ? 'active' : '';
    const isAdminRole = ['admin', 'faculty', 'staff'].includes(user.role);

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-brand-icon">
                    <img src={takshashilaLogo} alt="Takshashila University" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                </div>
                {!isCollapsed && (
                    <div className="sidebar-brand-text">
                        <h2 style={{ fontSize: '1rem', lineHeight: '1.2' }}>Takshashila</h2>
                        <span>{isAdminRole ? 'Admin Gateway' : 'Student Portal'}</span>
                    </div>
                )}
                <button
                    className="sidebar-collapse-btn"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                {!isCollapsed && <div className="sidebar-section-label">Main Navigation</div>}

                {user.role === 'student' && (
                    <>
                        <Link to="/student-dashboard" className={isActive('/student-dashboard')} title="Home">
                            <i><Home size={18} /></i>
                            {!isCollapsed && <span>Home</span>}
                        </Link>
                        <Link to="/student-complaints" className={isActive('/student-complaints')} title="My Complaints">
                            <i><List size={18} /></i>
                            {!isCollapsed && <span>My Complaints</span>}
                        </Link>
                    </>
                )}
                {isAdminRole && (
                    <>
                        <Link to="/admin/dashboard" className={isActive('/admin/dashboard')} title="Dashboard">
                            <i><Home size={18} /></i>
                            {!isCollapsed && <span>Dashboard</span>}
                        </Link>
                        <Link to="/admin/statistics" className={isActive('/admin/statistics')} title="Statistics">
                            <i><BarChart3 size={18} /></i>
                            {!isCollapsed && <span>Statistics</span>}
                        </Link>
                        <Link to="/admin/users" className={isActive('/admin/users')} title="User Management">
                            <i><List size={18} /></i>
                            {!isCollapsed && <span>User Management</span>}
                        </Link>
                    </>
                )}

                {!isCollapsed && <div className="sidebar-section-label" style={{ marginTop: '1rem' }}>Preferences</div>}
                <Link to="/settings" className={isActive('/settings')} title="Settings">
                    <i><Settings size={18} /></i>
                    {!isCollapsed && <span>Settings</span>}
                </Link>
            </nav>

            <div className="sidebar-footer">
                <button className="btn-ghost logout-btn" onClick={logout} title="Logout">
                    <i><LogOut size={18} /></i>
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
