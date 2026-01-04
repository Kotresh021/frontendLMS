import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../api';
import ConfirmModal from './ConfirmModal';

const StudentManagement = () => {
    // --- Data States ---
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Filter & Search State ---
    const [searchTerm, setSearchTerm] = useState('');

    // --- Selection State ---
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkAction, setBulkAction] = useState('');

    // --- Modal States ---
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false, title: '', message: '', action: null, isDanger: false
    });

    // --- Form Data ---
    const [formData, setFormData] = useState({
        name: '', registerNumber: '', email: '', phone: '',
        department: '', semester: '1', dob: ''
    });

    // --- File Upload ---
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    // --- API Calls ---
    const fetchStudents = async () => {
        try {
            const { data } = await API.get('/users/students');
            setStudents(data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to load students");
            setLoading(false);
        }
    };

    // --- Handlers ---
    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await API.put(`/users/student/${currentId}`, formData);
                toast.success("Student Updated! 🎓");
            } else {
                await API.post('/users/student', formData);
                toast.success("Student Created! 🆕");
            }
            setShowModal(false);
            fetchStudents();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    // ✅ NEW: Reset Password Handler
    const handleResetPassword = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Reset Password',
            message: 'Are you sure? This will reset the password to the default (Date of Birth: DDMMYYYY).',
            isDanger: true, // Yellow/Orange warning usually, but allows careful action
            action: async () => {
                try {
                    await API.put(`/users/student/${id}/reset-password`);
                    toast.success("Password Reset Successfully! 🔑");
                } catch (e) {
                    toast.error("Reset Failed");
                }
                closeConfirm();
            }
        });
    };

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true, title: 'Delete Student', message: 'Permanently remove this student? This cannot be undone.', isDanger: true,
            action: async () => {
                try {
                    await API.delete(`/users/${id}`);
                    setStudents(students.filter(s => s._id !== id));
                    toast.success("Student Deleted");
                } catch (e) { toast.error("Delete Failed"); }
                closeConfirm();
            }
        });
    };

    const handleBulkExecute = () => {
        if (selectedIds.length === 0) return toast.warning("Select students first");
        if (!bulkAction) return toast.warning("Select an action");

        let message = `Apply '${bulkAction}' to ${selectedIds.length} students?`;
        let isDanger = false;

        if (bulkAction === 'delete') {
            message = `🔥 DELETE ${selectedIds.length} students? This is irreversible!`;
            isDanger = true;
        } else if (bulkAction === '+1') {
            message = `🚀 Promote ${selectedIds.length} students to next semester?`;
        }

        setConfirmModal({
            isOpen: true, title: 'Bulk Action', message, isDanger,
            action: async () => {
                try {
                    const { data } = await API.put('/users/bulk-update', { studentIds: selectedIds, action: bulkAction });
                    toast.success(data.message);
                    fetchStudents();
                    setSelectedIds([]);
                    setBulkAction('');
                } catch (e) { toast.error("Bulk action failed"); }
                closeConfirm();
            }
        });
    };

    const handleFileUpload = async () => {
        if (!file) return toast.warning("Select CSV file first");
        const data = new FormData();
        data.append('file', file);
        try {
            setLoading(true);
            const res = await API.post('/users/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success(`Imported: ${res.data.success}, Errors: ${res.data.errors.length}`);
            setFile(null);
            fetchStudents();
            setLoading(false);
        } catch (e) {
            toast.error("Upload Failed");
            setLoading(false);
        }
    };

    // --- Helpers ---
    const closeConfirm = () => setConfirmModal({ ...confirmModal, isOpen: false });

    const openAddModal = () => {
        setIsEditMode(false);
        setFormData({ name: '', registerNumber: '', email: '', phone: '', department: '', semester: '1', dob: '' });
        setShowModal(true);
    };

    const openEditModal = (s) => {
        setIsEditMode(true);
        setCurrentId(s._id);
        let formattedDob = '';
        if (s.dob) {
            const date = new Date(s.dob);
            formattedDob = date.toISOString().split('T')[0];
        }
        setFormData({
            name: s.name, registerNumber: s.registerNumber, email: s.email,
            phone: s.phone || '', department: s.department || '',
            semester: s.semester || '1', dob: formattedDob
        });
        setShowModal(true);
    };

    // --- Search Logic ---
    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.registerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.department && s.department.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedIds(filtered.map(s => s._id));
        else setSelectedIds([]);
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
        else setSelectedIds([...selectedIds, id]);
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Students...</div>;

    return (
        <div>
            {/* Header */}
            <div className="flex-between mb-4">
                <div>
                    <h2>Student Directory</h2>
                    <p>Manage student records, semester promotions, and access.</p>
                </div>
                <button className="btn btn-primary" onClick={openAddModal}>
                    <span style={{ marginRight: '5px' }}>+</span> Add Student
                </button>
            </div>

            {/* Action Bar */}
            <div className="card mb-4">
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>

                    {/* Search */}
                    <div style={{ flex: '1 1 300px' }}>
                        <input
                            className="form-control"
                            placeholder="🔍 Search Name, RegNo, or Department..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Bulk Actions */}
                        {selectedIds.length > 0 && (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--primary-light)', padding: '6px 12px', borderRadius: 'var(--radius)' }}>
                                <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--primary)' }}>{selectedIds.length} Selected</span>
                                <select
                                    className="form-control"
                                    style={{ width: 'auto', padding: '6px', fontSize: '13px', height: 'auto', border: '1px solid var(--primary)' }}
                                    value={bulkAction}
                                    onChange={(e) => setBulkAction(e.target.value)}
                                >
                                    <option value="">-- Action --</option>
                                    <option value="+1">🚀 Promote (+1 Sem)</option>
                                    <option value="-1">🔻 Demote (-1 Sem)</option>
                                    <option value="activate">✅ Activate</option>
                                    <option value="deactivate">🚫 Block</option>
                                    <option value="delete">🗑️ Delete</option>
                                </select>
                                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={handleBulkExecute}>Apply</button>
                            </div>
                        )}

                        {/* CSV Upload */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} className="form-control" style={{ width: '200px', padding: '5px' }} />
                            <button className="btn btn-secondary" onClick={handleFileUpload}>Import CSV</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '50px', textAlign: 'center' }}>
                                    <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length > 0 && selectedIds.length === filtered.length} />
                                </th>
                                <th>Student Name</th>
                                <th>Details</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(s => (
                                <tr key={s._id} style={{ backgroundColor: selectedIds.includes(s._id) ? 'var(--primary-light)' : 'transparent' }}>
                                    <td style={{ textAlign: 'center' }}>
                                        <input type="checkbox" checked={selectedIds.includes(s._id)} onChange={() => handleSelectOne(s._id)} />
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{s.name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.registerNumber}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '13px' }}>
                                            <span className="badge badge-neutral" style={{ marginRight: '5px' }}>{s.department}</span>
                                            Sem {s.semester}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.email}</div>
                                    </td>
                                    <td>
                                        <span className={`badge ${s.isActive ? 'badge-success' : 'badge-danger'}`}>
                                            {s.isActive ? 'Active' : 'Blocked'}
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            {/* ✅ Reset Password Button */}
                                            <button
                                                className="btn btn-warning btn-icon"
                                                onClick={() => handleResetPassword(s._id)}
                                                title="Reset Password to Default"
                                                style={{ backgroundColor: '#f59e0b', color: 'white', borderColor: '#f59e0b' }}
                                            >
                                                🔑
                                            </button>
                                            <button className="btn btn-secondary btn-icon" onClick={() => openEditModal(s)} title="Edit">✏️</button>
                                            <button className="btn btn-danger btn-icon" onClick={() => handleDelete(s._id)} title="Delete">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && <tr><td colSpan="5" className="text-center" style={{ padding: '30px', color: 'var(--text-muted)' }}>No students found matching your search.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirm}
                onConfirm={confirmModal.action}
                title={confirmModal.title}
                message={confirmModal.message}
                isDanger={confirmModal.isDanger}
            />

            {/* Add/Edit Student Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 1050
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '600px', margin: '20px', boxShadow: 'var(--shadow-lg)' }}>
                        <div className="card-header" style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                            <h3>{isEditMode ? 'Edit Student' : 'Add New Student'}</h3>
                            <button className="btn btn-secondary btn-icon" onClick={() => setShowModal(false)} style={{ border: 'none' }}>✕</button>
                        </div>

                        <form onSubmit={handleCreateOrUpdate}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label>Register Number</label>
                                    <input className="form-control" required value={formData.registerNumber} onChange={e => setFormData({ ...formData, registerNumber: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input className="form-control" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label>Department</label>
                                    <input className="form-control" required value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} placeholder="e.g. CS" />
                                </div>
                                <div className="form-group">
                                    <label>Semester</label>
                                    <input className="form-control" required type="number" min="1" max="8" value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input className="form-control" required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input className="form-control" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Date of Birth (Default Password)</label>
                                    <input className="form-control" type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px', paddingTop: '15px', borderTop: '1px solid var(--border)' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Student</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentManagement;