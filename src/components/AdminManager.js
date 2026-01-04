import { useState, useEffect } from 'react';
import API from '../api';
import { toast } from 'react-toastify';
import ConfirmModal from './ConfirmModal';

const AdminManager = () => {
    const [admins, setAdmins] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false, title: '', message: '', action: null, isDanger: false
    });

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const { data } = await API.get('/users/admins');
            setAdmins(data);
        } catch (error) { console.error('Error fetching admins'); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/users/create-admin', formData);
            toast.success('New Admin Added!');
            setFormData({ name: '', email: '', password: '' });
            fetchAdmins();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create admin');
        }
        setLoading(false);
    };

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Admin',
            message: 'Are you sure? This user will lose all administrative privileges.',
            isDanger: true,
            action: async () => {
                try {
                    await API.delete(`/users/${id}`);
                    toast.success('Admin Removed');
                    fetchAdmins();
                } catch (error) { toast.error('Delete Failed'); }
                closeConfirm();
            }
        });
    };

    const closeConfirm = () => setConfirmModal({ ...confirmModal, isOpen: false });

    return (
        <div>
            <div className="flex-between mb-4">
                <div>
                    <h2>Manage Admins</h2>
                    <p>Create and manage system administrators.</p>
                </div>
            </div>

            {/* Responsive Layout */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>

                {/* 1. CREATE FORM */}
                <div className="card" style={{ flex: '1 1 300px' }}>
                    <div className="card-header">
                        <h4>Add New Admin</h4>
                    </div>
                    <form onSubmit={handleCreate}>
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                className="form-control"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="Admin Name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                className="form-control"
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                                placeholder="admin@system.com"
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                className="form-control"
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                required
                                placeholder="••••••••"
                            />
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Creating...' : 'Create Admin'}
                        </button>
                    </form>
                </div>

                {/* 2. ADMIN LIST */}
                <div className="card" style={{ flex: '2 1 400px', padding: 0, overflow: 'hidden' }}>
                    <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                        <table style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th className="text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins.map(admin => (
                                    <tr key={admin._id}>
                                        <td>
                                            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{admin.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Super User</div>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)' }}>{admin.email}</td>
                                        <td className="text-right">
                                            <button
                                                className="btn btn-danger btn-icon"
                                                onClick={() => handleDelete(admin._id)}
                                                title="Remove Admin"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {admins.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>
                                            No admins found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirm}
                onConfirm={confirmModal.action}
                title={confirmModal.title}
                message={confirmModal.message}
                isDanger={confirmModal.isDanger}
            />
        </div>
    );
};

export default AdminManager;