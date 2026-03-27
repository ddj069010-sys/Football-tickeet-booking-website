// ─── Seat Selection Page ───
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { matchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SeatSelection() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [match, setMatch] = useState(null);
    const [seats, setSeats] = useState([]);
    const [basePrice, setBasePrice] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const fetchMatchData = async () => {
            try {
                const [matchRes, seatsRes] = await Promise.all([
                    matchAPI.getMatch(id),
                    matchAPI.getMatchSeats(id)
                ]);
                setMatch(matchRes.data.match);
                setSeats(seatsRes.data.seats || []);
                const bp = parseFloat(seatsRes.data.base_price || 0);
                setBasePrice(isNaN(bp) ? 0 : bp);
            } catch (err) {
                setError('Failed to load match or seat data.');
            } finally {
                setLoading(false);
            }
        };
        fetchMatchData();
    }, [id]);

    const calculatePrice = useCallback((seat) => {
        if (!seat) return 0;
        let price = basePrice || 0;
        
        // Use database multiplier if available, otherwise fallback to type-based logic
        if (seat.price_multiplier) {
            price *= parseFloat(seat.price_multiplier);
        } else {
            const type = (seat.seat_type || 'regular').toLowerCase();
            if (type === 'vip') price *= 2;
            if (type === 'vvip') price *= 5;
        }

        // Apply membership discount
        if (user?.membership_type === 'vip') price *= 0.9;
        if (user?.membership_type === 'vvip') price *= 0.8;

        return isNaN(price) ? 0 : price;
    }, [basePrice, user]);


    const handleSeatClick = useCallback((seat) => {
        if (seat.is_booked) return;
        setSelectedSeat(seat);
    }, []);

    const handleProceedToCheckout = () => {
        if (!selectedSeat) {
            setError('Please select a seat to proceed.');
            return;
        }
        setError('');
        // Navigate to dedicated checkout page, passing state
        navigate('/checkout', {
            state: {
                match,
                selectedSeat,
                basePrice,
                finalPrice: calculatePrice(selectedSeat)
            }
        });
    };

    if (loading) return <div className="page"><div className="loading">Loading seat map...</div></div>;
    if (!match) return <div className="page"><div className="alert alert-error">Match not found.</div></div>;

    const gridRows = [...new Set(seats.map(s => s.row_number))].sort((a, b) => a - b);
    const filterOptions = ['All', 'Regular', 'VIP', 'VVIP', 'Available Only'];

    return (
        <div className={`page stadium-theme-${match.stadium_id}`} id="seat-selection-page">
            <div className="page-header match-header glass-card">
                <h1>{match.home_team_name} vs {match.away_team_name}</h1>
                <p><strong>Stadium:</strong> {match.stadium_name} ({match.stadium_location})</p>
                <p><strong>Date:</strong> {new Date(match.match_date).toLocaleString()}</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="booking-container">
                <div className="seat-selection glass-card" style={{ overflow: 'hidden' }}>

                    <div className="controls-header">
                        <div className="sets-legend-wrapper">
                            <div className="seats-legend">
                                <span className="legend-item"><div className="seat-box available"></div> Available</span>
                                <span className="legend-item"><div className="seat-box booked"></div> Booked</span>
                                <span className="legend-item"><div className="seat-box selected"></div> Selected</span>
                                <span className="legend-item"><div className="seat-box vip"></div> VIP</span>
                                <span className="legend-item"><div className="seat-box vvip"></div> VVIP</span>
                            </div>
                        </div>

                        <div className="seat-filters">
                            {filterOptions.map(f => (
                                <button
                                    key={f}
                                    className={`filter-btn ${filter === f ? 'active' : ''}`}
                                    onClick={() => setFilter(f)}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="stadium-wrapper">
                        <div className={`stadium-grid ${filter !== 'All' ? 'filtering' : ''}`}>
                            <div className="pitch-area">PITCH</div>
                            {gridRows.map(rowNum => {
                                const rowSeats = seats.filter(s => s.row_number === rowNum).sort((a, b) => a.seat_number - b.seat_number);
                                return (
                                    <div key={`row-${rowNum}`} className="seat-row">
                                        <span className="row-label">R{rowNum}</span>
                                        {rowSeats.map(seat => {
                                            let seatClass = 'seat-icon seat-tooltip-container ';
                                            if (seat.is_booked) seatClass += 'booked';
                                            else if (selectedSeat?.id === seat.id) seatClass += 'selected';
                                            else seatClass += seat.seat_type;

                                            // Determine visibility for filter
                                            const isAvailableOnly = filter === 'Available Only' && !seat.is_booked;
                                            const isTypeMatch = filter.toLowerCase() === seat.seat_type;
                                            if (filter === 'All' || isAvailableOnly || isTypeMatch) {
                                                seatClass += ' matched-filter';
                                            }

                                            const seatPrice = calculatePrice(seat);

                                            return (
                                                <button
                                                    key={seat.id}
                                                    className={seatClass}
                                                    onClick={() => handleSeatClick(seat)}
                                                    disabled={seat.is_booked}
                                                >
                                                    <div className="seat-tooltip">
                                                        <div><strong>Row:</strong> <span>{rowNum}</span></div>
                                                        <div><strong>Seat:</strong> <span>{seat.seat_number}</span></div>
                                                        <div><strong>Type:</strong> <span>{seat.seat_type.toUpperCase()}</span></div>
                                                        <div className="tt-price"><strong>Price:</strong> £{seatPrice.toFixed(2)}</div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                        <span className="row-label">R{rowNum}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="booking-summary glass-card">
                    <h3>Selection Summary</h3>
                    {selectedSeat ? (
                        <div className="summary-details">
                            <p><strong>Seat:</strong> Row {selectedSeat.row_number}, Seat {selectedSeat.seat_number}</p>
                            <p><strong>Type:</strong> <span className={`text-${selectedSeat.seat_type}`}>{selectedSeat.seat_type.toUpperCase()}</span></p>
                            <p><strong>Base Price:</strong> £{basePrice.toFixed(2)}</p>
                            {user?.membership_type !== 'regular' && (
                                <p className="text-gold">✨ {user.membership_type?.toUpperCase()} Member Discount Applied!</p>
                            )}
                            <h3 className="final-price">Total: £{calculatePrice(selectedSeat).toFixed(2)}</h3>
                            <button className="btn btn-primary btn-full" onClick={handleProceedToCheckout}>
                                Proceed to Payment
                            </button>
                        </div>
                    ) : (
                        <p className="empty-selection">Please select a seat from the stadium map to continue.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
