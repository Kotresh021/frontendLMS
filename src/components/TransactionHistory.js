import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import API from '../api';

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => { fetchHistory(); }, []);

    const fetchHistory = async () => {
        try {
            const { data } = await API.get('/circulation/history');
            setTransactions(data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load history');
            setLoading(false);
        }
    };

    const filteredData = useMemo(() => {
        return transactions.filter(t => {
            const search = searchTerm.toLowerCase();
            const matchSearch =
                (t.student?.name || '').toLowerCase().includes(search) ||
                (t.student?.registerNumber || '').toLowerCase().includes(search) ||
                (t.book?.title || '').toLowerCase().includes(search);

            let matchStatus = true;
            if (filterStatus !== 'All') {
                if (filterStatus === 'Late') matchStatus = t.status === 'Issued' && new Date() > new Date(t.dueDate);
                else matchStatus = t.status === filterStatus;
            }

            let matchDate = true;
            if (startDate && endDate) {
                const txDate = new Date(t.issueDate).setHours(0, 0, 0, 0);
                const start = new Date(startDate).setHours(0, 0, 0, 0);
                const end = new Date(endDate).setHours(0, 0, 0, 0);
                matchDate = txDate >= start && txDate <= end;
            }
            return matchSearch && matchStatus && matchDate;
        });
    }, [transactions, searchTerm, filterStatus, startDate, endDate]);

    const exportCSV = () => {
        const headers = ["Issue Date", "Return Date", "Student", "Reg No", "Book", "Status", "Fine"];
        const rows = filteredData.map(t => [
            new Date(t.issueDate).toLocaleDateString('en-GB'),
            t.returnDate ? new Date(t.returnDate).toLocaleDateString('en-GB') : '-',
            t.student?.name || 'Unknown',
            t.student?.registerNumber || 'Unknown',
            t.book?.title || 'Unknown',
            t.status,
            t.fine || 0
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "transaction_history.csv");
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div>
            <div className="flex-between mb-4">
                <div>
                    <h2>Transaction History</h2>
                    <p>Comprehensive logs of all library circulation.</p>
                </div>
                <button className="btn btn-primary" onClick={exportCSV}>⬇ CSV Export</button>
            </div>

            <div className="card mb-4">
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '15px' }}>
                    <div>
                        <label>Search</label>
                        <input className="form-control" placeholder="Student, Book..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <div>
                        <label>Status</label>
                        <select className="form-control" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                            <option value="All">All</option>
                            <option value="Issued">Issued</option>
                            <option value="Returned">Returned</option>
                            <option value="Late">Late</option>
                        </select>
                    </div>
                    <div>
                        <label>From</label>
                        <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <div>
                        <label>To</label>
                        <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container" style={{ border: 'none' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Student</th>
                                <th>Book</th>
                                <th>Due / Return</th>
                                <th>Status</th>
                                <th>Fine</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map(t => (
                                <tr key={t._id}>
                                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(t.issueDate).toLocaleDateString('en-GB')}</td>
                                    <td>
                                        <div style={{ fontWeight: '600' }}>{t.student?.name}</div>
                                        <div style={{ fontSize: '0.8rem' }}>{t.student?.registerNumber}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '500' }}>{t.book?.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.copyId}</div>
                                    </td>
                                    <td>
                                        {t.status === 'Returned' ? (
                                            <span style={{ color: 'var(--text-muted)' }}>Ret: {new Date(t.returnDate).toLocaleDateString('en-GB')}</span>
                                        ) : (
                                            <span style={{ color: new Date() > new Date(t.dueDate) ? 'var(--danger)' : 'var(--text-main)', fontWeight: 'bold' }}>
                                                Due: {new Date(t.dueDate).toLocaleDateString('en-GB')}
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`badge ${t.status === 'Returned' ? 'badge-success' : 'badge-warning'}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td style={{ color: t.fine > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 'bold' }}>
                                        {t.fine > 0 ? `₹${t.fine}` : '-'}
                                    </td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && <tr><td colSpan="6" className="text-center p-5">No records found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TransactionHistory;