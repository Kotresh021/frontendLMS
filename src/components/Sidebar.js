import React from 'react';
import { useTheme } from '../context/ThemeContext';

const Sidebar = ({ activeTab, setActiveTab, role, logout }) => {
    // ✅ Get state from Context (Fixes "setIsOpen is not a function")
    const { isSidebarCollapsed, isMobileMenuOpen, setIsMobileMenuOpen } = useTheme();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'staff'] },
        { id: 'circulation', label: 'Circulation', icon: '🔄', roles: ['admin', 'staff'] },
        { id: 'books', label: 'Inventory', icon: '📚', roles: ['admin', 'staff', 'student'] },
        { id: 'students', label: 'Students', icon: '🎓', roles: ['admin', 'staff'] },
        { id: 'staff-manage', label: 'Staff', icon: '👥', roles: ['admin'] },
        { id: 'admin-manage', label: 'Admins', icon: '🛡️', roles: ['admin'] },
        { id: 'departments', label: 'Depts', icon: '🏢', roles: ['admin'] },
        { id: 'fines', label: 'Fines', icon: '💰', roles: ['admin', 'staff'] },
        { id: 'history', label: 'Reports', icon: '📑', roles: ['admin', 'staff'] },
        { id: 'audit', label: 'Audit', icon: '👁️', roles: ['admin'] },
        { id: 'feedback', label: 'Feedback', icon: '💬', roles: ['admin', 'staff', 'student'] },
        { id: 'rules', label: 'Rules', icon: '📜', roles: ['admin', 'staff', 'student'] },
        { id: 'my-books', label: 'My Books', icon: '📖', roles: ['student'] },
        { id: 'library', label: 'Catalog', icon: '🔍', roles: ['student'] },
        { id: 'settings', label: 'Settings', icon: '⚙️', roles: ['admin', 'staff', 'student'] },
    ];

    // Dynamic Class for CSS Transitions
    const sidebarClass = `sidebar ${isMobileMenuOpen ? 'mobile-open' : ''} ${isSidebarCollapsed ? 'collapsed' : 'expanded'}`;

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="mobile-overlay"
                    onClick={() => setIsMobileMenuOpen(false)} // ✅ Uses Context function
                />
            )}

            <aside className={sidebarClass}>
                <div className="sidebar-header">
                    <span>{isSidebarCollapsed ? 'GPTK Library' : 'GPTK Library'}</span>
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="mobile-close-btn"
                        style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', display: 'none' }}
                    >
                        ✕
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.filter(item =>
                        role === 'student' ? ['rules', 'my-books', 'library', 'feedback', 'settings'].includes(item.id)
                            : item.roles.includes(role)
                    ).map(item => (
                        <button
                            key={item.id}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsMobileMenuOpen(false); // ✅ Close menu on click
                            }}
                            title={isSidebarCollapsed ? item.label : ''}
                        >
                            <span className="icon">{item.icon}</span>
                            <span className="label">{item.label}</span>
                        </button>
                    ))}

                    <button className="nav-item logout" onClick={logout} title="Sign Out">
                        <span className="icon">🚪</span>
                        <span className="label">Sign Out</span>
                    </button>
                </nav>
            </aside>

            <style>{`
                @media (max-width: 768px) {
                    .mobile-close-btn { display: block !important; margin-left: auto; }
                }
            `}</style>
        </>
    );
};

export default Sidebar;