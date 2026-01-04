import { useState, useEffect } from 'react';
import API from '../api';
import ConfirmModal from './ConfirmModal';
import { toast } from 'react-toastify';
import ReceiptDownload from './ReceiptDownload'; // ✅ Import

const FineManager = () => {
    const [fines, setFines] = useState([]);

    // Modal States
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', action: null, isDanger: false });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({ id: null, amount: '', reason: '' });

    useEffect(() => { fetchFines(); }, []);

    const fetchFines = async () => {
        try {
            const { data } = await API.get('/circulation/fines');
            setFines(data);
        } catch (error) { console.error("Error loading fines"); }
    };

    const handleCollect = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Collect Fine',
            message: 'Confirm cash payment? Receipt will be generated.',
            isDanger: false,
            action: async () => {
                try {
                    await API.put(`/circulation/fines/${id}/pay`);
                    toast.success("Payment Collected!");
                    fetchFines();
                } catch (error) { toast.error("Collection Failed"); }
                closeConfirm();
            }
        });
    };

    const openEditModal = (id, currentAmount) => {
        setEditData({ id, amount: currentAmount, reason: '' });
        setShowEditModal(true);
    };

    const submitEdit = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/circulation/fines/${editData.id}/edit`, { amount: editData.amount, reason: editData.reason });
            toast.success("Fine Updated");
            fetchFines();
            setShowEditModal(false);
        } catch (error) { toast.error("Update failed"); }
    };

    const closeConfirm = () => setConfirmModal({ ...confirmModal, isOpen: false });

    return (
        <div>
            <div className="flex-between mb-4">
                <div><h2>Manage Fines</h2><p>Outstanding dues and payment history.</p></div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Book Title</th>
                                <th>Due Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fines.map((t) => (
                                <tr key={t._id}>
                                    <td>
                                        <div style={{ fontWeight: '600' }}>{t.student?.name || 'Unknown'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.student?.registerNumber}</div>
                                    </td>
                                    <td>{t.book?.title}</td>
                                    <td>{new Date(t.dueDate).toLocaleDateString('en-GB')}</td>
                                    <td>
                                        <span style={{ color: t.isFinePaid ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                                            ₹{t.fine}
                                        </span>
                                    </td>
                                    <td><span className={`badge ${t.isFinePaid ? 'badge-success' : 'badge-danger'}`}>{t.isFinePaid ? 'Paid' : 'Pending'}</span></td>
                                    <td className="text-right">
                                        {!t.isFinePaid ? (
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button className="btn btn-success btn-icon" onClick={() => handleCollect(t._id)} title="Collect">💵</button>
                                                <button className="btn btn-secondary btn-icon" onClick={() => openEditModal(t._id, t.fine)} title="Edit">✏️</button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>Paid</span>
                                                {/* ✅ ADMIN RECEIPT DOWNLOAD */}
                                                <ReceiptDownload transaction={t} role="admin" />
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {fines.length === 0 && <tr><td colSpan="6" className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>No records found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <ConfirmModal isOpen={confirmModal.isOpen} onClose={closeConfirm} onConfirm={confirmModal.action} title={confirmModal.title} message={confirmModal.message} isDanger={confirmModal.isDanger} />

            {showEditModal && (
                <div className="modal-overlay">
                    <div className="card" style={{ width: '400px' }}>
                        <div className="card-header"><h3>Edit Fine</h3><button className="btn btn-secondary btn-icon" onClick={() => setShowEditModal(false)}>✕</button></div>
                        <form onSubmit={submitEdit}>
                            <div className="form-group"><label>New Amount (₹)</label><input type="number" className="form-control" value={editData.amount} onChange={e => setEditData({ ...editData, amount: e.target.value })} required /></div>
                            <div className="form-group"><label>Reason</label><input type="text" className="form-control" value={editData.reason} onChange={e => setEditData({ ...editData, reason: e.target.value })} required /></div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Update</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FineManager;