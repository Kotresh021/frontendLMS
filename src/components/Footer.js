import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            padding: '2rem',
            marginTop: 'auto',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-body)'
        }}>
            <p style={{ marginBottom: '5px' }}>
                &copy; {new Date().getFullYear()} <strong>GPTK Library Management System</strong>
            </p>
            <p style={{ opacity: 0.8 }}>
                <a
                    href="https://gpt.karnataka.gov.in/gptkampli/public/en"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        color: 'inherit',
                        textDecoration: 'none',
                        borderBottom: '1px dashed var(--text-muted)',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.color = 'var(--primary)';
                        e.target.style.borderBottom = '1px solid var(--primary)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.color = 'inherit';
                        e.target.style.borderBottom = '1px dashed var(--text-muted)';
                    }}
                >
                    Government Polytechnic, Kampli
                </a>
                {' '} • Designed for Excellence
            </p>
        </footer>
    );
};

export default Footer;