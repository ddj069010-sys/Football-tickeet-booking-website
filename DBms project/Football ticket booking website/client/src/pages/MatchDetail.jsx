// ─── Match Detail Page ───
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { matchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MatchDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMatch = async () => {
            try {
                const res = await matchAPI.getMatch(id);
                setMatch(res.data.match);
            } catch (err) {
                setError('Failed to load match details.');
            } finally {
                setLoading(false);
            }
        };
        fetchMatch();
    }, [id]);

    if (loading) return <div className="page"><div className="loading">Loading match details...</div></div>;
    if (error || !match) return <div className="page"><div className="alert alert-error">{error || 'Match not found.'}</div></div>;

    return (
        <div className="page" id="match-detail-page">
            <div className="hero glass-card" style={{ padding: '4rem 2rem', marginBottom: '2rem' }}>
                <h1 className="hero-title" style={{ fontSize: '3rem' }}>{match.home_team_name} vs {match.away_team_name}</h1>
                <p className="hero-subtitle" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                    📅 {new Date(match.match_date).toLocaleString()}
                </p>
                <p className="text-secondary" style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                    🏟️ {match.stadium_name}, {match.stadium_location}
                </p>

                <div className="stats-grid" style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
                    <div className="stat-card glass-card">
                        <div className="stat-value" style={{ fontSize: '1.5rem' }}>🎟️ {match.available_seats}</div>
                        <div className="stat-label">Available Seats</div>
                    </div>
                    <div className="stat-card glass-card">
                        <div className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--success)' }}>💰 £{parseFloat(match.base_ticket_price).toFixed(2)}</div>
                        <div className="stat-label">Base Ticket Price</div>
                    </div>
                </div>

                {new Date(match.match_date) < new Date() ? (
                    <button className="btn btn-disabled btn-lg" disabled>
                        Match Ended
                    </button>
                ) : user ? (
                    match.available_seats > 0 ? (
                        <button className="btn btn-primary btn-lg" onClick={() => navigate(`/matches/${match.id}/seats`)}>
                            Select Seats
                        </button>
                    ) : (
                        <button className="btn btn-disabled btn-lg" disabled>
                            Sold Out
                        </button>
                    )
                ) : (
                    <button className="btn btn-outline btn-lg" onClick={() => navigate('/login')}>
                        Login to Book Tickets
                    </button>
                )}
            </div>
        </div>
    );
}
