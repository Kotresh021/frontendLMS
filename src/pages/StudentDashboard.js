import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import API from '../api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Components
import LibraryRules from '../components/LibraryRules';
import FeedbackManager from '../components/FeedbackManager';
import Settings from '../components/Settings';
import ReceiptDownload from '../components/ReceiptDownload'; // ✅ New Import

const StudentDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('rules'); // Default to Rules

    // Data States
    const [myHistory, setMyHistory] = useState([]);
    const [libraryBooks, setLibraryBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'my-books') fetchMyHistory();
        if (activeTab === 'library') fetchLibraryBooks();
    }, [activeTab]);

    const fetchMyHistory = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/circulation/student-history');
            setMyHistory(data);
        } catch (error) { console.error("History Error"); }
        setLoading(false);
    };

    const fetchLibraryBooks = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/books');
            setLibraryBooks(data);
        } catch (error) { console.error("Library Error"); }
        setLoading(false);
    };

    // --- SUB-VIEWS ---

    const MyBooksView = () => (
        <div>
            <div className="flex-between mb-4">
                <div>
                    <h2>My Borrowed Books</h2>
                    <p>Track your current books, due dates, and payment receipts.</p>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table style={{ width: '100%', minWidth: '700px' }}>
                        <thead>
                            <tr>
                                <th>Book Title</th>
                                <th>Author</th>
                                <th>Issued On</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Fine</th>
                                <th>Receipt</th> {/* ✅ Receipt Column */}
                            </tr>
                        </thead>
                        <tbody>
                            {myHistory.map((t) => {
                                const isOverdue = new Date() > new Date(t.dueDate) && t.status === 'Issued';
                                return (
                                    <tr key={t._id}>
                                        <td style={{ fontWeight: '600' }}>{t.book?.title}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>{t.book?.author}</td>
                                        <td>{new Date(t.issueDate).toLocaleDateString('en-GB')}</td>
                                        <td>
                                            <span style={{
                                                color: isOverdue ? 'var(--danger)' : 'inherit',
                                                fontWeight: isOverdue ? 'bold' : 'normal'
                                            }}>
                                                {new Date(t.dueDate).toLocaleDateString('en-GB')}
                                                {isOverdue && <span style={{ fontSize: '0.75rem', display: 'block' }}>(Overdue)</span>}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${t.status === 'Issued' ? 'badge-warning' : 'badge-success'}`}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 'bold', color: t.fine > 0 ? 'var(--danger)' : 'var(--success)' }}>
                                            {t.fine > 0 ? `₹${t.fine}` : '-'}
                                        </td>
                                        <td>
                                            {(t.status === 'Returned' || t.isFinePaid) && (
                                                <ReceiptDownload transaction={t} role="student" />
                                                // Pass 'student' role so it EXPIRES at end of month
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {!loading && myHistory.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center" style={{ padding: '3rem', color: 'var(--text-muted)' }}>
                                        You haven't borrowed any books yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const LibraryCatalogView = () => {
        const filtered = libraryBooks.filter(b =>
            b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.isbn && b.isbn.includes(searchTerm))
        );

        return (
            <div>
                <div className="flex-between mb-4">
                    <div>
                        <h2>Library Catalog</h2>
                        <p>Search for books available in the library.</p>
                    </div>
                </div>

                <div className="card mb-4">
                    <input
                        className="form-control"
                        placeholder="🔍 Search by Title, Author, or ISBN..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                        <table style={{ width: '100%', minWidth: '600px' }}>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Author</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(b => (
                                    <tr key={b._id}>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{b.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ISBN: {b.isbn}</div>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)' }}>{b.author}</td>
                                        <td><span className="badge badge-neutral">{b.department}</span></td>
                                        <td>
                                            <span className={`badge ${b.availableCopies > 0 ? 'badge-success' : 'badge-danger'}`}>
                                                {b.availableCopies > 0 ? 'Available' : 'Out of Stock'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {!loading && filtered.length === 0 && (
                                    <tr><td colSpan="4" className="text-center" style={{ padding: '3rem' }}>No books found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="dashboard-layout">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                role={user?.role}
                logout={logout}
            />

            <div className="dashboard-main">
                <Header user={user} />

                <div className="dashboard-content">
                    {/* Content Wrapper to push Footer down */}
                    <div style={{ flex: 1, marginBottom: '2rem' }}>
                        {activeTab === 'rules' && <LibraryRules />}
                        {activeTab === 'my-books' && <MyBooksView />}
                        {activeTab === 'library' && <LibraryCatalogView />}
                        {activeTab === 'feedback' && <FeedbackManager />}
                        {activeTab === 'settings' && <Settings />}
                    </div>

                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;