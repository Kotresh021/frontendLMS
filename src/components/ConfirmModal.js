import React, { useState } from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isDanger, isInput }) => {
    const [inputValue, setInputValue] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (isInput) {
            if (!inputValue || parseInt(inputValue) < 1) return;
            onConfirm(inputValue);
            setInputValue('');
        } else {
            onConfirm();
        }
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100
        }}>
            <div className="card" style={{ width: '400px', margin: '1rem', padding: '1.5rem', boxShadow: 'var(--shadow-lg)' }}>
                <h3 style={{
                    marginTop: 0,
                    color: isDanger ? 'var(--danger)' : 'var(--text-main)',
                    fontSize: '1.25rem',
                    marginBottom: '1rem'
                }}>
                    {title}
                </h3>

                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    {message}
                </p>

                {isInput && (
                    <div className="form-group">
                        <input
                            type="number"
                            min="1"
                            autoFocus
                            className="form-control"
                            placeholder="Enter quantity..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                        />
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button onClick={onClose} className="btn btn-secondary">
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
                    >
                        {isInput ? 'Submit' : (isDanger ? 'Yes, Delete' : 'Confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;