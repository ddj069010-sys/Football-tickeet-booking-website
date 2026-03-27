// ─── Admin Dashboard ───
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { matchAPI, teamAPI, ticketAPI, stadiumAPI, adminAPI, adminDBAPI } from '../services/api';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ matches: 0, teams: 0, stadiums: 0, bookings: 0, revenue: 0 });
    const [dbStats, setDbStats] = useState({ total_users: 0, total_bookings: 0, total_revenue: 0, seat_occupancy: 0 });
    const [data, setData] = useState({ matches: [], teams: [], tickets: [], stadiums: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const results = await Promise.allSettled([
                    matchAPI.getMatches(),
                    teamAPI.getTeams(),
                    ticketAPI.getAllTickets(),
                    stadiumAPI.getAllStadiums(),
                    adminDBAPI.getAnalytics()
                ]);

                const [matchRes, teamsRes, ticketsRes, stadiumRes, dbAnalyticsRes] = results;

                const matches = matchRes.status === 'fulfilled' ? (matchRes.value.data.matches || []) : [];
                const teams = teamsRes.status === 'fulfilled' ? (teamsRes.value.data.teams || []) : [];
                const tickets = ticketsRes.status === 'fulfilled' ? (ticketsRes.value.data.tickets || []) : [];
                const stadiums = stadiumRes.status === 'fulfilled' ? (stadiumRes.value.data.stadiums || []) : [];
                const analytics = dbAnalyticsRes.status === 'fulfilled' ? dbAnalyticsRes.value.data : {};

                const revenue = tickets.reduce((sum, t) => sum + parseFloat(t.amount || t.total_price || 0), 0);

                setStats({
                    matches: matches.length,
                    teams: teams.length,
                    bookings: tickets.length,
                    stadiums: stadiums.length,
                    revenue
                });

                setDbStats({
                    total_users: analytics.total_users || 0,
                    total_bookings: analytics.total_bookings || tickets.length,
                    total_revenue: analytics.total_revenue || revenue,
                    seat_occupancy: analytics.seat_occupancy || 0
                });

                setData({ matches, teams, tickets, stadiums });

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    const handleCancelBooking = async (ticketId) => {
        if (!window.confirm("Are you sure you want to cancel this booking and free the seat?")) return;

        try {
            await adminAPI.cancelTicket(ticketId);
            alert("Booking successfully cancelled!");

            // Optimistically update the local state without a full reload
            setData(prev => ({
                ...prev,
                tickets: prev.tickets.map(t => t.ticket_id === ticketId ? { ...t, booking_status: 'cancelled' } : t)
            }));
        } catch (error) {
            console.error(error);
            alert("Failed to cancel the booking. Please check console for details.");
        }
    };

    // Derived Dashboard Data
    const { popularMatches, recentBookings, stadiumOccupancy } = useMemo(() => {
        const ticketCounts = {};
        const stads = {};
        data.stadiums.forEach(s => stads[s.id] = s.capacity || 50000);

        data.tickets.forEach(t => {
            ticketCounts[t.match_id] = (ticketCounts[t.match_id] || 0) + 1;
        });

        const popularMatches = data.matches.map(m => ({
            ...m,
            ticketsSold: ticketCounts[m.id] || 0,
            capacity: stads[m.stadium_id] || 50000
        })).sort((a, b) => b.ticketsSold - a.ticketsSold).slice(0, 5);

        const stadiumOccupancy = popularMatches.map(m => ({
            name: `${m.home_team_name} vs ${m.away_team_name}`,
            sold: m.ticketsSold,
            total: m.capacity,
            percentage: Math.min(100, Math.round((m.ticketsSold / m.capacity) * 100)) || 0
        }));

        const recentBookings = [...data.tickets].sort((a, b) => new Date(b.created_at || b.match_date) - new Date(a.created_at || a.match_date)).slice(0, 5);

        return { popularMatches, recentBookings, stadiumOccupancy };
    }, [data]);

    return (
        <div className="page dashboard-page" id="admin-dashboard">
            <div className="page-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p className="text-muted">Overview of platform activity and revenue</p>
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading dashboard...</div>
            ) : (
                <>
                    <div className="stats-grid">
                        <div className="stat-card glass-card">
                            <div className="stat-icon">👥</div>
                            <div className="stat-value">{dbStats.total_users || 0}</div>
                            <div className="stat-label">Total Users</div>
                        </div>
                        <div className="stat-card glass-card" style={{ borderColor: 'rgba(99, 102, 241, 0.4)' }}>
                            <div className="stat-icon">🎫</div>
                            <div className="stat-value">{dbStats.total_bookings || 0}</div>
                            <div className="stat-label">Total Bookings</div>
                        </div>
                        <div className="stat-card glass-card text-green" style={{ background: 'linear-gradient(145deg, rgba(16,185,129,0.1) 0%, rgba(17,24,39,0.7) 100%)', borderColor: 'rgba(16,185,129,0.3)' }}>
                            <div className="stat-icon">💰</div>
                            <div className="stat-value">£{Number(dbStats.total_revenue || 0).toFixed(2)}</div>
                            <div className="stat-label">Total Revenue</div>
                        </div>
                        <div className="stat-card glass-card" style={{ borderColor: 'rgba(234, 179, 8, 0.4)' }}>
                            <div className="stat-icon">💺</div>
                            <div className="stat-value">{dbStats.seat_occupancy || 0}</div>
                            <div className="stat-label">Seat Occupancy</div>
                        </div>
                    </div>

                    <div className="dashboard-visuals-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>

                        {/* Match Popularity (Bar Chart equivalent) */}
                        <div className="glass-card">
                            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Most Popular Matches</h3>
                            {popularMatches.length === 0 ? <p className="text-muted">No ticket data yet.</p> : (
                                <div className="bar-chart-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {popularMatches.map(m => {
                                        const maxSold = popularMatches[0].ticketsSold || 1;
                                        const widthPercent = (m.ticketsSold / maxSold) * 100;
                                        return (
                                            <div key={m.id} className="chart-row">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                                                    <span>{m.home_team_name} vs {m.away_team_name}</span>
                                                    <span style={{ fontWeight: 'bold' }}>{m.ticketsSold} Sold</span>
                                                </div>
                                                <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${widthPercent}%`, height: '100%', background: 'var(--accent-gradient)', borderRadius: '6px', transition: 'width 1s ease-out' }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Seat Occupancy Progress */}
                        <div className="glass-card">
                            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Seat Occupancy Rates</h3>
                            {stadiumOccupancy.length === 0 ? <p className="text-muted">No occupancy data.</p> : (
                                <div className="occupancy-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                    {stadiumOccupancy.map((occ, idx) => (
                                        <div key={idx} className="progress-item">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                                                <span>{occ.name}</span>
                                                <span className={occ.percentage >= 90 ? 'text-green' : ''}>{occ.percentage}% Filled</span>
                                            </div>
                                            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                                                <div style={{
                                                    width: `${occ.percentage}%`,
                                                    height: '100%',
                                                    background: occ.percentage >= 90 ? '#ef4444' : occ.percentage >= 50 ? '#f59e0b' : '#10b981',
                                                    borderRadius: '4px',
                                                    transition: 'width 1s ease-out'
                                                }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="dashboard-bottom-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '2rem' }}>
                        {/* Recent Bookings Table */}
                        <div className="glass-card table-container">
                            <h3 style={{ marginBottom: '1rem' }}>Recent Bookings</h3>
                            {recentBookings.length === 0 ? <p className="text-muted">No recent bookings.</p> : (
                                <table className="data-table" style={{ width: '100%' }}>
                                    <thead>
                                        <tr>
                                            <th>Transaction ID</th>
                                            <th>Match</th>
                                            <th>Seat</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentBookings.map(b => (
                                            <tr key={b.ticket_id || b.transaction_id || Math.random()}>
                                                <td style={{ fontFamily: 'monospace', color: 'var(--accent-primary-hover)' }}>{b.transaction_id ? b.transaction_id.substring(0, 12) + '...' : 'N/A'}</td>
                                                <td style={{ fontWeight: '600' }}>{b.home_team || '—'} vs {b.away_team || '—'}</td>
                                                <td>{b.seat_type ? b.seat_type.toUpperCase() : 'STD'} {b.row_number ? `(R${b.row_number} S${b.seat_number})` : ''}</td>
                                                <td className="text-green" style={{ fontWeight: 'bold' }}>£{isNaN(parseFloat(b.amount)) ? '0.00' : parseFloat(b.amount).toFixed(2)}</td>
                                                <td>
                                                    <span style={{
                                                        padding: '0.2rem 0.5rem',
                                                        borderRadius: '4px',
                                                        fontSize: '0.8rem',
                                                        backgroundColor: b.booking_status === 'cancelled' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                                        color: b.booking_status === 'cancelled' ? '#f87171' : '#34d399'
                                                    }}>
                                                        {b.booking_status ? b.booking_status.toUpperCase() : 'CONFIRMED'}
                                                    </span>
                                                </td>
                                                <td className="text-muted">{new Date(b.created_at || b.match_date || Date.now()).toLocaleDateString()}</td>
                                                <td>
                                                    {b.booking_status !== 'cancelled' ? (
                                                        <button
                                                            onClick={() => handleCancelBooking(b.ticket_id)}
                                                            className="btn btn-sm"
                                                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", backgroundColor: "#ef4444", border: "none", color: "white" }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    ) : <span className="text-muted">-</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    <div className="admin-quick-actions">
                        <h2>Quick Actions</h2>
                        <div className="action-grid">
                            <Link to="/admin/matches" className="action-card glass-card" id="admin-manage-matches">
                                <span className="action-icon">📋</span>
                                <span className="action-label">Manage Matches</span>
                            </Link>
                            <Link to="/admin/teams" className="action-card glass-card" id="admin-manage-teams">
                                <span className="action-icon">👥</span>
                                <span className="action-label">Manage Teams</span>
                            </Link>
                            <Link to="/admin/stadiums" className="action-card glass-card" id="admin-manage-stadiums">
                                <span className="action-icon">🏟️</span>
                                <span className="action-label">Manage Stadiums</span>
                            </Link>
                        </div>

                        {/* Database Manager Links */}
                        <h2 style={{ marginTop: '2rem' }}>Database Management</h2>
                        <div className="action-grid" style={{ marginTop: '1rem' }}>
                            <Link to="/admin/database" className="action-card glass-card" id="admin-db-manager">
                                <span className="action-icon">🗄️</span>
                                <span className="action-label">Database Manager</span>
                            </Link>
                            <Link to="/admin/search" className="action-card glass-card" id="admin-db-search">
                                <span className="action-icon">🔍</span>
                                <span className="action-label">Global Search</span>
                            </Link>
                            <Link to="/admin/sql-console" className="action-card glass-card" id="admin-sql-console-link">
                                <span className="action-icon">💻</span>
                                <span className="action-label">SQL Console</span>
                            </Link>
                        </div>
                    </div>
                </>
            )
            }
            <style jsx="true">{`
                .text-green { color: #10b981; }
            `}</style>
        </div >
    );
}
