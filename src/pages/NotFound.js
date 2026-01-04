import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-body)',
            color: 'var(--text-main)',
            textAlign: 'center'
        }}>
            <h1 style={{ fontSize: '6rem', marginBottom: '0', color: 'var(--primary)' }}>404</h1>
            <h2 style={{ marginBottom: '1rem' }}>Page Not Found</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                The page you are looking for does not exist or you do not have permission to view it.
            </p>
            <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                Go to Login
            </Link>
        </div>
    );
};

export default NotFound;