import { useState, useEffect, useContext } from 'react';
import API from '../api';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';

const FeedbackManager = () => {
    const { user } = useContext(AuthContext);
    const [feedbacks, setFeedbacks] = useState([]);
    const [message, setMessage] = useState('');
    const [replyText, setReplyText] = useState({});
    const [showDelete, setShowDelete] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        if (user.role !== 'student') fetchFeedbacks();
    }, [user.role]);

    const fetchFeedbacks = async () => {
        try {
            const { data } = await API.get('/feedback');
            setFeedbacks(data);
        } catch (error) { console.error("Error loading requests"); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        try {
            await API.post('/feedback', { message });
            toast.success("Request Sent!");
            setMessage('');
        } catch (error) { toast.error("Failed to send"); }
    };

    const handleReply = async (id) => {
        if (!replyText[id]) return;
        try {
            await API.put(`/feedback/${id}/reply`, { reply: replyText[id] });
            toast.success("Reply sent!");
            fetchFeedbacks();
        } catch (error) { toast.error("Reply failed"); }
    };

    const handleDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm("Delete selected items?")) return;
        try {
            await API.post('/feedback/delete', { type: 'select', ids: selectedIds });
            toast.success("Deleted");
            fetchFeedbacks(); setSelectedIds([]); setShowDelete(false);
        } catch (e) { toast.error("Error"); }
    };

    const toggleSelect = (id) => selectedIds.includes(id) ? setSelectedIds(selectedIds.filter(i => i !== id)) : setSelectedIds([...selectedIds, id]);

    return (
        <div>
            <div className="flex-between mb-4">
                <div>
                    <h2>Requests & Feedback</h2>
                    <p>Communication channel between students and staff.</p>
                </div>
                {user.role === 'admin' && (
                    <button className={`btn ${showDelete ? 'btn-secondary' : 'btn-danger'}`} onClick={() => setShowDelete(!showDelete)}>
                        {showDelete ? 'Cancel' : '🗑️ Manage'}
                    </button>
                )}
            </div>

            {/* Student View */}
            {user.role === 'student' && (
                <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Submit a Request</h3>
                    <p style={{ marginBottom: '2rem' }}>Request a book or report an issue.</p>
                    <form onSubmit={handleSubmit}>
                        <textarea className="form-control" rows="5" placeholder="Type your message..." value={message} onChange={e => setMessage(e.target.value)} required />
                        <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>🚀 Send Request</button>
                    </form>
                </div>
            )}

            {/* Admin View */}
            {user.role !== 'student' && (
                <>
                    {showDelete && (
                        <div className="card mb-4" style={{ background: 'var(--danger-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{selectedIds.length} Selected</span>
                            <button className="btn btn-danger" onClick={handleDelete}>Delete Selected</button>
                        </div>
                    )}

                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div className="table-container" style={{ border: 'none' }}>
                            <table>
                                <thead>
                                    <tr>
                                        {showDelete && <th style={{ width: '40px' }}>Select</th>}
                                        <th>Student</th>
                                        <th>Message</th>
                                        <th>Reply</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {feedbacks.map(f => (
                                        <tr key={f._id}>
                                            {showDelete && (
                                                <td><input type="checkbox" checked={selectedIds.includes(f._id)} onChange={() => toggleSelect(f._id)} /></td>
                                            )}
                                            <td>
                                                <div style={{ fontWeight: '600' }}>{f.user?.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{f.user?.registerNumber}</div>
                                            </td>
                                            <td style={{ maxWidth: '400px' }}>
                                                <div style={{ background: 'var(--bg-body)', padding: '10px', borderRadius: '8px', marginBottom: '5px' }}>
                                                    "{f.message}"
                                                </div>
                                                <small style={{ color: 'var(--text-muted)' }}>{new Date(f.createdAt).toLocaleDateString('en-GB')}</small>
                                            </td>
                                            <td>
                                                {f.reply ? (
                                                    <div className="badge badge-success" style={{ whiteSpace: 'normal', textAlign: 'left', padding: '10px' }}>
                                                        Replied: {f.reply}
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', gap: '5px' }}>
                                                        <input className="form-control" placeholder="Reply..." value={replyText[f._id] || ''} onChange={e => setReplyText({ ...replyText, [f._id]: e.target.value })} />
                                                        <button className="btn btn-success" onClick={() => handleReply(f._id)}>Send</button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {feedbacks.length === 0 && <tr><td colSpan="4" className="text-center" style={{ padding: '2rem' }}>No requests.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default FeedbackManager;