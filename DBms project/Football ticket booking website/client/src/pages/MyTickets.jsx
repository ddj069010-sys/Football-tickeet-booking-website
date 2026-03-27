// ─── My Tickets Page ─── Professional ticket display with null-safe guards
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ticketAPI } from '../services/api';

export default function MyTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('All');
    const [expandedTicketId, setExpandedTicketId] = useState(null);

    useEffect(() => {
        ticketAPI.getMyTickets()
            .then(res => setTickets(res.data.tickets || []))
            .catch(() => setError('Failed to load tickets. Please try again.'))
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const filteredTickets = useMemo(() => {
        const now = new Date();
        return tickets.filter(t => {
            const matchDate = new Date(t.match_date);
            const isCancelled = t.booking_status === 'cancelled';
            if (filter === 'Cancelled') return isCancelled;
            if (isCancelled && filter !== 'All') return false;
            if (filter === 'Upcoming') return matchDate > now;
            if (filter === 'Past') return matchDate <= now;
            return true;
        });
    }, [tickets, filter]);

    const handleDownloadTicket = (ticket) => {
        const seatType = (ticket.seat_type || 'regular').toUpperCase();
        const amount = isNaN(parseFloat(ticket.amount)) ? '0.00' : parseFloat(ticket.amount).toFixed(2);
        const txn = ticket.transaction_id || 'N/A';

        const printWindow = window.open('', '_blank', 'width=820,height=700');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>GoalBooker Ticket — ${txn}</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Libre+Barcode+39&display=swap" rel="stylesheet">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Inter', sans-serif; background: #0a0a1a; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; }
                    .wrapper { width: 100%; max-width: 480px; }
                    .ticket { border-radius: 20px; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,0.5); }
                    .ticket-top { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 28px 32px 24px; }
                    .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
                    .brand-icon { font-size: 28px; }
                    .brand-text { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
                    .match-title { font-size: 26px; font-weight: 800; line-height: 1.2; margin-bottom: 6px; }
                    .match-subtitle { opacity: 0.85; font-size: 13px; font-weight: 400; }
                    .ticket-divider { display: flex; align-items: center; background: #f3f4f6; }
                    .circle { width: 28px; height: 28px; border-radius: 50%; background: #0a0a1a; flex-shrink: 0; }
                    .dashes { flex: 1; border-top: 2px dashed #d1d5db; }
                    .ticket-body { background: white; padding: 28px 32px; color: #1f2937; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
                    .info-item .label { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-bottom: 5px; }
                    .info-item .value { font-size: 15px; font-weight: 700; color: #111827; }
                    .seat-box { background: #f8f9ff; border: 2px solid #e0e7ff; border-radius: 12px; padding: 18px 24px; display: flex; justify-content: space-around; margin-bottom: 24px; }
                    .seat-box .info-item .value { color: #4f46e5; font-size: 22px; }
                    .seat-type-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; background: #ede9fe; color: #7c3aed; }
                    .barcode-section { text-align: center; border-top: 1px dashed #e5e7eb; padding-top: 20px; }
                    .barcode-text { font-family: 'Libre Barcode 39', monospace; font-size: 60px; letter-spacing: 3px; color: #111827; line-height: 1; }
                    .barcode-label { font-size: 10px; color: #9ca3af; margin-top: 4px; letter-spacing: 0.5px; }
                    .ticket-footer { background: #4f46e5; color: white; padding: 14px 24px; text-align: center; font-size: 12px; opacity: 0.9; }
                    .status-confirmed { color: #059669; font-weight: 700; }
                    @media print { body { background: white; } .ticket { box-shadow: none; } }
                </style>
            </head>
            <body>
                <div class="wrapper">
                    <div class="ticket">
                        <div class="ticket-top">
                            <div class="brand">
                                <span class="brand-icon">⚽</span>
                                <span class="brand-text">GoalBooker</span>
                            </div>
                            <div class="match-title">${ticket.home_team || 'Home'} vs ${ticket.away_team || 'Away'}</div>
                            <div class="match-subtitle">Official Electronic Match Ticket</div>
                        </div>
                        <div class="ticket-divider">
                            <div class="circle"></div>
                            <div class="dashes"></div>
                            <div class="circle"></div>
                        </div>
                        <div class="ticket-body">
                            <div class="info-grid">
                                <div class="info-item">
                                    <div class="label">Date &amp; Time</div>
                                    <div class="value" style="font-size:13px">${new Date(ticket.match_date).toLocaleString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                                <div class="info-item">
                                    <div class="label">Venue</div>
                                    <div class="value" style="font-size:13px">${ticket.stadium_name || 'TBA'}</div>
                                </div>
                                <div class="info-item">
                                    <div class="label">Payment Method</div>
                                    <div class="value">${(ticket.payment_method || 'N/A').toUpperCase()}</div>
                                </div>
                                <div class="info-item">
                                    <div class="label">Price Paid</div>
                                    <div class="value" style="color:#10b981">£${amount}</div>
                                </div>
                            </div>
                            <div class="seat-box">
                                <div class="info-item">
                                    <div class="label">Row</div>
                                    <div class="value">${ticket.row_number || '—'}</div>
                                </div>
                                <div class="info-item">
                                    <div class="label">Seat</div>
                                    <div class="value">${ticket.seat_number || '—'}</div>
                                </div>
                                <div class="info-item">
                                    <div class="label">Class</div>
                                    <div class="value"><span class="seat-type-badge">${seatType}</span></div>
                                </div>
                            </div>
                            <div class="barcode-section">
                                <div class="barcode-text">*${txn.substring(0, 12)}*</div>
                                <div class="barcode-label">TXN: ${txn}</div>
                            </div>
                        </div>
                        <div class="ticket-footer">
                            Valid for one admission only &bull; Non-transferable &bull; Subject to Terms &amp; Conditions
                        </div>
                    </div>
                </div>
                <script>setTimeout(() => window.print(), 1200);</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const getSeatClass = (type) => {
        const t = (type || 'regular').toLowerCase();
        if (t === 'vvip') return 'badge-vvip';
        if (t === 'vip') return 'badge-vip';
        return 'badge-regular';
    };

    return (
        <div className="page" id="my-tickets-page" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="page-header" style={{ marginBottom: '1.5rem' }}>
                <div>
                    <h1>🎫 My Tickets</h1>
                    <p className="text-muted">Your booking history — click any ticket to expand details</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {['All', 'Upcoming', 'Past', 'Cancelled'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '0.4rem 1.2rem',
                            borderRadius: '20px',
                            border: filter === f ? 'none' : '1px solid rgba(255,255,255,0.2)',
                            background: filter === f ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: filter === f ? '700' : '400',
                            transition: 'all 0.2s'
                        }}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {loading && <div className="loading">Loading your tickets...</div>}
            {error && <div className="alert alert-error">{error}</div>}

            {!loading && !error && filteredTickets.length === 0 && (
                <div className="empty-state glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎫</div>
                    <h3>No Tickets Found</h3>
                    <p className="text-muted" style={{ margin: '0.5rem 0 1.5rem' }}>
                        {filter === 'All' ? "You haven't booked any tickets yet." : `No ${filter.toLowerCase()} tickets.`}
                    </p>
                    {filter === 'All' && <Link to="/matches" className="btn btn-primary">Browse Matches</Link>}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredTickets.map(t => {
                    const isExpanded = expandedTicketId === t.ticket_id;
                    const seatType = (t.seat_type || 'regular').toLowerCase();
                    const isConfirmed = t.booking_status === 'confirmed';

                    return (
                        <div
                            key={t.ticket_id}
                            className="glass-card"
                            onClick={() => setExpandedTicketId(isExpanded ? null : t.ticket_id)}
                            style={{
                                cursor: 'pointer',
                                padding: 0,
                                overflow: 'hidden',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                border: isExpanded ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)'
                            }}
                        >
                            {/* Ticket Top Color Bar */}
                            <div style={{
                                height: '4px',
                                background: isConfirmed
                                    ? (seatType === 'vvip' ? 'linear-gradient(90deg, #8b5cf6, #ec4899)' : seatType === 'vip' ? 'linear-gradient(90deg, #f59e0b, #f97316)' : 'linear-gradient(90deg, #6366f1, #06b6d4)')
                                    : 'linear-gradient(90deg, #ef4444, #f87171)'
                            }} />

                            <div style={{ padding: '1.25rem 1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.4rem' }}>
                                            {t.home_team || '—'} <span style={{ color: 'var(--text-secondary)' }}>vs</span> {t.away_team || '—'}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                            <span>📅 {formatDate(t.match_date)}</span>
                                            <span>🏟️ {t.stadium_name || 'TBA'}</span>
                                            {t.row_number && <span>💺 Row {t.row_number}, Seat {t.seat_number}</span>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            background: isConfirmed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                                            color: isConfirmed ? '#34d399' : '#f87171',
                                            border: isConfirmed ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)'
                                        }}>
                                            {(t.booking_status || 'unknown').toUpperCase()}
                                        </span>
                                        <span style={{
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            background: seatType === 'vvip' ? 'rgba(139,92,246,0.2)' : seatType === 'vip' ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.15)',
                                            color: seatType === 'vvip' ? '#c4b5fd' : seatType === 'vip' ? '#fcd34d' : '#a5b4fc'
                                        }}>
                                            {seatType.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div style={{ marginTop: '1.25rem', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '1.25rem', animation: 'ticketFadeIn 0.25s ease' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Transaction ID</div>
                                                <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#a5b4fc' }}>{t.transaction_id || 'N/A'}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Payment</div>
                                                <div style={{ fontWeight: '600', textTransform: 'uppercase' }}>{t.payment_method || 'N/A'}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Amount Paid</div>
                                                <div style={{ fontWeight: '700', color: '#34d399' }}>
                                                    £{isNaN(parseFloat(t.amount)) ? '0.00' : parseFloat(t.amount).toFixed(2)}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Booked On</div>
                                                <div>{new Date(t.created_at || t.match_date).toLocaleDateString()}</div>
                                            </div>
                                        </div>

                                        {isConfirmed && (
                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={(e) => { e.stopPropagation(); handleDownloadTicket(t); }}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                                    Download Ticket
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <style>{`
                @keyframes ticketFadeIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
