import { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import API from '../api';
import AuthContext from '../context/AuthContext';

const Settings = () => {
    const { user } = useContext(AuthContext);

    // Password State
    const [passData, setPassData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

    // Config State (Admin Only)
    const [config, setConfig] = useState({ finePerDay: 5, issueDaysLimit: 15, maxBooksPerStudent: 3 });

    useEffect(() => {
        if (user?.role === 'admin') fetchConfig();
    }, [user]);

    const fetchConfig = async () => {
        try {
            const { data } = await API.get('/config');
            setConfig(data);
        } catch (error) { console.error("Config load failed"); }
    };

    const handlePassSubmit = async (e) => {
        e.preventDefault();
        if (passData.newPassword !== passData.confirmPassword) return toast.error("New passwords do not match!");
        if (passData.newPassword.length < 6) return toast.error("Password must be at least 6 characters.");

        try {
            await API.put('/users/profile', { oldPassword: passData.oldPassword, newPassword: passData.newPassword });
            toast.success("✅ Password Changed!");
            setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed");
        }
    };

    const handleConfigSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.put('/config', config);
            toast.success("✅ System Rules Updated!");
        } catch (error) { toast.error("Failed to update rules"); }
    };

    return (
        <div>
            <div className="flex-between mb-4">
                <div>
                    <h2>Settings</h2>
                    <p>Manage your account security and system preferences.</p>
                </div>
            </div>

            {/* Layout: Stacks on mobile, Side-by-side on desktop */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>

                {/* 1. PASSWORD CHANGE (Everyone) */}
                <div className="card" style={{ flex: '1 1 300px' }}>
                    <div className="card-header">
                        <h4>🔐 Change Password</h4>
                    </div>
                    <form onSubmit={handlePassSubmit}>
                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                className="form-control"
                                required
                                value={passData.oldPassword}
                                onChange={e => setPassData({ ...passData, oldPassword: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                className="form-control"
                                required
                                value={passData.newPassword}
                                onChange={e => setPassData({ ...passData, newPassword: e.target.value })}
                            />
                            <small style={{ color: 'var(--text-muted)' }}>Min 6 chars</small>
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                className="form-control"
                                required
                                value={passData.confirmPassword}
                                onChange={e => setPassData({ ...passData, confirmPassword: e.target.value })}
                            />
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>Update Password</button>
                    </form>
                </div>

                {/* 2. SYSTEM CONFIG (Admin Only) */}
                {user?.role === 'admin' && (
                    <div className="card" style={{ flex: '1 1 300px', borderLeft: '4px solid var(--danger)' }}>
                        <div className="card-header">
                            <h4>⚙️ Library System Rules</h4>
                        </div>
                        <form onSubmit={handleConfigSubmit}>
                            <div className="form-group">
                                <label>Fine Per Day (₹)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    required
                                    value={config.finePerDay}
                                    onChange={e => setConfig({ ...config, finePerDay: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Issue Duration Limit (Days)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    required
                                    value={config.issueDaysLimit}
                                    onChange={e => setConfig({ ...config, issueDaysLimit: e.target.value })}
                                />
                                <small style={{ color: 'var(--text-muted)' }}>Standard return period for books.</small>
                            </div>
                            <div className="form-group">
                                <label>Max Books Per Student</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    required
                                    value={config.maxBooksPerStudent}
                                    onChange={e => setConfig({ ...config, maxBooksPerStudent: e.target.value })}
                                />
                            </div>
                            <button className="btn btn-danger" style={{ width: '100%', marginTop: '10px' }}>Save System Rules</button>
                        </form>

                        <div style={{ marginTop: '20px', padding: '15px', background: 'var(--warning-bg)', borderRadius: 'var(--radius)', fontSize: '0.85rem', color: 'var(--warning)', border: '1px solid var(--warning)' }}>
                            <strong>Note:</strong> Changes to system rules apply immediately to <em>new</em> transactions. Existing issued books retain their original due dates.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;