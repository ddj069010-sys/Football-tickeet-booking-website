// ─── Navbar Component ───
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar" id="main-navbar">
            <div className="navbar-brand">
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">⚽</span>
                    <span className="logo-text">GoalBooker</span>
                </Link>
            </div>

            <div className="navbar-links">
                {/* Only show Matches link for non-admin users */}
                {user && !isAdmin && (
                    <Link to="/matches" className="nav-link" id="nav-matches">Matches</Link>
                )}

                {!user ? (
                    <>
                        <Link to="/matches" className="nav-link" id="nav-matches-public">Matches</Link>
                        <Link to="/login" className="nav-link" id="nav-login">Login</Link>
                        <Link to="/register" className="nav-link nav-link-primary" id="nav-register">Register</Link>
                    </>
                ) : (
                    <>
                        <NotificationBell />

                        {isAdmin ? (
                            <>
                                {/* Admin badge */}
                                <span style={{
                                    background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
                                    color: 'white',
                                    padding: '0.2rem 0.7rem',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                    letterSpacing: '0.05em',
                                    border: '1px solid rgba(139,92,246,0.6)'
                                }}>
                                    🔑 ADMIN
                                </span>
                                <Link to="/admin" className="nav-link" id="nav-admin">Dashboard</Link>
                                <Link to="/admin/activity" className="nav-link" id="nav-admin-activity">Activity</Link>
                                <Link to="/admin/users" className="nav-link" id="nav-admin-users">Users</Link>
                                <Link to="/admin/reports" className="nav-link" id="nav-admin-reports">Reports</Link>
                                <Link to="/admin/matches" className="nav-link" id="nav-manage-matches">Matches</Link>
                                <Link to="/admin/database" className="nav-link" id="nav-db-manager">DB</Link>
                            </>
                        ) : (
                            <>
                                <Link to="/my-tickets" className="nav-link" id="nav-my-tickets">My Tickets</Link>
                                <Link to="/profile" className="nav-link" id="nav-profile">Profile</Link>
                            </>
                        )}

                        <button onClick={handleLogout} className="nav-link nav-link-logout" id="nav-logout">
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}
