// ─── Checkout Page ───
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ticketAPI } from '../services/api';

export default function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();

    // The data passed from SeatSelection.jsx
    const stateData = location.state;
    const [bookingLoading, setBookingLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);

    // Payment Form state
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [paymentInfo, setPaymentInfo] = useState({ cardNumber: '', upiId: '', bank: '', walletMobile: '' });

    // Protect route if accessed directly without seat data
    useEffect(() => {
        if (!stateData || !stateData.match || !stateData.selectedSeat) {
            navigate('/matches');
        }
    }, [stateData, navigate]);

    if (!stateData) return null;

    const { match, selectedSeat, basePrice, finalPrice } = stateData;

    // Check if form is completely valid
    const isFormValid = () => {
        if (!paymentMethod) return false;
        if (paymentMethod === 'card') {
            // Remove spaces before checking length
            const raw = (paymentInfo.cardNumber || '').replace(/\s/g, '');
            return raw.length === 16;
        }
        if (paymentMethod === 'upi') {
            return !!(paymentInfo.upiId && paymentInfo.upiId.includes('@'));
        }
        if (paymentMethod === 'netbanking') {
            return !!paymentInfo.bank;
        }
        if (paymentMethod === 'wallet') {
            const digits = (paymentInfo.walletMobile || '').replace(/\D/g, '');
            return digits.length >= 10;
        }
        return false;
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        setError('');

        if (!isFormValid()) {
            const hints = {
                card: 'Enter a valid 16-digit card number.',
                upi: 'Enter a valid UPI ID (e.g. name@bank).',
                netbanking: 'Please select your bank.',
                wallet: 'Enter at least a 10-digit mobile number.'
            };
            setError(hints[paymentMethod] || 'Please fill out all required payment fields correctly.');
            return;
        }

        setBookingLoading(true);

        try {
            const payload = {
                match_id: match.id,
                seat_id: selectedSeat.id,
                payment_method: paymentMethod,
                payment_info: paymentInfo,
                amount: finalPrice
            };

            const response = await ticketAPI.bookTicket(payload);

            if (!response.data.success) {
                setError(response.data.message || 'Booking failed. Please try again.');
                return;
            }

            setBookingResult({
                ticket: response.data.ticket,
                transactionId: response.data.transaction_id || 'TXN' + Date.now(),
            });
            setShowSuccessModal(true);

        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Unexpected error processing payment. Please try again.');
        } finally {
            setBookingLoading(false);
        }
    };

    return (
        <div className="page" id="checkout-page">
            <div className="checkout-container glass-card" style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
                <h2>Checkout & Payment</h2>
                {error && <div className="alert alert-error">{error}</div>}

                <div className="checkout-split">
                    <div className="payment-form">
                        <h3>Payment Details</h3>
                        <div className="payment-tabs">
                            <button type="button" className={`tab-btn ${paymentMethod === 'card' ? 'active' : ''}`} onClick={() => setPaymentMethod('card')}>Credit Card</button>
                            <button type="button" className={`tab-btn ${paymentMethod === 'upi' ? 'active' : ''}`} onClick={() => setPaymentMethod('upi')}>UPI</button>
                            <button type="button" className={`tab-btn ${paymentMethod === 'netbanking' ? 'active' : ''}`} onClick={() => setPaymentMethod('netbanking')}>Net Banking</button>
                            <button type="button" className={`tab-btn ${paymentMethod === 'wallet' ? 'active' : ''}`} onClick={() => setPaymentMethod('wallet')}>Wallet</button>
                        </div>
                        <form onSubmit={handleBooking}>

                            {paymentMethod === 'card' && (
                                <>
                                    <div className="form-group">
                                        <label>Card Number</label>
                                        <input
                                            type="text"
                                            placeholder="1234 5678 9101 1121"
                                            value={paymentInfo.cardNumber}
                                            onChange={e => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                                            pattern="\\d{16}"
                                            title="16 digit card number"
                                            required
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Expiry Date</label>
                                            <input type="text" placeholder="MM/YY" pattern="(0[1-9]|1[0-2])\\/\\d{2}" title="MM/YY" required />
                                        </div>
                                        <div className="form-group">
                                            <label>CVV</label>
                                            <input type="text" placeholder="123" pattern="\\d{3,4}" title="3 or 4 digit CVV" required />
                                        </div>
                                    </div>
                                </>
                            )}

                            {paymentMethod === 'upi' && (
                                <div className="form-group">
                                    <label>UPI ID</label>
                                    <input
                                        type="text"
                                        placeholder="username@bank"
                                        value={paymentInfo.upiId}
                                        onChange={e => setPaymentInfo({ ...paymentInfo, upiId: e.target.value })}
                                        pattern="[a-zA-Z0-9.\\-_]{2,256}@[a-zA-Z]{2,64}"
                                        title="Valid UPI ID (e.g. user@bank)"
                                        required
                                    />
                                </div>
                            )}

                            {paymentMethod === 'netbanking' && (
                                <div className="form-group">
                                    <label>Select Bank</label>
                                    <select required value={paymentInfo.bank || ''} onChange={(e) => setPaymentInfo({ ...paymentInfo, bank: e.target.value })}>
                                        <option value="">Choose a bank...</option>
                                        <option value="sbi">State Bank of India</option>
                                        <option value="hdfc">HDFC Bank</option>
                                        <option value="icici">ICICI Bank</option>
                                        <option value="axis">Axis Bank</option>
                                    </select>
                                </div>
                            )}

                            {paymentMethod === 'wallet' && (
                                <div className="form-group">
                                    <label>Mobile Number for Wallet</label>
                                    <input
                                        type="tel"
                                        placeholder="10-digit mobile number"
                                        pattern="[0-9]{10}"
                                        value={paymentInfo.walletMobile}
                                        onChange={e => setPaymentInfo({ ...paymentInfo, walletMobile: e.target.value })}
                                        required
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                className={`btn btn-primary btn-full ${!isFormValid() ? 'btn-disabled' : ''}`}
                                disabled={bookingLoading || !isFormValid()}
                                style={{ marginTop: '1rem', position: 'relative' }}
                            >
                                {bookingLoading ? (
                                    <span className="spinner-wrap">
                                        <svg className="spinner-icon" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle></svg>
                                        Processing...
                                    </span>
                                ) : `Securely Pay £${finalPrice.toFixed(2)}`}
                            </button>
                        </form>
                    </div>
                    <div className="checkout-summary">
                        <h3>Order Summary</h3>
                        <p className="summary-match">{match.home_team_name} vs {match.away_team_name}</p>
                        <p className="summary-seat">Row {selectedSeat.row_number} - Seat {selectedSeat.seat_number} (<span className={`text-${selectedSeat.seat_type}`}>{selectedSeat.seat_type.toUpperCase()}</span>)</p>
                        <div className="price-breakdown">
                            <div className="price-row"><span>Base Ticket</span> <span>£{basePrice.toFixed(2)}</span></div>
                            {selectedSeat.seat_type !== 'regular' && (
                                <div className="price-row"><span>{selectedSeat.seat_type.toUpperCase()} Premium</span> <span>+£{(finalPrice - basePrice).toFixed(2)}</span></div>
                            )}
                            <div className="total-row" style={{ marginTop: '1rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
                                <span>Total</span> <span>£{finalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                        <button type="button" className="btn btn-outline btn-full back-btn" onClick={() => navigate(-1)} disabled={bookingLoading}>← Modify Seat</button>
                    </div>
                </div>

                {/* Success Modal Overlay */}
                {showSuccessModal && bookingResult && (
                    <div className="modal-overlay active">
                        <div className="modal-content success-modal glass-card">
                            <div className="success-icon-wrap">
                                <span className="success-icon">🎉</span>
                            </div>
                            <h2 className="modal-title">Booking Confirmed!</h2>
                            <p className="modal-subtitle">Your ticket has been successfully booked securely.</p>

                            <div className="modal-ticket-details">
                                <div className="detail-row">
                                    <span className="label">Match</span>
                                    <span className="value">{match.home_team_name} vs {match.away_team_name}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Seat</span>
                                    <span className="value">Row {selectedSeat.row_number}, Seat {selectedSeat.seat_number} ({selectedSeat.seat_type.toUpperCase()})</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Payment Method</span>
                                    <span className="value uppercase">{paymentMethod}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Transaction ID</span>
                                    <span className="value font-mono">{bookingResult.transactionId}</span>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <Link to="/my-tickets" className="btn btn-primary">View Ticket</Link>
                                <Link to="/" className="btn btn-outline">Go to Home</Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
