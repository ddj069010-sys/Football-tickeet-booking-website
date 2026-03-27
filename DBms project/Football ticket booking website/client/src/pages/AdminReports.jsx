import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';

const cardStyle = {
    background: '#18181b', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid #27272a'
};
const thStyle = { padding: '0.75rem 1rem', color: '#a1a1aa', textAlign: 'left', fontSize: '0.8rem', borderBottom: '1px solid #3f3f46' };
const tdStyle = { padding: '0.75rem 1rem', borderBottom: '1px solid #1c1c1f', fontSize: '0.85rem', color: '#e4e4e7' };

export default function AdminReports() {
    const [revenue, setRevenue] = useState([]);
    const [liveBookings, setLiveBookings] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loadingRevenue, setLoadingRevenue] = useState(true);
    const [matchStatusUpdating, setMatchStatusUpdating] = useState(null);
    const [msg, setMsg] = useState('');

    const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3500); };

    const fetchRevenue = async () => {
        try {
            const res = await adminAPI.getRevenueReport();
            setRevenue(res.data.report || []);
            setMatches(res.data.report || []);
        } catch (e) { console.error(e); }
        finally { setLoadingRevenue(false); }
    };

    const fetchLive = useCallback(async () => {
        try {
            const res = await adminAPI.getLiveBookings();
            setLiveBookings(res.data.bookings || []);
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => {
        fetchRevenue();
        fetchLive();
        const interval = setInterval(fetchLive, 5000); // Phase 6 — poll every 5s
        return () => clearInterval(interval);
    }, [fetchLive]);

    const handleSetStatus = async (matchId, status) => {
        setMatchStatusUpdating(matchId);
        try {
            await adminAPI.setMatchStatus(matchId, status);
            flash(`Match status updated to ${status}.`);
        } catch { flash('Failed to update match status.'); }
        finally { setMatchStatusUpdating(null); }
    };

    const statusColor = { upcoming: '#3b82f6', live: '#10b981', completed: '#a1a1aa', cancelled: '#ef4444' };

    return (
        <div style={{ color: 'white', padding: '2rem' }}>
            <h1 style={{ marginBottom: '0.5rem' }}>📊 Admin Reports & Control</h1>
            <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>Revenue analytics, live bookings feed and match management in one place.</p>
            {msg && <div style={{ background: '#10b981', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>{msg}</div>}

            {/* Phase 6 — Live Booking Stream */}
            <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.1rem' }}>🔴 Live Booking Stream</h2>
                    <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Auto-refreshes every 5s</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                        <thead>
                            <tr>{['User', 'Match', 'Seat', 'Payment', 'Amount', 'Status'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {liveBookings.length === 0
                                ? <tr><td colSpan="6" style={{ ...tdStyle, textAlign: 'center', color: '#a1a1aa' }}>No bookings yet.</td></tr>
                                : liveBookings.map(b => (
                                    <tr key={b.ticket_id}>
                                        <td style={tdStyle}><div style={{ fontWeight: 'bold' }}>{b.user_name}</div><div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>{b.user_email}</div></td>
                                        <td style={tdStyle}>{b.home_team} vs {b.away_team}</td>
                                        <td style={tdStyle}>{b.seat_type?.toUpperCase()} R{b.row_label}{b.seat_number}</td>
                                        <td style={tdStyle}>{b.payment_method?.toUpperCase()}</td>
                                        <td style={{ ...tdStyle, color: '#34d399', fontWeight: 'bold' }}>£{parseFloat(b.amount || 0).toFixed(2)}</td>
                                        <td style={tdStyle}>
                                            <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', background: b.booking_status === 'cancelled' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)', color: b.booking_status === 'cancelled' ? '#f87171' : '#34d399' }}>
                                                {b.booking_status?.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Phase 9B — Revenue by Match */}
            <div style={cardStyle}>
                <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>💰 Revenue by Match</h2>
                {loadingRevenue ? <p style={{ color: '#a1a1aa' }}>Loading...</p> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>{['Match', 'Date', 'Tickets Sold', 'Revenue', 'Bar'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                            </thead>
                            <tbody>
                                {revenue.map(r => {
                                    const maxRev = Math.max(...revenue.map(x => parseFloat(x.total_revenue)), 1);
                                    const pct = Math.round((parseFloat(r.total_revenue) / maxRev) * 100);
                                    return (
                                        <tr key={r.match_id}>
                                            <td style={{ ...tdStyle, fontWeight: 'bold' }}>{r.home_team} vs {r.away_team}</td>
                                            <td style={{ ...tdStyle, color: '#a1a1aa' }}>{new Date(r.match_date).toLocaleDateString()}</td>
                                            <td style={tdStyle}>{r.tickets_sold || 0}</td>
                                            <td style={{ ...tdStyle, color: '#34d399', fontWeight: 'bold' }}>£{parseFloat(r.total_revenue || 0).toFixed(2)}</td>
                                            <td style={{ ...tdStyle, minWidth: '150px' }}>
                                                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #6366f1)', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Phase 9D — Match Status Control */}
            <div style={cardStyle}>
                <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>🎮 Match Status Control</h2>
                {matches.length === 0
                    ? <p style={{ color: '#a1a1aa' }}>No matches found.</p>
                    : matches.map(m => (
                        <div key={m.match_id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap', padding: '0.75rem', background: '#1c1c1f', borderRadius: '8px' }}>
                            <span style={{ flex: 1, fontWeight: 'bold', minWidth: '200px' }}>{m.home_team} vs {m.away_team}</span>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {['upcoming', 'live', 'completed', 'cancelled'].map(s => (
                                    <button key={s} disabled={matchStatusUpdating === m.match_id} onClick={() => handleSetStatus(m.match_id, s)}
                                        style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', borderRadius: '4px', border: `1px solid ${statusColor[s]}`, background: 'transparent', color: statusColor[s], cursor: 'pointer' }}>
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}
