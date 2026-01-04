import { useState, useEffect } from 'react';
import API from '../api';
import ConfirmModal from './ConfirmModal';
import { toast } from 'react-toastify';

const DepartmentManagement = () => {
    const [depts, setDepts] = useState([]);
    const [newDept, setNewDept] = useState({ name: '', code: '' });
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false, title: '', message: '', action: null, isDanger: false
    });

    useEffect(() => {
        fetchDepts();
    }, []);

    const fetchDepts = async () => {
        try {
            const { data } = await API.get('/departments');
            setDepts(data);
        } catch (err) { console.error('Failed to load departments'); }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await API.post('/departments', newDept);
            setNewDept({ name: '', code: '' });
            fetchDepts();
            toast.success("Department Added");
        } catch (err) { toast.error('Error adding department'); }
    };

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Department',
            message: 'Are you sure? This might affect students assigned to this department.',
            isDanger: true,
            action: async () => {
                try {
                    await API.delete(`/departments/${id}`);
                    fetchDepts();
                    toast.success("Department Deleted");
                } catch (err) { toast.error('Error deleting department'); }
                closeConfirm();
            }
        });
    };

    const closeConfirm = () => setConfirmModal({ ...confirmModal, isOpen: false });

    return (
        <div>
            {/* Header */}
            <div className="flex-between mb-4">
                <div>
                    <h2>Departments</h2>
                    <p>Manage college departments and codes.</p>
                </div>
            </div>

            {/* Inline Add Form */}
            <div className="card mb-4">
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: '2 1 200px' }}>
                        <label style={{ marginBottom: '5px', display: 'block', fontWeight: '500' }}>Department Name</label>
                        <input
                            className="form-control"
                            placeholder="e.g. Computer Science"
                            value={newDept.name}
                            onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                            required
                        />
                    </div>
                    <div style={{ flex: '1 1 100px' }}>
                        <label style={{ marginBottom: '5px', display: 'block', fontWeight: '500' }}>Code</label>
                        <input
                            className="form-control"
                            placeholder="e.g. CS"
                            value={newDept.code}
                            onChange={e => setNewDept({ ...newDept, code: e.target.value })}
                            required
                        />
                    </div>
                    <div style={{ flex: '0 0 auto' }}>
                        <button className="btn btn-primary" type="submit" style={{ height: '42px' }}>+ Add Dept</button>
                    </div>
                </form>
            </div>

            {/* Department List */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Department Name</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {depts.map(d => (
                                <tr key={d._id}>
                                    <td style={{ width: '100px' }}>
                                        <span className="badge badge-neutral" style={{ fontSize: '0.85rem' }}>{d.code}</span>
                                    </td>
                                    <td style={{ fontWeight: '500', color: 'var(--text-main)' }}>{d.name}</td>
                                    <td className="text-right">
                                        <button className="btn btn-danger btn-icon" onClick={() => handleDelete(d._id)} title="Delete Department">
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {depts.length === 0 && (
                                <tr><td colSpan="3" className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>No departments found.</td></tr>
                            )}
                        </tbody>
                    </table>
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

export default DepartmentManagement;