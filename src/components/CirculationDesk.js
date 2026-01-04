import { useState, useEffect, useRef } from 'react'; // Added useRef
import API from '../api';
import { toast } from 'react-toastify';
import ConfirmModal from './ConfirmModal';
import { FaBarcode } from 'react-icons/fa'; // Make sure to npm install react-icons if not present

const CirculationDesk = () => {
    const [activeTab, setActiveTab] = useState('issue');
    const [loading, setLoading] = useState(false);

    // Data Lists
    const [allStudents, setAllStudents] = useState([]);
    const [allBooks, setAllBooks] = useState([]);
    const [activeIssues, setActiveIssues] = useState([]);

    // Selection State
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedBook, setSelectedBook] = useState(null);
    const [manualCopyId, setManualCopyId] = useState('');

    // Search Inputs
    const [studentSearch, setStudentSearch] = useState('');
    const [bookSearch, setBookSearch] = useState('');
    const [returnSearch, setReturnSearch] = useState('');

    // Dropdown Visibility
    const [showStudentList, setShowStudentList] = useState(false);
    const [showBookList, setShowBookList] = useState(false);

    // Refs for Focus Management
    const bookInputRef = useRef(null);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false, title: '', message: '', action: null, isDanger: false
    });

    useEffect(() => {
        loadInitialData();
        fetchActiveIssues();
    }, []);

    const loadInitialData = async () => {
        try {
            const usersRes = await API.get('/users');
            const booksRes = await API.get('/books');
            setAllStudents(usersRes.data.filter(u => u.role === 'student'));
            setAllBooks(booksRes.data);
        } catch (error) { console.error("Error loading search data"); }
    };

    const fetchActiveIssues = async () => {
        try {
            const { data } = await API.get('/circulation/history');
            setActiveIssues(data.filter(t => t.status === 'Issued'));
        } catch (error) { console.error("Error loading issues"); }
    };

    // --- BARCODE SCANNER LOGIC ---
    const handleBookInputKeyDown = (e) => {
        // Barcode scanners send an 'Enter' keycode (13) after typing the number
        if (e.key === 'Enter') {
            e.preventDefault(); // Stop form submission if inside a form

            const scannedIsbn = bookSearch.trim();
            if (!scannedIsbn) return;

            // Find exact ISBN match
            const foundBook = allBooks.find(b => b.isbn === scannedIsbn);

            if (foundBook) {
                if (foundBook.availableCopies < 1) {
                    toast.warning(`"${foundBook.title}" is currently out of stock.`);
                } else {
                    toast.success("Book Scanned & Selected! 📸");
                }
                setSelectedBook(foundBook);
                setBookSearch(''); // Clear input to show the selection card
                setShowBookList(false);
            } else {
                toast.error(`No book found with ISBN: ${scannedIsbn}`);
            }
        }
    };

    const handleIssue = async (e) => {
        e.preventDefault();
        if (!selectedStudent) return toast.warning("Please search and select a student.");
        if (!selectedBook && !manualCopyId) return toast.warning("Please select a book OR enter a Copy ID.");

        setLoading(true);
        try {
            const payload = {
                studentId: selectedStudent._id,
                copyId: manualCopyId || null,
                isbn: !manualCopyId && selectedBook ? selectedBook.isbn : null
            };
            const { data } = await API.post('/circulation/issue', payload);
            toast.success(`Success! Issued Copy: ${data.copy}`);

            // Reset Form
            setSelectedBook(null);
            setBookSearch('');
            setManualCopyId('');
            fetchActiveIssues();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Issue Failed');
        }
        setLoading(false);
    };

    const handleReturn = (copyId) => {
        setConfirmModal({
            isOpen: true, title: 'Return Book', message: `Mark Copy ${copyId} as Returned?`, isDanger: false,
            action: async () => {
                try {
                    const { data } = await API.post('/circulation/return', { copyId });
                    toast.success(data.fine > 0 ? `Returned with FINE: ₹${data.fine}` : "Returned Successfully!");
                    fetchActiveIssues();
                } catch (error) { toast.error('Return Failed'); }
                closeConfirm();
            }
        });
    };

    const closeConfirm = () => setConfirmModal({ ...confirmModal, isOpen: false });

    // Filtering Logic
    const filteredStudents = allStudents.filter(s =>
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.registerNumber.toLowerCase().includes(studentSearch.toLowerCase())
    );

    const filteredBooks = allBooks.filter(b =>
        b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
        (b.isbn && b.isbn.includes(bookSearch))
    );

    const filteredReturns = activeIssues.filter(t =>
        (t.copyId || '').toLowerCase().includes(returnSearch.toLowerCase()) ||
        (t.student?.name || '').toLowerCase().includes(returnSearch.toLowerCase()) ||
        (t.student?.registerNumber || '').toLowerCase().includes(returnSearch.toLowerCase()) ||
        (t.book?.title || '').toLowerCase().includes(returnSearch.toLowerCase())
    );

    return (
        <div>
            {/* --- HEADER & TABS --- */}
            <div className="flex-between mb-4">
                <div>
                    <h2>Circulation Desk</h2>
                    <p>Issue new books or process returns.</p>
                </div>

                <div style={{ display: 'flex', background: 'var(--border)', padding: '4px', borderRadius: 'var(--radius)', width: '100%', maxWidth: '300px' }}>
                    <button
                        onClick={() => setActiveTab('issue')}
                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', background: activeTab === 'issue' ? 'var(--bg-card)' : 'transparent', color: activeTab === 'issue' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: activeTab === 'issue' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s' }}
                    >
                        📤 Issue
                    </button>
                    <button
                        onClick={() => setActiveTab('return')}
                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', background: activeTab === 'return' ? 'var(--bg-card)' : 'transparent', color: activeTab === 'return' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: activeTab === 'return' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s' }}
                    >
                        📥 Return
                    </button>
                </div>
            </div>

            {/* --- ISSUE PANEL --- */}
            {activeTab === 'issue' && (
                <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <form onSubmit={handleIssue}>

                        {/* 1. STUDENT SELECTOR */}
                        <div className="form-group" style={{ position: 'relative' }}>
                            <label>Find Student</label>
                            {selectedStudent ? (
                                <div style={{ padding: '12px', background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: 'var(--success)' }}>{selectedStudent.name}</div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{selectedStudent.registerNumber} • {selectedStudent.department}</div>
                                    </div>
                                    <button type="button" onClick={() => { setSelectedStudent(null); setStudentSearch(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.6 }}>✕</button>
                                </div>
                            ) : (
                                <>
                                    <input className="form-control" placeholder="Type Name or RegNo..." value={studentSearch} onChange={e => { setStudentSearch(e.target.value); setShowStudentList(true); }} onFocus={() => setShowStudentList(true)} />
                                    {showStudentList && studentSearch && (
                                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', maxHeight: '200px', overflowY: 'auto', zIndex: 20, boxShadow: 'var(--shadow-lg)', borderRadius: '0 0 var(--radius) var(--radius)' }}>
                                            {filteredStudents.map(s => (
                                                <div key={s._id} onClick={() => { setSelectedStudent(s); setShowStudentList(false); }} style={{ padding: '10px', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                    <strong>{s.name}</strong> <span style={{ color: 'var(--text-muted)' }}>({s.registerNumber})</span>
                                                </div>
                                            ))}
                                            {filteredStudents.length === 0 && <div style={{ padding: '10px', color: 'var(--text-muted)' }}>No students found</div>}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* 2. BOOK SELECTOR (SCANNER OPTIMIZED) */}
                        <div className="form-group" style={{ position: 'relative', marginTop: '1.5rem' }}>
                            <div className="flex-between" style={{ marginBottom: '5px' }}>
                                <label>Find Book (Scan ISBN)</label>
                                {!selectedBook && (
                                    <span
                                        onClick={() => bookInputRef.current?.focus()}
                                        style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <FaBarcode /> Focus to Scan
                                    </span>
                                )}
                            </div>

                            {selectedBook ? (
                                <div style={{ padding: '12px', background: 'var(--warning-bg)', border: '1px solid var(--warning)', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: 'var(--warning)' }}>{selectedBook.title}</div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>ISBN: {selectedBook.isbn}</div>
                                    </div>
                                    <button type="button" onClick={() => { setSelectedBook(null); setBookSearch(''); setTimeout(() => bookInputRef.current?.focus(), 100); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.6 }}>✕</button>
                                </div>
                            ) : (
                                <>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            ref={bookInputRef}
                                            className="form-control"
                                            placeholder="Scan ISBN or Type Title..."
                                            value={bookSearch}
                                            onChange={e => { setBookSearch(e.target.value); setShowBookList(true); }}
                                            onKeyDown={handleBookInputKeyDown} // ✅ Scanner Listener
                                            onFocus={() => setShowBookList(true)}
                                            disabled={!!manualCopyId}
                                            style={{ paddingRight: '40px' }}
                                        />
                                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                            <FaBarcode />
                                        </div>
                                    </div>

                                    {showBookList && bookSearch && (
                                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', maxHeight: '200px', overflowY: 'auto', zIndex: 20, boxShadow: 'var(--shadow-lg)', borderRadius: '0 0 var(--radius) var(--radius)' }}>
                                            {filteredBooks.map(b => (
                                                <div key={b._id} onClick={() => { setSelectedBook(b); setShowBookList(false); }} style={{ padding: '10px', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                    <strong>{b.title}</strong>
                                                    <div style={{ fontSize: '0.75rem', color: b.availableCopies > 0 ? 'var(--success)' : 'var(--danger)' }}>
                                                        {b.availableCopies > 0 ? 'Available' : 'No Stock'}
                                                    </div>
                                                </div>
                                            ))}
                                            {filteredBooks.length === 0 && <div style={{ padding: '10px', color: 'var(--text-muted)' }}>No books found</div>}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div style={{ textAlign: 'center', margin: '1.5rem 0', position: 'relative' }}>
                            <span style={{ background: 'var(--bg-card)', padding: '0 10px', color: 'var(--text-muted)', position: 'relative', zIndex: 1, fontSize: '0.8rem' }}>OR ENTER COPY ID</span>
                            <div style={{ height: '1px', background: 'var(--border)', position: 'absolute', top: '50%', left: 0, right: 0 }}></div>
                        </div>

                        {/* 3. MANUAL COPY ID */}
                        <div className="form-group">
                            <input className="form-control" placeholder="Manual Copy ID (e.g. 978-X-X)" value={manualCopyId} onChange={e => { setManualCopyId(e.target.value); if (e.target.value) setSelectedBook(null); }} disabled={!!selectedBook} />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', height: '48px', fontSize: '1rem' }} disabled={loading || !selectedStudent}>
                            {loading ? 'Processing...' : 'Confirm Issue'}
                        </button>
                    </form>
                </div>
            )}

            {/* --- RETURN PANEL --- */}
            {activeTab === 'return' && (
                <div>
                    <div className="card mb-4">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.2rem' }}>🔍</span>
                            <input className="form-control" placeholder="Search by Copy ID, Student Name, Reg No..." value={returnSearch} onChange={e => setReturnSearch(e.target.value)} style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: 0 }} />
                        </div>
                    </div>

                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                            <table style={{ width: '100%', minWidth: '600px' }}>
                                <thead>
                                    <tr>
                                        <th>Copy ID</th>
                                        <th>Student</th>
                                        <th>Book Title</th>
                                        <th>Due Date</th>
                                        <th className="text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReturns.map(t => (
                                        <tr key={t._id}>
                                            <td style={{ fontWeight: 'bold' }}>{t.copyId}</td>
                                            <td><div style={{ fontWeight: '600' }}>{t.student?.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.student?.registerNumber}</div></td>
                                            <td>{t.book?.title}</td>
                                            <td><span style={{ color: new Date() > new Date(t.dueDate) ? 'var(--danger)' : 'var(--success)', fontWeight: '600' }}>{new Date(t.dueDate).toLocaleDateString()}</span></td>
                                            <td className="text-right"><button className="btn btn-primary btn-icon" onClick={() => handleReturn(t.copyId)} title="Return Book">📥</button></td>
                                        </tr>
                                    ))}
                                    {filteredReturns.length === 0 && <tr><td colSpan="5" className="text-center" style={{ padding: '3rem', color: 'var(--text-muted)' }}>No active issues found matching your search.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal isOpen={confirmModal.isOpen} onClose={closeConfirm} onConfirm={confirmModal.action} title={confirmModal.title} message={confirmModal.message} isDanger={confirmModal.isDanger} />
        </div>
    );
};

export default CirculationDesk;