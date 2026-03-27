// ─── Profile Page ───
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Profile() {
    const { user, logout } = useAuth();

    if (!user) return null;

    const getMembershipBadge = () => {
        switch (user.membership_type) {
            case 'vvip':
                return { label: 'VVIP Member', color: 'purple', icon: '👑' };
            case 'vip':
                return { label: 'VIP Member', color: 'gold', icon: '⭐' };
            default:
                return { label: 'Regular Member', color: 'gray', icon: '👤' };
        }
    };

    const badge = getMembershipBadge();

    return (
        <div className="page" id="profile-page">
            <div className="empty-state glass-card" style={{ maxWidth: '600px', margin: '4rem auto' }}>
                <div className="empty-icon" style={{ fontSize: '4rem', marginBottom: '1rem' }}>{badge.icon}</div>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{user.name}</h1>
                <p className="text-secondary" style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>{user.email}</p>

                <div
                    className="membership-badge"
                    style={{
                        display: 'inline-block',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '20px',
                        border: `1px solid var(--${badge.color})`,
                        color: `var(--${badge.color})`,
                        fontWeight: 'bold',
                        marginBottom: '2rem',
                        background: `rgba(var(--${badge.color}-rgb, 255,255,255), 0.1)`
                    }}
                >
                    {badge.label}
                </div>

                <div className="profile-details" style={{ textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>Membership Benefits</h3>
                    <ul style={{ listStyleType: 'none', padding: 0, color: 'var(--text-secondary)' }}>
                        <li style={{ marginBottom: '0.5rem' }}>✅ Access to booking upcoming football matches</li>
                        <li style={{ marginBottom: '0.5rem' }}>✅ Real-time seat selection via stadium grid</li>
                        {user.membership_type === 'vip' && (
                            <li style={{ color: 'var(--gold)' }}>⭐ 10% exclusive discount on all VIP seat bookings</li>
                        )}
                        {user.membership_type === 'vvip' && (
                            <>
                                <li style={{ color: 'var(--gold)' }}>⭐ 10% exclusive discount on VIP seat bookings</li>
                                <li style={{ color: 'var(--purple)' }}>👑 20% massive discount on Premium VVIP box access</li>
                            </>
                        )}
                    </ul>
                </div>

                <div className="form-actions" style={{ justifyContent: 'center', gap: '1rem' }}>
                    <Link to="/my-tickets" className="btn btn-outline">
                        View Ticket History
                    </Link>
                    <button className="btn btn-danger" onClick={logout}>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
