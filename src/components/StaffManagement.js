import { useState, useEffect } from 'react';
import API from '../api';
import ConfirmModal from './ConfirmModal';
import { toast } from 'react-toastify';

const StaffManagement = () => {
    const [staff, setStaff] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false, title: '', message: '', action: null, isDanger: false
    });

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const { data } = await API.get('/users/staff-list');
            setStaff(data);
        } catch (error) { console.error("Load failed"); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/users/create-staff', formData);
            toast.success('Staff Member Added!');
            setFormData({ name: '', email: '', password: '' });
            fetchStaff();
        } catch (error) { toast.error('Failed to add staff'); }
        setLoading(false);
    };

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Remove Staff',
            message: 'Are you sure you want to remove this staff member? They will lose access immediately.',
            isDanger: true,
            action: async () => {
                try {
                    await API.delete(`/users/${id}`);
                    setStaff(staff.filter(s => s._id !== id));
                    toast.success("Staff Removed");
                } catch (error) { toast.error("Failed"); }
                closeConfirm();
            }
        });
    };

    const closeConfirm = () => setConfirmModal({ ...confirmModal, isOpen: false });

    return (
        <div>
            <div className="flex-between mb-4">
                <div>
                    <h2>Staff Directory</h2>
                    <p>Manage library staff accounts and access.</p>
                </div>
            </div>

            {/* Responsive Layout: Stacks on mobile, Side-by-side on desktop */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>

                {/* 1. CREATE FORM */}
                <div className="card" style={{ flex: '1 1 300px' }}>
                    <div className="card-header">
                        <h4>Add New Staff</h4>
                    </div>
                    <form onSubmit={handleCreate}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                className="form-control"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. John Doe"
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                className="form-control"
                                required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="staff@college.edu"
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                className="form-control"
                                required
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                    </form>
                </div>

                {/* 2. STAFF LIST */}
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
                                {staff.map(s => (
                                    <tr key={s._id}>
                                        <td>
                                            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{s.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {s._id.slice(-4)}</div>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)' }}>{s.email}</td>
                                        <td className="text-right">
                                            <button
                                                className="btn btn-danger btn-icon"
                                                onClick={() => handleDelete(s._id)}
                                                title="Remove Staff"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {staff.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>
                                            No staff members found.
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

export default StaffManagement;