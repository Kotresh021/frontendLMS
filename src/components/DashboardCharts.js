import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { useTheme } from '../context/ThemeContext'; // Import Theme Context

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const DashboardCharts = ({ stats }) => {
    const { theme } = useTheme(); // Get current theme

    if (!stats) return null;

    const hasData = stats.deptActivity?.labels?.length > 0;

    // Dynamic Colors based on Theme
    const textColor = theme === 'dark' ? '#cbd5e1' : '#64748b'; // Slate-300 vs Slate-500
    const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0'; // Slate-700 vs Slate-200

    // Pie Chart Data
    const pieData = {
        labels: ['Total Books', 'Active Students', 'Issued Books'],
        datasets: [{
            data: [stats.totalBooks || 0, stats.totalStudents || 0, stats.activeIssues || 0],
            backgroundColor: ['#4361ee', '#f59e0b', '#10b981'],
            borderColor: theme === 'dark' ? '#1e293b' : '#ffffff',
            borderWidth: 2,
        }],
    };

    // Bar Chart Data
    const barData = {
        labels: hasData ? stats.deptActivity.labels : ['No Activity'],
        datasets: [{
            label: 'Books Issued',
            data: hasData ? stats.deptActivity.data : [0],
            backgroundColor: hasData ? '#8b5cf6' : '#e5e7eb',
            borderRadius: 4,
        }],
    };

    // Chart Options with Theme Support
    const barOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: 'Usage by Department',
                color: textColor
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: gridColor },
                ticks: { color: textColor, stepSize: 1 }
            },
            x: {
                grid: { display: false },
                ticks: { color: textColor }
            }
        }
    };

    const pieOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: textColor }
            }
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* Pie Chart Container */}
            <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Distribution</h4>
                <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <Pie data={pieData} options={pieOptions} />
                </div>
            </div>

            {/* Bar Chart Container */}
            <div style={{ height: '300px' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)', textAlign: 'center' }}>Activity</h4>
                <div style={{ height: '260px' }}>
                    {hasData ? (
                        <Bar data={barData} options={barOptions} />
                    ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            No data available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardCharts;