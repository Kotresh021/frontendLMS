import { useState, useEffect } from 'react';
import API from '../api';
import { toast } from 'react-toastify';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);

    // Delete States
    const [selectedIds, setSelectedIds] = useState([]);
    const [showDeleteTools, setShowDeleteTools] = useState(false);
    const [deleteType, setDeleteType] = useState('select');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => { fetchLogs(); }, []);

    const fetchLogs = async () => {
        try {
            const { data } = await API.get('/audit');
            setLogs(data);
        } catch (error) { console.error("Log error"); }
    };

    const handleDelete = async () => {
        if (deleteType === 'select' && selectedIds.length === 0) return toast.warning("No logs selected");
        if (deleteType === 'range' && (!dateRange.start || !dateRange.end)) return toast.warning("Select dates");

        if (!window.confirm("Are you sure? This action is irreversible.")) return;

        try {
            await API.post('/audit/delete', {
                type: deleteType,
                ids: selectedIds,
                startDate: dateRange.start,
                endDate: dateRange.end
            });
            toast.success("Logs deleted");
            fetchLogs();
            setSelectedIds([]);
            setShowDeleteTools(false);
        } catch (error) { toast.error("Delete failed"); }
    };

    const exportCSV = () => {
        const headers = ["Time", "Actor", "Action", "Details"];
        const rows = logs.map(l => [
            new Date(l.createdAt).toLocaleString('en-GB'),
            l.actorName,
            l.action,
            l.details.replace(/,/g, ' ')
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "system_audit_logs.csv");
        document.body.appendChild(link);
        link.click();
    };

    const toggleSelect = (id) => {
        selectedIds.includes(id) ? setSelectedIds(selectedIds.filter(i => i !== id)) : setSelectedIds([...selectedIds, id]);
    };

    const toggleSelectAll = () => {
        selectedIds.length === logs.length ? setSelectedIds([]) : setSelectedIds(logs.map(l => l._id));
    };

    return (
        <div>
            <div className="flex-between mb-4">
                <div>
                    <h2>System Audit Logs</h2>
                    <p>Track security events and user actions.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-primary" onClick={exportCSV}>⬇ Export CSV</button>
                    <button className={`btn ${showDeleteTools ? 'btn-secondary' : 'btn-danger'}`} onClick={() => setShowDeleteTools(!showDeleteTools)}>
                        {showDeleteTools ? 'Cancel' : '🗑️ Manage Logs'}
                    </button>
                </div>
            </div>

            {/* --- DELETE TOOLBAR --- */}
            {showDeleteTools && (
                <div className="card mb-4" style={{ background: 'var(--danger-bg)', borderColor: 'var(--danger)' }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select className="form-control" style={{ width: 'auto' }} value={deleteType} onChange={e => setDeleteType(e.target.value)}>
                            <option value="select">Select Manually</option>
                            <option value="lastMonth">Older than 1 Month</option>
                            <option value="lastYear">Older than 1 Year</option>
                            <option value="range">Specific Date Range</option>
                            <option value="all">Delete ALL Logs</option>
                        </select>

                        {deleteType === 'range' && (
                            <>
                                <input type="date" className="form-control" style={{ width: 'auto' }} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} />
                                <span style={{ color: 'var(--danger)' }}>to</span>
                                <input type="date" className="form-control" style={{ width: 'auto' }} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} />
                            </>
                        )}

                        <button className="btn btn-danger" onClick={handleDelete}>Confirm Delete</button>
                    </div>
                </div>
            )}

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                {showDeleteTools && deleteType === 'select' && (
                                    <th style={{ width: '40px' }}><input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.length === logs.length && logs.length > 0} /></th>
                                )}
                                <th>Time</th>
                                <th>Actor</th>
                                <th>Action</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log._id}>
                                    {showDeleteTools && deleteType === 'select' && (
                                        <td><input type="checkbox" checked={selectedIds.includes(log._id)} onChange={() => toggleSelect(log._id)} /></td>
                                    )}
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(log.createdAt).toLocaleString('en-GB')}</td>
                                    <td style={{ fontWeight: '600' }}>{log.actorName}</td>
                                    <td>
                                        <span className={`badge ${log.action === 'LOGIN' ? 'badge-success' : 'badge-warning'}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{log.details}</td>
                                </tr>
                            ))}
                            {logs.length === 0 && <tr><td colSpan="5" className="text-center" style={{ padding: '3rem', color: 'var(--text-muted)' }}>No logs found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;