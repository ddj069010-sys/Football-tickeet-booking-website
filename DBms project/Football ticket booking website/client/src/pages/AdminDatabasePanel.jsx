import { useState, useEffect } from 'react';
import { adminDBAPI } from '../services/api';

export default function AdminDatabasePanel() {
    const [activeTab, setActiveTab] = useState('users');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadData = async () => {
        try {
            setLoading(true);
            setError('');
            let res;
            if (activeTab === 'users') res = await adminDBAPI.getUsers();
            if (activeTab === 'matches') res = await adminDBAPI.getMatches();
            if (activeTab === 'stadiums') res = await adminDBAPI.getStadiums();
            if (activeTab === 'tickets') res = await adminDBAPI.getTickets();
            if (activeTab === 'payments') res = await adminDBAPI.getPayments();
            if (activeTab === 'seats') res = await adminDBAPI.getSeats();

            setData(res?.data || []);
        } catch (err) {
            console.error('Failed to load data:', err);
            setError('Failed to fetch data from the server.');
        } finally {
            setLoading(false);
        }
    };

    // Auto-refresh via polling every 10 seconds
    useEffect(() => {
        loadData();
        const interval = setInterval(() => {
            loadData();
        }, 10000);
        return () => clearInterval(interval);
    }, [activeTab]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this record (ID: " + id + ") ?")) return;
        try {
            if (activeTab === 'users') await adminDBAPI.deleteUser(id);
            if (activeTab === 'matches') await adminDBAPI.deleteMatch(id);
            if (activeTab === 'stadiums') await adminDBAPI.deleteStadium(id);

            // Reload after deletion
            loadData();
        } catch (err) {
            alert(err.response?.data?.message || 'Delete operation failed. Check foreign key constraints.');
        }
    };

    // Render table headers dynamically based on data keys
    const renderHeaders = () => {
        if (!data || data.length === 0) return <tr><th>No data found</th></tr>;
        const keys = Object.keys(data[0]);
        return (
            <tr>
                {keys.map((key) => <th key={key}>{key}</th>)}
                {['users', 'matches', 'stadiums'].includes(activeTab) && <th>Actions</th>}
            </tr>
        );
    };

    // Render table rows
    const renderRows = () => {
        if (!data || data.length === 0) return <tr><td>-</td></tr>;
        const keys = Object.keys(data[0]);
        return data.map((item, index) => (
            <tr key={item.id || index}>
                {keys.map((key) => {
                    let cellVal = item[key];
                    if (cellVal !== null && typeof cellVal === 'object') {
                        // Handle Date tracking
                        cellVal = new Date(cellVal).toLocaleString();
                    } else if (typeof cellVal === 'boolean') {
                        cellVal = cellVal ? 'Yes' : 'No';
                    }
                    return <td key={key}>{cellVal}</td>;
                })}
                {['users', 'matches', 'stadiums'].includes(activeTab) && (
                    <td className="action-btns">
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>Delete</button>
                    </td>
                )}
            </tr>
        ));
    };

    return (
        <div className="page" id="admin-db-panel">
            <div className="page-header">
                <h1>Database Manager</h1>
                <p>Manage raw database records for table: <strong>{activeTab.toUpperCase()}</strong></p>
            </div>

            <div className="tab-container mt-20">
                <div className="tabs">
                    {['users', 'matches', 'stadiums', 'tickets', 'payments', 'seats'].map(tab => (
                        <button
                            key={tab}
                            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {error && <div className="alert alert-error mt-20">{error}</div>}

            <div className="table-container glass-card mt-20 mb-20">
                {loading && data.length === 0 ? (
                    <div className="loading">Loading database records...</div>
                ) : (
                    <table className="data-table">
                        <thead>{renderHeaders()}</thead>
                        <tbody>{renderRows()}</tbody>
                    </table>
                )}
            </div>

            <div className="syllabus-integration glass-card mt-20">
                <h3>DBMS Syllabus Compliance</h3>
                <div className="syllabus-grid">
                    <div className="syllabus-item">
                        <span className="topic-badge">1. Introduction</span>
                        <p><strong>Relational Model:</strong> Proper use of primary/foreign keys, constraints, and data abstraction via Views (<code>v_AvailableMatches</code>).</p>
                    </div>
                    <div className="syllabus-item">
                        <span className="topic-badge">2. Query Languages</span>
                        <p><strong>Triggers:</strong> <code>after_match_insert</code> automatically populates the <code>seats</code> table (Dynamic Allocation).</p>
                        <p><strong>Procedures:</strong> <code>sp_BookTicket</code> encapsulates complex booking logic for atomicity.</p>
                    </div>
                    <div className="syllabus-item">
                        <span className="topic-badge">3. Design</span>
                        <p><strong>Normalization:</strong> Database schema follows <strong>3NF</strong> principles (Users, Teams, Stadiums, Matches, Seats, Payments, Tickets).</p>
                    </div>
                    <div className="syllabus-item">
                        <span className="topic-badge">4. Transactions</span>
                        <p><strong>ACID:</strong> Formal SQL <strong>TRANSACTIONS</strong> (Start, Commit, Rollback) used in booking to prevent race conditions.</p>
                    </div>
                    <div className="syllabus-item">
                        <span className="topic-badge">5. Storage</span>
                        <p><strong>Indices:</strong> B+ Tree indices applied to <code>match_date</code>, <code>match_id</code>, and <code>user_id</code> for O(log n) search performance.</p>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                .tab-container { border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 20px; }
                .tabs { display: flex; gap: 10px; }
                .tab-btn { background: rgba(255,255,255,0.05); border: none; color: white; padding: 10px 20px; cursor: pointer; border-radius: 8px 8px 0 0; font-weight: 500;}
                .tab-btn:hover { background: rgba(255,255,255,0.1); }
                .tab-btn.active { background: #6366f1; border-bottom: 2px solid #818cf8; }
                .mt-20 { margin-top: 20px; }
                .mb-20 { margin-bottom: 20px; }
                .data-table th { white-space: nowrap; }
                .syllabus-integration { padding: 20px; border-left: 4px solid #6366f1; }
                .syllabus-integration h3 { margin-top: 0; color: #818cf8; font-size: 1.2rem; margin-bottom: 15px; }
                .syllabus-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px; }
                .syllabus-item { background: rgba(255,255,255,0.03); padding: 15px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05); }
                .topic-badge { background: #6366f1; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; display: inline-block; margin-bottom: 8px; }
                .syllabus-item p { margin: 0; font-size: 0.85rem; color: #d1d5db; line-height: 1.4; }
                .syllabus-item code { color: #818cf8; background: rgba(0,0,0,0.3); padding: 1px 4px; border-radius: 3px; }
            `}</style>
        </div>
    );
}
