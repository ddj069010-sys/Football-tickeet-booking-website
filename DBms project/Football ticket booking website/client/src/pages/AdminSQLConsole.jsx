import { useState } from 'react';
import { adminDBAPI } from '../services/api';

export default function AdminSQLConsole() {
    const [query, setQuery] = useState('SELECT * FROM users LIMIT 10;');
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRunQuery = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setError('');
        setResults(null);
        try {
            const res = await adminDBAPI.executeSQL(query);
            // res.data could be an array of rows or an object
            if (Array.isArray(res.data)) {
                setResults(res.data);
            } else {
                setResults([res.data]);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'SQL Execution failed.');
        } finally {
            setLoading(false);
        }
    };

    const renderTable = () => {
        if (!results) return null;
        if (results.length === 0) return <div className="mt-20">Query executed successfully. 0 rows returned.</div>;

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
                                        cellVal = JSON.stringify(cellVal);
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
        <div className="page" id="admin-sql-console">
            <div className="page-header">
                <h1>SQL Admin Console</h1>
                <p>Execute custom queries against the database (Restricted Mode).</p>
            </div>

            <div className="form-card glass-card mt-20">
                <textarea
                    className="sql-editor"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    rows="8"
                    placeholder="Enter SQL Query..."
                    spellCheck="false"
                ></textarea>
                <div className="form-actions mt-20">
                    <button className="btn btn-primary" onClick={handleRunQuery} disabled={loading}>
                        {loading ? 'Executing...' : 'Run Query'}
                    </button>
                    <button className="btn btn-outline" onClick={() => setQuery('')}>Clear</button>
                </div>
            </div>

            {error && <div className="alert alert-error mt-20">{error}</div>}

            {renderTable()}

            <style jsx="true">{`
                .sql-editor {
                    width: 100%;
                    background: #1e1e1e;
                    color: #569cd6;
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 16px;
                    padding: 15px;
                    border-radius: 8px;
                    border: 1px solid #333;
                    outline: none;
                    resize: vertical;
                }
                .sql-editor:focus { border-color: var(--primary-color); }
                .mt-20 { margin-top: 20px; }
                .mb-20 { margin-bottom: 20px; }
            `}</style>
        </div>
    );
}
