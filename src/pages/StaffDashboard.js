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
import CirculationDesk from '../components/CirculationDesk';
import FineManager from '../components/FineManager';
import TransactionHistory from '../components/TransactionHistory';
import FeedbackManager from '../components/FeedbackManager';
import Settings from '../components/Settings';
import LibraryRules from '../components/LibraryRules';

const StaffDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('dashboard');
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

    const StatsView = () => (
        <div>
            <div className="flex-between mb-4">
                <div>
                    <h2>Staff Dashboard</h2>
                    <p>Overview of library circulation and inventory.</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>BOOKS</p>
                        <h3 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{stats.totalBooks}</h3>
                    </div>
                    <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary-text)' }}>📚</div>
                </div>
                <div className="stat-card">
                    <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>ISSUES</p>
                        <h3 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{stats.activeIssues}</h3>
                    </div>
                    <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>🔄</div>
                </div>
                <div className="stat-card">
                    <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>FINES</p>
                        <h3 style={{ fontSize: '2rem', marginTop: '0.5rem', color: 'var(--danger)' }}>₹{stats.totalFine}</h3>
                    </div>
                    <div className="stat-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>💰</div>
                </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <div className="card">
                    <DashboardCharts stats={stats} />
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
                    {activeTab === 'departments' && <DepartmentManagement />}
                    {activeTab === 'fines' && <FineManager />}
                    {activeTab === 'history' && <TransactionHistory />}
                    {activeTab === 'feedback' && <FeedbackManager />}
                    {activeTab === 'rules' && <LibraryRules />}
                    {activeTab === 'settings' && <Settings />}
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;