// ─── Booking Confirmation Page ───
import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

export default function Confirmation() {
    const location = useLocation();
    const navigate = useNavigate();

    // Protect route if accessed without booking data
    useEffect(() => {
        if (!location.state || !location.state.bookingDetails) {
            navigate('/matches');
        }
    }, [location, navigate]);

    if (!location.state) return null;

    const { match, selectedSeat, transactionId, paymentMethod } = location.state;

    return (
        <div className="page" id="confirmation-page">
            <div className="empty-state glass-card" style={{ maxWidth: '600px', margin: '4rem auto' }}>
                <div className="empty-icon" style={{ fontSize: '5rem', color: 'var(--success)' }}>✅</div>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--success)' }}>Booking Confirmed!</h1>
                <p className="text-secondary" style={{ marginBottom: '2rem' }}>
                    Your ticket for {match.home_team_name} vs {match.away_team_name} has been successfully booked.
                </p>

                <div className="ticket-details" style={{ textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                    <div className="form-row">
                        <div className="detail-group">
                            <span className="detail-label">Match</span>
                            <div className="detail-value">{match.home_team_name} vs {match.away_team_name}</div>
                        </div>
                        <div className="detail-group">
                            <span className="detail-label">Date</span>
                            <div className="detail-value">{new Date(match.match_date).toLocaleString()}</div>
                        </div>
                        <div className="detail-group">
                            <span className="detail-label">Stadium</span>
                            <div className="detail-value">{match.stadium_name}</div>
                        </div>
                        <div className="detail-group">
                            <span className="detail-label">Seat</span>
                            <div className="detail-value">Row {selectedSeat.row_number}, Seat {selectedSeat.seat_number}</div>
                        </div>
                        <div className="detail-group">
                            <span className="detail-label">Category</span>
                            <div className={`detail-value text-${selectedSeat.seat_type}`}>{selectedSeat.seat_type.toUpperCase()}</div>
                        </div>
                        <div className="detail-group">
                            <span className="detail-label">Transaction ID</span>
                            <div className="detail-value" style={{ fontFamily: 'monospace' }}>{transactionId}</div>
                        </div>
                        <div className="detail-group">
                            <span className="detail-label">Payment Method</span>
                            <div className="detail-value" style={{ textTransform: 'capitalize' }}>{paymentMethod}</div>
                        </div>
                    </div>
                </div>

                <div className="form-actions" style={{ justifyContent: 'center', gap: '1rem' }}>
                    <button className="btn btn-outline" onClick={() => window.print()}>
                        📄 Download/Print Ticket
                    </button>
                    <Link to="/my-tickets" className="btn btn-primary">
                        View My Tickets
                    </Link>
                </div>
            </div>
        </div>
    );
}
