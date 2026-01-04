import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import API from '../api';
import CollegeLogo from '../components/images/College_logo.png';

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { data } = await API.post('/auth/login', { identifier, password });
            login(data);
            toast.success(`Welcome back, ${data.name}!`);

            // Redirect based on Role
            if (data.role === 'student') navigate('/student-dashboard');
            else if (data.role === 'staff') navigate('/staff-dashboard');
            else navigate('/admin-dashboard');

        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid Credentials');
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: 'var(--bg-body)' }}>

            {/* LEFT SIDE - BRANDING */}
            <div style={{
                flex: '1',
                background: 'linear-gradient(135deg, #4361ee 0%, #3a56d4 100%)', // Fallback to hex codes if vars fail
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '4rem',
                position: 'relative'
            }} className="hidden-mobile">
                <div style={{ position: 'relative', zIndex: 10 }}>
                    <h1 style={{
                        fontSize: '3.5rem',
                        marginBottom: '1.5rem',
                        color: '#ffffff',
                        fontWeight: '800',
                        textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                    }}>
                        GPTK Library
                    </h1>
                    <p style={{
                        fontSize: '1.25rem',
                        color: '#ffffff',
                        maxWidth: '550px',
                        lineHeight: '1.7',
                        fontWeight: '500', // Increased weight for visibility
                        opacity: '1',      // Removed transparency
                        textShadow: '0 1px 3px rgba(0,0,0,0.3)' // Added shadow for contrast
                    }}>
                        The central digital hub for Government Polytechnic, Kampli. Access resources, manage your account, and explore knowledge.
                    </p>
                </div>

                {/* Decorative Circles */}
                <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', top: '10%', left: '10%', width: '100px', height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
            </div>

            {/* RIGHT SIDE - FORM */}
            <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ width: '100%', maxWidth: '420px', background: 'var(--bg-card)', padding: '3rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)' }}>

                    <div className="text-center mb-5">
                        <img src={CollegeLogo} alt="Logo" style={{ height: '70px', marginBottom: '1.5rem', objectFit: 'contain' }} />
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Welcome Back</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Please enter your details to sign in.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-main)' }}>ID or Email</label>
                            <input
                                className="form-control"
                                type="text"
                                placeholder="Reg No (e.g. 172CS...) or Email"
                                value={identifier}
                                onChange={e => setIdentifier(e.target.value)}
                                required
                                autoFocus
                                style={{ padding: '12px' }}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ color: 'var(--text-main)' }}>Password</label>
                            <input
                                className="form-control"
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                style={{ padding: '12px' }}
                            />
                        </div>

                        <div className="text-right mb-4">
                            <span
                                onClick={() => navigate('/forgot-password')}
                                style={{ color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', transition: 'color 0.2s' }}
                                onMouseOver={(e) => e.target.style.color = 'var(--primary-hover)'}
                                onMouseOut={(e) => e.target.style.color = 'var(--primary)'}
                            >
                                Forgot Password?
                            </span>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: '600' }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', textAlign: 'center' }}>
                        <p><strong>Student Login:</strong> Use Reg No & DOB (DDMMYYYY)</p>
                        <p><strong>Staff Login:</strong> Use registered Email</p>
                    </div>
                </div>
            </div>

            {/* Mobile Optimization Style */}
            <style>{`
                @media (max-width: 768px) {
                    .hidden-mobile { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default Login;