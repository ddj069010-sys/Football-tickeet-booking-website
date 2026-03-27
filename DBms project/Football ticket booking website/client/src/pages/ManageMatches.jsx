// ─── Manage Matches (Admin) ───
import { useState, useEffect } from 'react';
import { matchAPI, teamAPI, stadiumAPI } from '../services/api';

export default function ManageMatches() {
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [stadiums, setStadiums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        home_team_id: '', away_team_id: '', match_date: '', stadium_id: '', base_ticket_price: 50, total_seats: 500
    });

    const loadData = async () => {
        try {
            const [matchRes, teamRes, stadiumRes] = await Promise.all([
                matchAPI.getMatches(),
                teamAPI.getTeams(),
                stadiumAPI.getAllStadiums()
            ]);
            setMatches(matchRes.data.matches);
            setTeams(teamRes.data.teams);
            setStadiums(stadiumRes.data.stadiums);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const resetForm = () => {
        setForm({ home_team_id: '', away_team_id: '', match_date: '', stadium_id: '', base_ticket_price: 50, total_seats: 500 });
        setShowForm(false);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const payload = {
                ...form,
                home_team_id: parseInt(form.home_team_id),
                away_team_id: parseInt(form.away_team_id),
                stadium_id: parseInt(form.stadium_id),
                base_ticket_price: parseFloat(form.base_ticket_price)
            };
            await matchAPI.createMatch(payload);
            resetForm();
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Operation failed.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this match? All associated tickets will also be deleted.')) return;
        try {
            await matchAPI.deleteMatch(id);
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Delete failed.');
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="page" id="manage-matches-page">
            <div className="page-header">
                <h1>Manage Matches</h1>
                <button
                    className="btn btn-primary"
                    id="add-match-btn"
                    onClick={() => { resetForm(); setShowForm(true); }}
                >
                    + Add Match
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {showForm && (
                <div className="form-card glass-card">
                    <h3>Create New Match</h3>
                    <form onSubmit={handleSubmit} className="admin-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Home Team</label>
                                <select value={form.home_team_id} onChange={(e) => setForm({ ...form, home_team_id: e.target.value })} required>
                                    <option value="">Select team...</option>
                                    {teams.map((t) => <option key={t.id} value={t.id}>{t.team_name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Away Team</label>
                                <select value={form.away_team_id} onChange={(e) => setForm({ ...form, away_team_id: e.target.value })} required>
                                    <option value="">Select team...</option>
                                    {teams.map((t) => <option key={t.id} value={t.id}>{t.team_name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Stadium</label>
                                <select value={form.stadium_id} onChange={(e) => {
                                    const sId = parseInt(e.target.value);
                                    const s = stadiums.find(st => st.id === sId);
                                    setForm({ ...form, stadium_id: e.target.value, total_seats: s ? s.total_rows * s.seats_per_row : 500 });
                                }} required>
                                    <option value="">Select stadium...</option>
                                    {stadiums.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.location}) - Max Capacity: {s.total_rows * s.seats_per_row}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Match Date & Time</label>
                                <input type="datetime-local" value={form.match_date} onChange={(e) => setForm({ ...form, match_date: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Base Ticket Price (£)</label>
                                <input type="number" step="0.01" value={form.base_ticket_price} onChange={(e) => setForm({ ...form, base_ticket_price: e.target.value })} min="0" required />
                                <small>VIP/VVIP seats will auto-scale from this.</small>
                            </div>
                            <div className="form-group">
                                <label>Total Seats to Generate</label>
                                <input 
                                    type="number" 
                                    value={form.total_seats} 
                                    onChange={(e) => setForm({ ...form, total_seats: e.target.value })} 
                                    min="1" 
                                    required 
                                />
                                <small>Individual seat records will be auto-generated.</small>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">Create Match</button>
                            <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="loading">Loading matches...</div>
            ) : (
                <div className="table-container glass-card">
                    <table className="data-table" id="matches-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Match</th>
                                <th>Date</th>
                                <th>Stadium</th>
                                <th>Seats Status</th>
                                <th>Base Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matches.map((m) => (
                                <tr key={m.id}>
                                    <td>{m.id}</td>
                                    <td>{m.home_team_name} vs {m.away_team_name}</td>
                                    <td>{formatDate(m.match_date)}</td>
                                    <td>{m.stadium_name} ({m.stadium_location})</td>
                                    <td>{m.available_seats}/{m.total_seats}</td>
                                    <td>£{parseFloat(m.base_ticket_price).toFixed(2)}</td>
                                    <td className="action-btns">
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(m.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
