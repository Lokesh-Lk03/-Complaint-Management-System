import { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const DashboardLayout = ({ children }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className={`dashboard-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
            <div className="main-content">
                <Header />
                <main style={{ padding: '30px', flex: '1' }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
