import React from 'react';
import { useNavigate } from 'react-router-dom';
import CollegeLogo from '../components/images/College_logo.png';

const ForgotPassword = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            width: '100vw',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-body)',
            padding: '1rem'
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '450px',
                textAlign: 'center',
                padding: '3rem 2rem',
                boxShadow: 'var(--shadow-lg)'
            }}>
                {/* Logo & Icon */}
                <img src={CollegeLogo} alt="Logo" style={{ height: '60px', marginBottom: '1rem', objectFit: 'contain' }} />

                <div style={{
                    fontSize: '3rem',
                    marginBottom: '1rem',
                    background: 'var(--bg-body)',
                    width: '80px',
                    height: '80px',
                    lineHeight: '80px',
                    borderRadius: '50%',
                    margin: '0 auto 1.5rem auto'
                }}>
                    🔒
                </div>

                <h2 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Forgot Password?</h2>

                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
                    For security reasons, self-service password reset is disabled.
                    <br /><br />
                    Please visit the <strong>Circulation Desk</strong> or contact the <strong>Library Administrator</strong> with your ID card to request a password reset.
                </p>

                <div style={{
                    background: 'var(--warning-bg)',
                    border: '1px solid var(--warning)',
                    color: 'var(--warning)',
                    padding: '12px',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.9rem',
                    marginBottom: '2rem'
                }}>
                    <strong>Note:</strong> Your new password will be reset to the default format (e.g., DDMMYYYY).
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px' }}
                >
                    ← Back to Login
                </button>
            </div>
        </div>
    );
};

export default ForgotPassword;