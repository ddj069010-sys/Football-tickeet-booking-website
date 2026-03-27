// ─── Register Page ───
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/api';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '', // Added as per instruction, though not used for validation here
        membership_type: 'regular'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { name, email, password, membership_type } = formData;

        try {
            const res = await registerUser({ name, email, password, membership_type });
            login(res.data.token, res.data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page auth-page" id="register-page">
            <div className="auth-card glass-card">
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Join GoalBooker and start booking tickets</p>

                {error && <div className="alert alert-error" id="register-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="register-name">Full Name</label>
                        <input
                            type="text"
                            id="register-name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="register-email">Email</label>
                        <input
                            type="email"
                            id="register-email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="register-password">Password</label>
                        <input
                            type="password"
                            id="register-password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a strong password"
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="membership_type">Membership Tier</label>
                        <select
                            id="membership_type"
                            name="membership_type"
                            value={formData.membership_type}
                            onChange={handleChange}
                        >
                            <option value="regular">Regular</option>
                            <option value="vip">VIP (10% Discount)</option>
                            <option value="vvip">VVIP (20% Discount + Priority)</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" id="register-submit" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
