// ─── Login Page ───
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await loginUser({ email, password });
            const { token, user } = res.data;
            login(token, user);

            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/matches');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const fillAdmin = () => {
        setEmail('admin@gmail.com');
        setPassword('admin@gmail.com');
    };

    return (
        <div className="page auth-page" id="login-page">
            <div className="auth-card glass-card">
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '2.5rem' }}>⚽</span>
                    <h2 className="auth-title" style={{ marginTop: '0.5rem' }}>Welcome Back</h2>
                    <p className="auth-subtitle">Sign in to your GoalBooker account</p>
                </div>

                {/* Quick Login Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    padding: '0.3rem'
                }}>
                    <button
                        type="button"
                        onClick={() => { setEmail(''); setPassword(''); setError(''); }}
                        style={{
                            flex: 1,
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: 'none',
                            background: !email.includes('admin') ? 'rgba(99, 102, 241, 0.6)' : 'transparent',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        🧑 User Login
                    </button>
                    <button
                        type="button"
                        onClick={fillAdmin}
                        style={{
                            flex: 1,
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: 'none',
                            background: email === 'admin@gmail.com' ? 'rgba(139, 92, 246, 0.7)' : 'transparent',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        🔑 Admin Login
                    </button>
                </div>

                {email === 'admin@gmail.com' && (
                    <div style={{
                        background: 'rgba(139, 92, 246, 0.15)',
                        border: '1px solid rgba(139, 92, 246, 0.4)',
                        borderRadius: '8px',
                        padding: '0.8rem 1rem',
                        marginBottom: '1rem',
                        fontSize: '0.85rem',
                        color: '#c4b5fd'
                    }}>
                        🔐 Admin credentials have been pre-filled. Click <strong>Sign In</strong> to continue.
                    </div>
                )}

                {error && <div className="alert alert-error" id="login-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="login-email">Email Address</label>
                        <input
                            type="email"
                            id="login-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            style={{
                                borderColor: email === 'admin@gmail.com' ? 'rgba(139,92,246,0.5)' : undefined
                            }}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="login-password">Password</label>
                        <input
                            type="password"
                            id="login-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        id="login-submit"
                        disabled={loading}
                        style={{
                            background: email === 'admin@gmail.com'
                                ? 'linear-gradient(135deg, #7c3aed, #8b5cf6)'
                                : undefined,
                            marginTop: '0.5rem'
                        }}
                    >
                        {loading ? 'Signing in...' : (email === 'admin@gmail.com' ? '🔑 Sign In as Admin' : '▶ Sign In')}
                    </button>
                </form>

                <p className="auth-footer" style={{ marginTop: '1.5rem' }}>
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
}
