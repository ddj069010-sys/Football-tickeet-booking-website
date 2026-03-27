// ─── Admin Activity Log Page ───
import { useState, useEffect, useMemo } from 'react';
import { adminAPI } from '../services/api';

export default function AdminActivity() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const response = await adminAPI.getAdminActivity();
                // adminController returns { activity: [...] }
                const items = response.data?.activity || response.data?.activities || [];
                setActivities(items);
            } catch (err) {
                console.error('Error fetching activity logs:', err);
                setError('Failed to load activity feed.');
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
        const interval = setInterval(fetchActivity, 15000);
        return () => clearInterval(interval);
    }, []);

    const filteredActivities = useMemo(() => {
        if (filter === 'All') return activities;
        return activities.filter(a => {
            const action = (a.action_type || a.action || a.description || '').toLowerCase();
            if (filter === 'Bookings' || filter === 'Payments') return action.includes('payment') || action.includes('booking');
            if (filter === 'Cancellations') return action.includes('cancel');
            if (filter === 'Logins') return action.includes('login');
            return true;
        });
    }, [activities, filter]);

    const filters = ['All', 'Bookings', 'Payments', 'Cancellations', 'Logins'];

    if (loading && activities.length === 0) {
        return <div className="loading-screen" style={{ color: "white" }}>Loading Live Activity Feed...</div>;
    }

    return (
        <div className="admin-dashboard container" style={{ color: "white", padding: "2rem" }}>
            <h1 style={{ marginBottom: "0.5rem" }}>Live Activity Dashboard</h1>
            <p style={{ color: "#a1a1aa", marginBottom: "2rem" }}>Monitor platform engagement and transactional activity in real-time.</p>

            {error && <div className="error-message" style={{ backgroundColor: "#ef4444", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>{error}</div>}

            <div className="filter-panel" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {filters.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            border: `1px solid ${filter === f ? '#8b5cf6' : '#3f3f46'}`,
                            backgroundColor: filter === f ? '#8b5cf6' : 'transparent',
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="table-responsive" style={{
                backgroundColor: "#18181b",
                borderRadius: "12px",
                padding: "1rem",
                overflowX: "auto"
            }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid #3f3f46" }}>
                            <th style={{ padding: "1rem", color: "#a1a1aa" }}>Timestamp</th>
                            <th style={{ padding: "1rem", color: "#a1a1aa" }}>User</th>
                            <th style={{ padding: "1rem", color: "#a1a1aa" }}>Action</th>
                            <th style={{ padding: "1rem", color: "#a1a1aa" }}>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredActivities.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ padding: "2rem", textAlign: "center", color: "#a1a1aa" }}>
                                    No activity logs found for the selected filter.
                                </td>
                            </tr>
                        ) : (
                            filteredActivities.map((log) => (
                                <tr key={log.id} style={{ borderBottom: "1px solid #27272a", transition: "background-color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#27272a'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td style={{ padding: "1rem" }}>
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <div style={{ fontWeight: "bold" }}>{log.user_name}</div>
                                        <div style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>{log.user_email}</div>
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <span style={{
                                            padding: "0.25rem 0.5rem",
                                            borderRadius: "4px",
                                            fontSize: "0.85rem",
                                            backgroundColor:
                                                log.action.includes('success') || log.action.includes('login') ? 'rgba(16, 185, 129, 0.2)' :
                                                    log.action.includes('failure') || log.action.includes('cancellation') ? 'rgba(239, 68, 68, 0.2)' :
                                                        'rgba(139, 92, 246, 0.2)',
                                            color:
                                                log.action.includes('success') || log.action.includes('login') ? '#34d399' :
                                                    log.action.includes('failure') || log.action.includes('cancellation') ? '#f87171' :
                                                        '#a78bfa'
                                        }}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1rem", color: "#e4e4e7" }}>{log.details}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    );
}
