import React from 'react';

const LibraryCard = ({ student, onClose }) => {
    if (!student) return null;

    const handlePrint = () => {
        const printContent = document.getElementById('printable-card').innerHTML;
        const win = window.open('', '', 'height=500,width=500');
        win.document.write('<html><head><title>ID Card</title>');
        win.document.write('<style>');
        win.document.write(`
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #fff; }
            .id-card { border: 2px solid #1e293b; width: 320px; border-radius: 12px; overflow: hidden; text-align: center; position: relative; background: #fff; }
            .header { background: #1e293b; color: white; padding: 15px 10px; }
            .header h3 { margin: 0; font-size: 18px; letter-spacing: 1px; }
            .header small { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.8; }
            .photo-area { width: 100px; height: 100px; background: #e2e8f0; border: 3px solid #fff; border-radius: 50%; margin: -50px auto 10px; position: relative; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; font-size: 40px; color: #64748b; }
            .content { padding: 0 20px 20px; }
            .name { font-size: 20px; font-weight: bold; color: #1e293b; margin: 5px 0; }
            .role { background: #f59e0b; color: white; display: inline-block; padding: 2px 12px; border-radius: 20px; font-size: 10px; font-weight: bold; text-transform: uppercase; margin-bottom: 15px; }
            .details { text-align: left; font-size: 13px; color: #334155; line-height: 1.6; border-top: 1px dashed #cbd5e1; padding-top: 10px; }
            .details div { display: flex; justify-content: space-between; }
            .footer { background: #f8fafc; padding: 10px; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        `);
        win.document.write('</style></head><body>');
        win.document.write(printContent);
        win.document.write('</body></html>');
        win.document.close();
        win.print();
    };

    return (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200 }}>
            <div className="card" style={{ width: '400px', textAlign: 'center', padding: '20px' }}>
                <h3 style={{ marginBottom: '20px' }}>Student ID Card</h3>

                <div id="printable-card" style={{ display: 'flex', justifyContent: 'center' }}>
                    <div className="id-card" style={{ border: '2px solid #1e293b', width: '300px', borderRadius: '12px', overflow: 'hidden', textAlign: 'center', background: '#fff' }}>
                        <div className="header" style={{ background: '#1e293b', color: 'white', padding: '40px 10px 60px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px' }}>GPTK LIBRARY</h3>
                            <small style={{ fontSize: '10px', textTransform: 'uppercase' }}>Government Polytechnic, Kampli</small>
                        </div>
                        <div className="photo-area" style={{ width: '100px', height: '100px', background: '#e2e8f0', borderRadius: '50%', border: '4px solid white', margin: '-50px auto 10px', display: 'flex', alignItems: 'center', justifyItems: 'center', fontSize: '40px', justifyContent: 'center' }}>
                            🎓
                        </div>
                        <div className="content" style={{ padding: '0 20px 20px' }}>
                            <div className="name" style={{ fontSize: '20px', fontWeight: 'bold', margin: '5px 0' }}>{student.name}</div>
                            <div className="role" style={{ background: '#f59e0b', color: 'white', display: 'inline-block', padding: '2px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold', marginBottom: '15px' }}>STUDENT</div>

                            <div className="details" style={{ textAlign: 'left', fontSize: '13px', borderTop: '1px dashed #ccc', paddingTop: '15px' }}>
                                <div style={{ display: 'flex', justifyItems: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ fontWeight: 'bold' }}>Register No:</span>
                                    <span>{student.registerNumber}</span>
                                </div>
                                <div style={{ display: 'flex', justifyItems: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ fontWeight: 'bold' }}>Department:</span>
                                    <span>{student.department}</span>
                                </div>
                                <div style={{ display: 'flex', justifyItems: 'space-between' }}>
                                    <span style={{ fontWeight: 'bold' }}>Semester:</span>
                                    <span>{student.semester}</span>
                                </div>
                            </div>
                        </div>
                        <div className="footer" style={{ background: '#f8fafc', padding: '10px', fontSize: '9px', color: '#94a3b8', borderTop: '1px solid #eee' }}>
                            Authorized Library Access Card
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                    <button className="btn btn-secondary" onClick={onClose}>Close</button>
                    <button className="btn btn-primary" onClick={handlePrint}>🖨️ Print</button>
                </div>
            </div>
        </div>
    );
};

export default LibraryCard;