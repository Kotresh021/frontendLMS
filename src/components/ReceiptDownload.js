import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ReceiptDownload = ({ transaction, role }) => {

    // Safety check
    if (!transaction) return null;

    // --- EXPIRY LOGIC (Same as before) ---
    const isAvailable = () => {
        if (role === 'admin' || role === 'staff') return true;

        const dateStr = transaction.paymentDate || transaction.returnDate;
        if (!dateStr) return false;

        const eventDate = new Date(dateStr);
        const today = new Date();

        const isSameMonth = (eventDate.getMonth() === today.getMonth()) && (eventDate.getFullYear() === today.getFullYear());
        const diffTime = Math.abs(today - eventDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return isSameMonth || diffDays <= 5;
    };

    const downloadPDF = () => {
        const doc = new jsPDF();

        // --- PRINT FRIENDLY THEME (White/Black/Blue) ---
        const theme = {
            bg: "#ffffff",
            textMain: "#000000",
            textMuted: "#555555",
            accent: "#4361ee",      // Brand Blue
            border: "#cccccc"
        };

        // 1. HEADER
        // Simple Clean Header
        doc.setFillColor(theme.accent);
        doc.rect(0, 0, 210, 4, "F"); // Top Blue Strip

        doc.setFontSize(22);
        doc.setTextColor(theme.accent);
        doc.setFont("helvetica", "bold");
        doc.text("RECEIPT", 105, 25, null, null, 'center');

        doc.setFontSize(10);
        doc.setTextColor(theme.textMain);
        doc.setFont("helvetica", "normal");
        doc.text("Government Polytechnic, Kampli", 105, 32, null, null, 'center');
        doc.setTextColor(theme.textMuted);
        doc.text("Library Management System", 105, 37, null, null, 'center');

        // 2. DATA EXTRACTION
        const studentName = transaction.student?.name || "Student Removed";
        const studentReg = transaction.student?.registerNumber || "N/A";
        const studentDept = transaction.student?.department || "N/A";
        const bookTitle = transaction.book?.title || "Unknown Book";
        const copyId = transaction.copyId || "-";
        const txDate = new Date(transaction.paymentDate || transaction.returnDate || Date.now()).toLocaleDateString('en-GB');
        const receiptId = transaction._id ? transaction._id.slice(-8).toUpperCase() : "PENDING";
        const fineAmount = transaction.fine || 0;

        // 3. INFO BOXES (Left & Right)
        doc.setDrawColor(theme.border);
        doc.setLineWidth(0.1);
        doc.line(15, 45, 195, 45); // Separator Line

        // Left Side: Student Info
        doc.setFontSize(10);
        doc.setTextColor(theme.textMuted); doc.text("RECEIVED FROM:", 15, 55);

        doc.setTextColor(theme.textMain);
        doc.setFont("helvetica", "bold"); doc.text(studentName, 15, 62);
        doc.setFont("helvetica", "normal");
        doc.text(`Reg No: ${studentReg}`, 15, 68);
        doc.text(`Dept: ${studentDept}`, 15, 74);

        // Right Side: Receipt Details
        const rightX = 140;
        doc.setTextColor(theme.textMuted); doc.text("Receipt No:", rightX, 62);
        doc.setTextColor(theme.textMain); doc.text(receiptId, 195, 62, null, null, 'right');

        doc.setTextColor(theme.textMuted); doc.text("Date:", rightX, 68);
        doc.setTextColor(theme.textMain); doc.text(txDate, 195, 68, null, null, 'right');

        // 4. TABLE
        const tableBody = [
            [
                "1",
                bookTitle,
                copyId,
                fineAmount > 0 ? "Late Return Fine" : "Book Return (On Time)",
                `Rs. ${fineAmount.toFixed(2)}`
            ]
        ];

        autoTable(doc, {
            startY: 85,
            head: [['#', 'Description', 'Copy ID', 'Type', 'Amount']],
            body: tableBody,
            theme: 'plain', // Clean minimalist table
            headStyles: {
                fillColor: [240, 240, 240], // Light Gray Header
                textColor: 0,
                fontStyle: 'bold',
                lineColor: [200, 200, 200],
                lineWidth: 0.1
            },
            bodyStyles: {
                textColor: 0,
                cellPadding: 4,
                lineColor: [200, 200, 200],
                lineWidth: 0.1
            },
            styles: { fontSize: 10 }
        });

        // 5. TOTAL
        let finalY = doc.lastAutoTable.finalY + 10;

        // Total Box
        doc.setFillColor(245, 245, 245);
        doc.rect(130, finalY, 65, 20, 'F'); // Light Gray Box
        doc.setDrawColor(200, 200, 200);
        doc.rect(130, finalY, 65, 20, 'S'); // Border

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("TOTAL PAID", 135, finalY + 13);
        doc.text(`Rs. ${fineAmount.toFixed(2)}`, 190, finalY + 13, null, null, 'right');

        // 6. FOOTER / SIGNATURE
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.line(15, finalY + 40, 70, finalY + 40);
        doc.text("Authorized Signature", 15, finalY + 46);

        // Bottom Disclaimer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("Note: This is a computer-generated receipt.", 105, 280, null, null, 'center');
        doc.text(`Printed on: ${new Date().toLocaleString('en-GB')}`, 105, 285, null, null, 'center');

        doc.save(`Receipt_${receiptId}.pdf`);
    };

    if (!isAvailable()) return role === 'student' ? <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Expired</span> : null;

    return (
        <button
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={downloadPDF}
            title="Download Print-Friendly Receipt"
        >
            📄 Print Receipt
        </button>
    );
};

export default ReceiptDownload;