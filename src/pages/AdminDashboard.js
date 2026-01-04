import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import API from '../api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DashboardCharts from '../components/DashboardCharts';

// Components
import BookManagement from '../components/BookManagement';
import StudentManagement from '../components/StudentManagement';
import DepartmentManagement from '../components/DepartmentManagement';
import StaffManagement from '../components/StaffManagement';
import CirculationDesk from '../components/CirculationDesk';
import FineManager from '../components/FineManager';
import ReportGenerator from '../components/ReportGenerator';
import AuditLogs from '../components/AuditLogs';
import Settings from '../components/Settings';
import FeedbackManager from '../components/FeedbackManager';
import AdminManager from '../components/AdminManager';
import LibraryRules from '../components/LibraryRules';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [stats, setStats] = useState({ totalBooks: 0, totalStudents: 0, activeIssues: 0, totalFine: 0, recentActivity: [] });

    useEffect(() => {
        if (activeTab === 'dashboard') fetchStats();
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const { data } = await API.get('/circulation/dashboard-stats');
            setStats(data);
        } catch (error) { console.error("Stats error", error); }
    };

    // Internal Dashboard View
    const StatsView = () => (
        <div>
            <div className="flex-between mb-4">
                <div>
                    <h2>Admin Dashboard</h2>
                    <p>Overview of system performance and activities.</p>
                </div>
                <div className="text-right">
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Today</div>
                    <div style={{ fontWeight: '600' }}>{new Date().toLocaleDateString('en-GB')}</div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>TOTAL BOOKS</p>
                        <h3 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{stats.totalBooks}</h3>
                    </div>
                    <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>📚</div>
                </div>
                <div className="stat-card">
                    <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>STUDENTS</p>
                        <h3 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{stats.totalStudents}</h3>
                    </div>
                    <div className="stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>🎓</div>
                </div>
                <div className="stat-card">
                    <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>ACTIVE ISSUES</p>
                        <h3 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{stats.activeIssues}</h3>
                    </div>
                    <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>🔄</div>
                </div>
                <div className="stat-card">
                    <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>TOTAL FINES</p>
                        <h3 style={{ fontSize: '2rem', marginTop: '0.5rem', color: 'var(--danger)' }}>₹{stats.totalFine}</h3>
                    </div>
                    <div className="stat-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>💰</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                <div className="card">
                    <DashboardCharts stats={stats} />
                </div>

                <div className="card">
                    <div className="card-header">
                        <h4>Recent Activity</h4>
                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }} onClick={() => setActiveTab('history')}>View All</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {stats.recentActivity.map((act) => (
                            <div key={act._id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                                <div style={{
                                    width: '10px', height: '10px', borderRadius: '50%',
                                    background: act.status === 'Issued' ? 'var(--warning)' : 'var(--success)'
                                }}></div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{act.book?.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        <span style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 'bold' }}>{act.status}</span> • {act.student?.name}
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                    {new Date(act.issueDate).toLocaleDateString('en-GB')}
                                </div>
                            </div>
                        ))}
                        {stats.recentActivity.length === 0 && <p className="text-center">No activity recorded.</p>}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="dashboard-layout">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                role={user?.role}
                logout={logout}
            />

            <div className="dashboard-main">
                <Header user={user} />

                <div className="dashboard-content">
                    {activeTab === 'dashboard' && <StatsView />}
                    {activeTab === 'circulation' && <CirculationDesk />}
                    {activeTab === 'books' && <BookManagement />}
                    {activeTab === 'students' && <StudentManagement />}
                    {activeTab === 'staff-manage' && <StaffManagement />}
                    {activeTab === 'admin-manage' && <AdminManager />}
                    {activeTab === 'departments' && <DepartmentManagement />}
                    {activeTab === 'fines' && <FineManager />}
                    {activeTab === 'history' && <ReportGenerator />}
                    {activeTab === 'audit' && <AuditLogs />}
                    {activeTab === 'settings' && <Settings />}
                    {activeTab === 'rules' && <LibraryRules />}
                    {activeTab === 'feedback' && <FeedbackManager />}
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;