// ─── Matches List Page ───
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchAPI } from '../services/api';

export default function MatchesList() {
    const { user } = useAuth();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const res = await matchAPI.getMatches();
                setMatches(res.data.matches);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to load matches.');
            } finally {
                setLoading(false);
            }
        };
        fetchMatches();
    }, []);

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="page" id="matches-page">
            <div className="page-header">
                <h1>Upcoming Matches</h1>
                <p className="text-muted">Browse and book tickets for upcoming football matches</p>
            </div>

            {loading ? (
                <div className="loading">Loading matches...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : matches.length === 0 ? (
                <div className="empty-state glass-card">
                    <div className="empty-icon">🏟️</div>
                    <h3>No Matches Available</h3>
                    <p>Check back later for upcoming matches.</p>
                </div>
            ) : (
                <div className="matches-grid">
                    {matches.map((match) => (
                        <div key={match.id} className="match-card glass-card" id={`match-${match.id}`}>
                            <div className="match-image-header">
                                <div className="match-image-overlay"></div>
                            </div>
                            <div className="match-card-content">
                                <div className="match-teams">
                                    <span className="team-name home">{match.home_team_name}</span>
                                    <span className="match-vs">VS</span>
                                    <span className="team-name away">{match.away_team_name}</span>
                                </div>
                                <div className="match-info">
                                    <div className="match-detail">
                                        <span>📅</span> {formatDate(match.match_date)}
                                    </div>
                                    <div className="match-detail">
                                        <span>🏟️</span> {match.stadium_name}
                                    </div>
                                    <div className="match-detail">
                                        <span>🎟️</span> {match.available_seats} / {match.total_seats} seats
                                    </div>
                                    <div className="match-detail price">
                                        <span>💰</span> From £{parseFloat(match.base_ticket_price).toFixed(2)}
                                    </div>
                                </div>
                                <div className="match-actions">
                                    {new Date(match.match_date) < new Date() ? (
                                        <button className="btn btn-disabled btn-full" disabled>Match Ended</button>
                                    ) : match.available_seats === 0 ? (
                                        <button className="btn btn-disabled btn-full" disabled>Sold Out</button>
                                    ) : (
                                        <Link to={`/matches/${match.id}`} className="btn btn-primary btn-full" id={`book-match-${match.id}`}>
                                            View Details
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
