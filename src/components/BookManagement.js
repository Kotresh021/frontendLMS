import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../api';
import ConfirmModal from './ConfirmModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Ensure you have this installed: npm install jspdf jspdf-autotable

const BookManagement = () => {
    // --- STATES ---
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchingIsbn, setFetchingIsbn] = useState(false);

    // Search & Selection
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);

    // Modals
    const [showModal, setShowModal] = useState(false);
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false); // ✅ New State for Export Dropdown

    // Data for Modals
    const [currentBookId, setCurrentBookId] = useState(null);
    const [copies, setCopies] = useState([]);

    const [formData, setFormData] = useState({
        title: '', author: '', isbn: '',
        department: '', quantity: 1,
        publisher: '', category: ''
    });

    const [file, setFile] = useState(null);

    // Confirm Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false, title: '', message: '', action: null, isDanger: false, isInput: false
    });

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const { data } = await API.get('/books');
            setBooks(data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to load books");
            setLoading(false);
        }
    };

    // --- ✅ EXPORT FUNCTIONS ---

    // 1. Export as CSV
    const exportCSV = () => {
        if (books.length === 0) return toast.warning("No books to export.");

        const headers = ["Title", "Author", "ISBN", "Department", "Category", "Publisher", "Total Copies", "Available"];

        const rows = books.map(b => [
            `"${b.title.replace(/"/g, '""')}"`, // Handle commas in titles
            `"${b.author.replace(/"/g, '""')}"`,
            `"${b.isbn || ''}"`,
            `"${b.department || ''}"`,
            `"${b.category || ''}"`,
            `"${b.publisher || ''}"`,
            b.totalCopies,
            b.availableCopies
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Library_Books_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportMenu(false);
        toast.success("CSV Exported Successfully! 📂");
    };

    // 2. Export as PDF
    const exportPDF = () => {
        if (books.length === 0) return toast.warning("No books to export.");

        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.text("Library Book Inventory", 14, 20);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
        doc.text(`Total Books: ${books.length}`, 14, 33);

        const tableColumn = ["Title", "Author", "ISBN", "Dept", "Stock"];
        const tableRows = books.map(b => [
            b.title.substring(0, 30) + (b.title.length > 30 ? '...' : ''),
            b.author.substring(0, 20),
            b.isbn || '-',
            b.department || '-',
            `${b.availableCopies} / ${b.totalCopies}`
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [67, 97, 238] } // Brand Blue
        });

        doc.save(`Library_Books_${new Date().toISOString().slice(0, 10)}.pdf`);
        setShowExportMenu(false);
        toast.success("PDF Exported Successfully! 📄");
    };

    // --- SUPER SMART FETCH (Google + Open Library) ---
    const fetchBookDetails = async () => {
        const isbn = formData.isbn.trim().replace(/-/g, '');
        if (!isbn) return toast.warning("Please enter an ISBN first.");

        setFetchingIsbn(true);
        let found = false;
        let bookData = { title: '', author: '', publisher: '', category: '' };

        try {
            // 1. Google Books
            const googleRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
            const googleData = await googleRes.json();

            if (googleData.totalItems > 0) {
                const info = googleData.items[0].volumeInfo;
                bookData.title = info.title || '';
                bookData.author = info.authors ? info.authors.join(', ') : '';
                bookData.publisher = info.publisher || '';
                bookData.category = info.categories ? info.categories[0] : '';
                found = true;
            }

            // 2. Open Library Fallback
            if (!found || !bookData.publisher) {
                const olRes = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`);
                const olData = await olRes.json();
                const olBook = olData[`ISBN:${isbn}`];

                if (olBook) {
                    found = true;
                    if (!bookData.title) bookData.title = olBook.title;
                    if (!bookData.author && olBook.authors) bookData.author = olBook.authors.map(a => a.name).join(', ');
                    if (!bookData.publisher && olBook.publishers) bookData.publisher = olBook.publishers.map(p => p.name).join(', ');
                    if (!bookData.category && olBook.subjects) bookData.category = olBook.subjects[0].name;
                }
            }

            if (found) {
                setFormData(prev => ({
                    ...prev,
                    title: bookData.title,
                    author: bookData.author,
                    publisher: bookData.publisher,
                    category: bookData.category
                }));
                toast.success("Book Details Found! 📚");
            } else {
                toast.info("Book not found in databases. Please enter manually.");
            }

        } catch (error) {
            toast.error("Network error while fetching details.");
        }
        setFetchingIsbn(false);
    };

    // --- CRUD ACTIONS ---
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await API.put(`/books/${currentBookId}`, formData);
                toast.success("Book Updated Successfully! 📘");
            } else {
                await API.post('/books', formData);
                toast.success("New Book Added! 📚");
            }
            setShowModal(false);
            fetchBooks();
        } catch (error) { toast.error(error.response?.data?.message || 'Error saving book'); }
    };

    const handleDeleteBook = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Book',
            message: 'Are you sure? This will delete the book and ALL its copies.',
            isDanger: true,
            action: () => processDeleteBook(id)
        });
    };

    const processDeleteBook = async (id) => {
        try {
            await API.delete(`/books/${id}`);
            setBooks(books.filter(b => b._id !== id));
            toast.success("Book Deleted");
        } catch (error) { toast.error("Delete failed"); }
        closeConfirm();
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setConfirmModal({
            isOpen: true,
            title: 'Bulk Delete',
            message: `Delete ${selectedIds.length} books? This cannot be undone.`,
            isDanger: true,
            action: () => processBulkDelete()
        });
    };

    const processBulkDelete = async () => {
        try {
            await API.post('/books/bulk-delete', { bookIds: selectedIds });
            toast.success("Books deleted successfully");
            fetchBooks();
            setSelectedIds([]);
        } catch (error) { toast.error("Bulk delete failed"); }
        closeConfirm();
    };

    // --- COPY MANAGEMENT ---
    const viewCopies = async (bookId) => {
        setCurrentBookId(bookId);
        try {
            const { data } = await API.get(`/books/${bookId}/copies`);
            setCopies(data);
            setShowCopyModal(true);
        } catch (error) { toast.error("Could not load copies"); }
    };

    const handleAddCopies = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Add Copies',
            message: 'Enter number of copies to add:',
            isInput: true,
            action: (val) => processAddCopies(val)
        });
    };

    const processAddCopies = async (val) => {
        const quantity = parseInt(val);
        if (!quantity || quantity < 1) return toast.warning("Invalid quantity");

        try {
            await API.post('/books/copy', {
                bookId: currentBookId,
                quantity: quantity
            });

            toast.success("Copies Added Successfully!");
            viewCopies(currentBookId);
            fetchBooks();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add copies");
        }
        closeConfirm();
    };

    const handleDeleteCopy = (copyId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Copy',
            message: 'Remove this specific copy ID?',
            isDanger: true,
            action: () => processDeleteCopy(copyId)
        });
    };

    const processDeleteCopy = async (copyId) => {
        try {
            await API.delete(`/books/copy/${copyId}`);
            setCopies(copies.filter(c => c._id !== copyId));
            fetchBooks();
        } catch (error) { toast.error("Failed to delete copy"); }
        closeConfirm();
    };

    const handleStatusChange = async (copyId, newStatus) => {
        try {
            await API.put(`/books/copy/${copyId}`, { status: newStatus });
            setCopies(copies.map(c => c._id === copyId ? { ...c, status: newStatus } : c));
            fetchBooks();
        } catch (error) { toast.error("Failed to update status"); }
    };

    // --- HELPERS ---
    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedIds(filteredBooks.map(b => b._id));
        else setSelectedIds([]);
    };

    const handleSelectOne = (e, id) => {
        if (e.target.checked) setSelectedIds([...selectedIds, id]);
        else setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    };

    const handleFileUpload = async () => {
        if (!file) return toast.warning("Please select a CSV file first.");
        const data = new FormData();
        data.append('file', file);
        try {
            setLoading(true);
            const res = await API.post('/books/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success(`Import Complete! Added: ${res.data.added}, Updated: ${res.data.updated}`);
            setFile(null);
            fetchBooks();
            setLoading(false);
        } catch (error) {
            toast.error('Upload Failed. Check file format.');
            setLoading(false);
        }
    };

    const closeConfirm = () => setConfirmModal({ ...confirmModal, isOpen: false });

    const openAddModal = () => {
        setIsEditMode(false);
        setFormData({ title: '', author: '', isbn: '', department: '', quantity: 1, publisher: '', category: '' });
        setShowModal(true);
    };

    const openEditModal = (b) => {
        setIsEditMode(true);
        setCurrentBookId(b._id);
        setFormData({
            title: b.title,
            author: b.author,
            isbn: b.isbn,
            department: b.department,
            publisher: b.publisher || '',
            category: b.category || '',
            quantity: 0
        });
        setShowModal(true);
    };

    const filteredBooks = books.filter(b =>
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.isbn && b.isbn.toString().includes(searchTerm)) ||
        (b.department && b.department.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Books...</div>;

    return (
        <div>
            {/* Header */}
            <div className="flex-between mb-4">
                <div>
                    <h2>Book Inventory</h2>
                    <p>Manage library catalog and stock ({books.length} books total)</p>
                </div>
                <button className="btn btn-primary" onClick={openAddModal}>
                    <span style={{ marginRight: '5px' }}>+</span> Add New Book
                </button>
            </div>

            {/* Actions & Filters */}
            <div className="card mb-4">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 300px' }}>
                        <input
                            className="form-control"
                            placeholder="🔍 Search by Title, ISBN, or Department..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>

                        {/* ✅ NEW EXPORT DROPDOWN */}
                        <div style={{ position: 'relative' }}>
                            <button className="btn btn-secondary" onClick={() => setShowExportMenu(!showExportMenu)}>
                                📤 Export
                            </button>
                            {showExportMenu && (
                                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '5px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)', zIndex: 10, minWidth: '150px' }}>
                                    <button onClick={exportCSV} style={{ display: 'block', width: '100%', padding: '10px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', color: 'var(--text-main)' }}>
                                        📄 Download CSV
                                    </button>
                                    <button onClick={exportPDF} style={{ display: 'block', width: '100%', padding: '10px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', color: 'var(--text-main)', borderTop: '1px solid var(--border)' }}>
                                        📕 Download PDF
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* CSV Import */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRight: '1px solid var(--border)', paddingRight: '15px', paddingLeft: '15px', borderLeft: '1px solid var(--border)' }}>
                            <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} className="form-control" style={{ width: '200px', padding: '5px', fontSize: '0.8rem' }} />
                            <button className="btn btn-secondary" onClick={handleFileUpload}>Import</button>
                        </div>

                        {/* Bulk Delete */}
                        {selectedIds.length > 0 && (
                            <button className="btn btn-danger" onClick={handleBulkDelete}>🗑️ Delete ({selectedIds.length})</button>
                        )}
                    </div>
                </div>
            </div>

            {/* Books Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '40px', textAlign: 'center' }}>
                                    <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length > 0 && selectedIds.length === filteredBooks.length} />
                                </th>
                                <th>Book Details</th>
                                <th>Info</th>
                                <th>Availability</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBooks.map((b) => (
                                <tr key={b._id} style={{ backgroundColor: selectedIds.includes(b._id) ? 'var(--primary-light)' : 'transparent' }}>
                                    <td style={{ textAlign: 'center' }}>
                                        <input type="checkbox" checked={selectedIds.includes(b._id)} onChange={(e) => handleSelectOne(e, b._id)} />
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{b.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ISBN: <span style={{ fontFamily: 'monospace' }}>{b.isbn}</span></div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>By: {b.author}</div>
                                    </td>
                                    <td>
                                        <span className="badge badge-neutral" style={{ marginRight: '5px' }}>{b.department}</span>
                                        {b.category && <span className="badge badge-neutral">{b.category}</span>}
                                    </td>
                                    <td>
                                        <span className={`badge ${b.availableCopies > 0 ? 'badge-success' : 'badge-danger'}`}>
                                            {b.availableCopies} / {b.totalCopies} Available
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button className="btn btn-secondary btn-icon" onClick={() => viewCopies(b._id)} title="View Copies">📚</button>
                                            <button className="btn btn-secondary btn-icon" onClick={() => openEditModal(b)} title="Edit">✏️</button>
                                            <button className="btn btn-danger btn-icon" onClick={() => handleDeleteBook(b._id)} title="Delete">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredBooks.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No books found.</td></tr>}
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
                isInput={confirmModal.isInput}
            />

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1050 }}>
                    <div className="card" style={{ width: '100%', maxWidth: '600px', margin: '20px' }}>
                        <div className="card-header">
                            <h3>{isEditMode ? 'Edit Book' : 'Add New Book'}</h3>
                            <button className="btn btn-secondary btn-icon" onClick={() => setShowModal(false)} style={{ border: 'none' }}>✕</button>
                        </div>
                        <form onSubmit={handleCreate}>
                            {/* Auto-Fill ISBN Section */}
                            <div className="form-group">
                                <label>ISBN (Type & Click Auto-Fill)</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        className="form-control"
                                        required
                                        value={formData.isbn}
                                        onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                                        disabled={isEditMode}
                                        placeholder="e.g. 9780134685991"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={fetchBookDetails}
                                        disabled={fetchingIsbn || !formData.isbn || isEditMode}
                                        title="Fetch details from Google & OpenLibrary"
                                    >
                                        {fetchingIsbn ? '⏳' : '🔍 Auto-Fill'}
                                    </button>
                                </div>
                                <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Checks Google Books first, then Open Library for Indian titles.</small>
                            </div>

                            <div className="form-group"><label>Title</label><input className="form-control" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group"><label>Author</label><input className="form-control" required value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} /></div>
                                <div className="form-group"><label>Publisher</label><input className="form-control" value={formData.publisher} onChange={e => setFormData({ ...formData, publisher: e.target.value })} /></div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group"><label>Department Code</label><input className="form-control" required value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} placeholder="e.g. CS" /></div>
                                <div className="form-group"><label>Category</label><input className="form-control" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Fiction" /></div>
                            </div>

                            {!isEditMode && (<div className="form-group"><label>Initial Quantity</label><input type="number" min="1" className="form-control" required value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} /></div>)}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Book</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Copy Modal */}
            {showCopyModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1050 }}>
                    <div className="card" style={{ width: '100%', maxWidth: '600px', margin: '20px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <div className="card-header" style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                            <h3 style={{ margin: 0 }}>Manage Copies</h3>
                            <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={handleAddCopies}>+ Add More</button>
                        </div>

                        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '5px' }}>
                            {copies.map((copy) => (
                                <div key={copy._id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '12px', border: '1px solid var(--border)', marginBottom: '8px', borderRadius: 'var(--radius)',
                                    background: copy.status === 'Available' ? 'transparent' : 'var(--danger-bg)'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{copy.copyNumber}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status: {copy.status}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <select
                                            className="form-control"
                                            style={{ padding: '6px', fontSize: '0.8rem', width: 'auto' }}
                                            value={copy.status}
                                            onChange={(e) => handleStatusChange(copy._id, e.target.value)}
                                            disabled={copy.status === 'Issued'}
                                        >
                                            <option value="Available">Available</option>
                                            <option value="Damaged">Damaged</option>
                                            <option value="Lost">Lost</option>
                                            <option value="Reserved">Reserved</option>
                                            <option value="Issued" disabled>Issued</option>
                                        </select>
                                        <button className="btn btn-danger btn-icon" onClick={() => handleDeleteCopy(copy._id)}>🗑️</button>
                                    </div>
                                </div>
                            ))}
                            {copies.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '20px' }}>No copies found.</p>}
                        </div>

                        <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '15px', textAlign: 'right' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowCopyModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookManagement;