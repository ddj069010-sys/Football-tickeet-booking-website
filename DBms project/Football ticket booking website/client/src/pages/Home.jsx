// ─── Home Page ───
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { user, isAdmin } = useAuth();

    return (
        <div className="page home-page" id="home-page">
            <section className="hero">
                <div className="hero-background"></div>
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <div className="hero-icon">⚽</div>
                    <h1 className="hero-title">GoalBooker</h1>
                    <p className="hero-subtitle">
                        Experience the atmosphere live. Book your football match tickets instantly and secure your seat for the biggest games.
                    </p>
                    <div className="hero-actions">
                        <Link to="/matches" className="btn btn-primary btn-lg" id="hero-browse-matches">
                            Browse Matches
                        </Link>
                        {!user && (
                            <Link to="/register" className="btn btn-outline btn-lg" id="hero-register">
                                Create Account
                            </Link>
                        )}
                        {user && !isAdmin && (
                            <Link to="/dashboard" className="btn btn-outline btn-lg" id="hero-my-tickets">
                                My Tickets
                            </Link>
                        )}
                        {isAdmin && (
                            <Link to="/admin" className="btn btn-outline btn-lg" id="hero-admin">
                                Admin Panel
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            <section className="features">
                <div className="feature-card glass-card">
                    <div className="feature-icon">🏟️</div>
                    <h3>Live Matches</h3>
                    <p>Browse upcoming football matches from top teams and leagues.</p>
                </div>
                <div className="feature-card glass-card">
                    <div className="feature-icon">🎫</div>
                    <h3>Instant Booking</h3>
                    <p>Book your tickets in seconds with our streamlined booking system.</p>
                </div>
                <div className="feature-card glass-card">
                    <div className="feature-icon">🔒</div>
                    <h3>Secure & Reliable</h3>
                    <p>Your bookings are protected with industry-standard security.</p>
                </div>
            </section>
        </div>
    );
}
