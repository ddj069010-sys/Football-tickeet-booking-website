import { useState } from 'react';
import { adminDBAPI } from '../services/api';

export default function AdminSearch() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('users');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        setError('');
        try {
            let res;
            if (searchType === 'users') res = await adminDBAPI.searchUsers(searchTerm);
            else if (searchType === 'matches') res = await adminDBAPI.searchMatches(searchTerm);
            else if (searchType === 'tickets') res = await adminDBAPI.searchTickets(searchTerm);
            else if (searchType === 'stadiums') res = await adminDBAPI.searchStadiums(searchTerm);

            setResults(res?.data || []);
        } catch (err) {
            setError('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderTable = () => {
        if (!results) return null;
        if (results.length === 0) return <div className="mt-20">No matching records found.</div>;

        const keys = Object.keys(results[0]);
        return (
            <div className="table-container glass-card mt-20 mb-20">
                <table className="data-table">
                    <thead>
                        <tr>{keys.map(k => <th key={k}>{k}</th>)}</tr>
                    </thead>
                    <tbody>
                        {results.map((row, i) => (
                            <tr key={i}>
                                {keys.map(k => {
                                    let cellVal = row[k];
                                    if (cellVal !== null && typeof cellVal === 'object') {
                                        if (cellVal instanceof Date || String(cellVal).includes('T00:')) {
                                            cellVal = new Date(cellVal).toLocaleString();
                                        } else {
                                            cellVal = JSON.stringify(cellVal);
                                        }
                                    }
                                    if (typeof cellVal === 'boolean') {
                                        cellVal = cellVal ? 'Yes' : 'No';
                                    }
                                    return <td key={k}>{String(cellVal)}</td>;
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="page" id="admin-search-page">
            <div className="page-header">
                <h1>Global Database Search</h1>
                <p>Search across Users, Matches, Tickets, and Stadiums instantly.</p>
            </div>

            <div className="form-card glass-card mt-20">
                <form onSubmit={handleSearch} className="admin-form" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div className="form-group" style={{ flex: '1', margin: 0 }}>
                        <input
                            type="text"
                            placeholder={`Search ${searchType}... (e.g. Email, Name, Transaction ID)`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                            style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', fontSize: '1rem' }}
                        />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <select
                            value={searchType}
                            onChange={(e) => { setSearchType(e.target.value); setResults(null); }}
                            style={{ padding: '12px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: '#1c2331', color: 'white', fontSize: '1rem', cursor: 'pointer' }}
                        >
                            <option value="users">Users</option>
                            <option value="matches">Matches</option>
                            <option value="tickets">Tickets</option>
                            <option value="stadiums">Stadiums</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '12px 25px' }} disabled={loading}>
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>
            </div>

            {error && <div className="alert alert-error mt-20">{error}</div>}

            {renderTable()}

            <style jsx="true">{`
                .mt-20 { margin-top: 20px; }
                .mb-20 { margin-bottom: 20px; }
            `}</style>
        </div>
    );
}
