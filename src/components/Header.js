import React from 'react';
import { useTheme } from '../context/ThemeContext';
import CollegeLogo from './images/College_logo.png';

const Header = ({ user }) => {
    const { theme, toggleTheme, toggleSidebar, toggleMobileMenu } = useTheme();

    return (
        <header className="app-header">
            {/* Left Section: Menu Toggle & Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    className="menu-btn"
                    onClick={() => window.innerWidth <= 768 ? toggleMobileMenu() : toggleSidebar()}
                    aria-label="Toggle Menu"
                >
                    ☰
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={CollegeLogo} alt="Logo" style={{ height: '36px', objectFit: 'contain' }} />
                    <div className="brand-text">
                        <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)', lineHeight: '1.2' }}>GPTK Library</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>Govt Polytechnic, Kampli</div>
                    </div>
                </div>
            </div>

            {/* Right Section: Actions & Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

                {/* Dark Mode Toggle with Transition */}
                <button
                    onClick={toggleTheme}
                    className="menu-btn"
                    title="Toggle Theme"
                    style={{
                        borderRadius: '50%', width: '40px', height: '40px', padding: 0, border: 'none',
                        background: 'var(--bg-body)', boxShadow: 'var(--shadow-sm)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                        transition: 'transform 0.3s ease, background-color 0.2s'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>

                {/* User Profile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '1rem', borderLeft: '1px solid var(--border)' }}>
                    <div className="user-info text-right">
                        <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>{user?.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{user?.role}</div>
                    </div>

                    <div className="user-avatar" style={{
                        width: '38px', height: '38px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}>
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                </div>
            </div>

            {/* Internal CSS for Responsiveness */}
            <style>{`
                @media (max-width: 500px) {
                    .brand-text { display: none; } /* Hide text on very small screens */
                    .user-info { display: none; } /* Hide name on mobile */
                    .app-header { padding: 0 1rem; }
                }
            `}</style>
        </header>
    );
};

export default Header;