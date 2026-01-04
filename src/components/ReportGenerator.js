import { useState, useEffect } from 'react';
import API from '../api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';
import ReceiptDownload from './ReceiptDownload';

const ReportGenerator = () => {
    // --- STATE MANAGEMENT ---
    const [transactions, setTransactions] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [deptList, setDeptList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchReceipt, setSearchReceipt] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [department, setDepartment] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    // Delete Mode
    const [showDeleteMode, setShowDeleteMode] = useState(false);
    const [deleteType, setDeleteType] = useState('range');
    const [selectedIds, setSelectedIds] = useState([]);
    const [deleteRange, setDeleteRange] = useState({ start: '', end: '' });

    // --- INITIAL DATA LOAD ---
    useEffect(() => {
        fetchHistory();
        fetchDepartments();
    }, []);

    // --- AUTO-FILTER EFFECT ---
    // This runs automatically whenever any filter changes
    useEffect(() => {
        applyFilters();
    }, [searchReceipt, startDate, endDate, department, statusFilter, transactions]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/circulation/history');
            setTransactions(data);
            setFilteredData(data);
        } catch (error) {
            console.error("Error loading reports:", error);
            toast.error("Failed to load history.");
        }
        setLoading(false);
    };

    const fetchDepartments = async () => {
        try {
            const { data } = await API.get('/departments');
            setDeptList(data);
        } catch (error) { console.error("Error loading departments"); }
    };

    // --- FILTER LOGIC ---
    const applyFilters = () => {
        let result = [...transactions];

        // 1. Receipt Number Verification (Instant Search)
        if (searchReceipt.trim()) {
            const term = searchReceipt.trim().toLowerCase();
            result = result.filter(t => t._id.toLowerCase().includes(term));
        }

        // 2. Date Range
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59);

            result = result.filter(t => {
                const txDate = new Date(t.issueDate);
                return txDate >= start && txDate <= end;
            });
        }

        // 3. Department
        if (department !== 'All') {
            result = result.filter(t => t.student?.department === department);
        }

        // 4. Status
        if (statusFilter !== 'All') {
            result = result.filter(t => t.status === statusFilter);
        }

        setFilteredData(result);
    };

    const resetFilters = () => {
        setSearchReceipt('');
        setStartDate('');
        setEndDate('');
        setDepartment('All');
        setStatusFilter('All');
        // No need to call setFilteredData here, the useEffect will trigger and reset it automatically
    };

    // --- PDF EXPORT ---
    const exportSummaryPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Library Circulation Report", 14, 20);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, 14, 28);
        doc.text(`Records Found: ${filteredData.length}`, 14, 33);

        const tableRows = filteredData.map(t => [
            new Date(t.issueDate).toLocaleDateString('en-GB'),
            t.student?.name || 'Unknown',
            t.student?.registerNumber || 'N/A',
            t.book?.title || 'Unknown',
            t.status,
            t.returnDate ? new Date(t.returnDate).toLocaleDateString('en-GB') : '-'
        ]);

        autoTable(doc, {
            head: [["Issued Date", "Student", "Reg No", "Book Title", "Status", "Returned"]],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [67, 97, 238] },
            styles: { fontSize: 8 }
        });

        doc.save(`Library_Report_Summary.pdf`);
    };

    // --- DELETE LOGIC ---
    const handleDelete = async () => {
        if (deleteType === 'select' && selectedIds.length === 0) return toast.warning("No records selected!");
        if (deleteType === 'range' && (!deleteRange.start || !deleteRange.end)) return toast.warning("Select valid date range!");

        if (!window.confirm("⚠️ WARNING: Permanently delete selected records?")) return;

        try {
            await API.post('/circulation/history/delete', {
                type: deleteType,
                ids: selectedIds,
                startDate: deleteRange.start,
                endDate: deleteRange.end
            });
            toast.success("Records Deleted Successfully");
            setShowDeleteMode(false);
            setSelectedIds([]);
            fetchHistory();
        } catch (error) { toast.error("Delete failed."); }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredData.length) setSelectedIds([]);
        else setSelectedIds(filteredData.map(t => t._id));
    };

    return (
        <div>
            {/* HEADER */}
            <div className="flex-between mb-4">
                <div>
                    <h2>History & Reports</h2>
                    <p>View transaction history, verify receipts, and export lists.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-primary" onClick={exportSummaryPDF}>⬇ Export List PDF</button>
                    <button
                        className={`btn ${showDeleteMode ? 'btn-secondary' : 'btn-danger'}`}
                        onClick={() => setShowDeleteMode(!showDeleteMode)}
                    >
                        {showDeleteMode ? 'Cancel Delete' : '🗑️ Manage Records'}
                    </button>
                </div>
            </div>

            {/* DELETE TOOLBAR */}
            {showDeleteMode && (
                <div className="card mb-4" style={{ background: 'var(--danger-bg)', borderColor: 'var(--danger)' }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <strong style={{ color: 'var(--danger)' }}>Delete Mode:</strong>
                        <select className="form-control" style={{ width: 'auto' }} value={deleteType} onChange={e => setDeleteType(e.target.value)}>
                            <option value="range">By Date Range</option>
                            <option value="select">Select Manually</option>
                        </select>
                        {deleteType === 'range' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input type="date" className="form-control" onChange={e => setDeleteRange({ ...deleteRange, start: e.target.value })} />
                                <span>to</span>
                                <input type="date" className="form-control" onChange={e => setDeleteRange({ ...deleteRange, end: e.target.value })} />
                            </div>
                        )}
                        <button className="btn btn-danger" onClick={handleDelete}>Confirm Delete</button>
                    </div>
                </div>
            )}

            {/* AUTO-FILTER BAR */}
            {!showDeleteMode && (
                <div className="card mb-4">
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>

                        {/* Receipt Search */}
                        <div style={{ flex: '1 1 200px' }}>
                            <label style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Verify Receipt #</label>
                            <input
                                className="form-control"
                                placeholder="Type ID (e.g. A1B2...)"
                                value={searchReceipt}
                                onChange={e => setSearchReceipt(e.target.value)}
                                style={{ borderColor: 'var(--primary)', boxShadow: '0 0 0 1px var(--primary-light)' }}
                            />
                        </div>

                        <div>
                            <label>From Date</label>
                            <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div>
                            <label>To Date</label>
                            <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                        <div>
                            <label>Department</label>
                            <select className="form-control" value={department} onChange={e => setDepartment(e.target.value)}>
                                <option value="All">All Departments</option>
                                {deptList.map(d => <option key={d._id} value={d.code}>{d.code}</option>)}
                            </select>
                        </div>
                        <div>
                            <label>Status</label>
                            <select className="form-control" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                <option value="All">All Status</option>
                                <option value="Issued">Issued</option>
                                <option value="Returned">Returned</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            {/* Filter Button Removed - Now Automatic */}
                            <button className="btn btn-secondary" onClick={resetFilters}>Reset</button>
                        </div>
                    </div>
                </div>
            )}

            {/* DATA TABLE */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                {showDeleteMode && deleteType === 'select' && (
                                    <th style={{ width: '40px', textAlign: 'center' }}>
                                        <input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.length === filteredData.length && filteredData.length > 0} />
                                    </th>
                                )}
                                <th>Receipt / ID</th>
                                <th>Issued Date</th>
                                <th>Student</th>
                                <th>Reg No</th>
                                <th>Book Details</th>
                                <th>Status</th>
                                <th className="text-right">Receipt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((t) => (
                                <tr key={t._id}>
                                    {showDeleteMode && deleteType === 'select' && (
                                        <td style={{ textAlign: 'center' }}>
                                            <input type="checkbox" checked={selectedIds.includes(t._id)} onChange={() => setSelectedIds(prev => prev.includes(t._id) ? prev.filter(id => id !== t._id) : [...prev, t._id])} />
                                        </td>
                                    )}

                                    <td style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--primary)' }}>
                                        {t._id.slice(-8).toUpperCase()}
                                    </td>

                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        {new Date(t.issueDate).toLocaleDateString('en-GB')}
                                    </td>
                                    <td><div style={{ fontWeight: '600' }}>{t.student?.name || 'Unknown'}</div></td>
                                    <td>{t.student?.registerNumber || '-'}</td>
                                    <td>
                                        <div style={{ fontWeight: '500' }}>{t.book?.title || 'Deleted Book'}</div>
                                    </td>
                                    <td><span className={`badge ${t.status === 'Issued' ? 'badge-warning' : 'badge-success'}`}>{t.status}</span></td>

                                    <td className="text-right">
                                        {(t.status === 'Returned' || t.isFinePaid) ? (
                                            <ReceiptDownload transaction={t} role="admin" />
                                        ) : (
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredData.length === 0 && (
                                <tr><td colSpan="8" className="text-center" style={{ padding: '3rem', color: 'var(--text-muted)' }}>No records found matching filters.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportGenerator;