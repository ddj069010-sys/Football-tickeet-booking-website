// ─── Manage Teams (Admin) ───
import { useState, useEffect } from 'react';
import { getTeams, createTeam, updateTeam, deleteTeam } from '../services/api';

export default function ManageTeams() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ team_name: '', coach_name: '' });

    const loadTeams = async () => {
        try {
            const res = await getTeams();
            setTeams(res.data.teams);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadTeams(); }, []);

    const resetForm = () => {
        setForm({ team_name: '', coach_name: '' });
        setEditingId(null);
        setShowForm(false);
        setError('');
    };

    const handleEdit = (team) => {
        setForm({ team_name: team.team_name, coach_name: team.coach_name || '' });
        setEditingId(team.id);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editingId) {
                await updateTeam(editingId, form);
            } else {
                await createTeam(form);
            }
            resetForm();
            loadTeams();
        } catch (err) {
            setError(err.response?.data?.error || 'Operation failed.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this team? This will fail if the team has matches.')) return;
        try {
            await deleteTeam(id);
            loadTeams();
        } catch (err) {
            setError(err.response?.data?.error || 'Delete failed.');
        }
    };

    return (
        <div className="page" id="manage-teams-page">
            <div className="page-header">
                <h1>Manage Teams</h1>
                <button
                    className="btn btn-primary"
                    id="add-team-btn"
                    onClick={() => { resetForm(); setShowForm(true); }}
                >
                    + Add Team
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {showForm && (
                <div className="form-card glass-card">
                    <h3>{editingId ? 'Edit Team' : 'Create New Team'}</h3>
                    <form onSubmit={handleSubmit} className="admin-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Team Name</label>
                                <input
                                    type="text"
                                    value={form.team_name}
                                    onChange={(e) => setForm({ ...form, team_name: e.target.value })}
                                    placeholder="e.g. Manchester United"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Coach Name</label>
                                <input
                                    type="text"
                                    value={form.coach_name}
                                    onChange={(e) => setForm({ ...form, coach_name: e.target.value })}
                                    placeholder="e.g. Erik ten Hag"
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Create'}</button>
                            <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="loading">Loading teams...</div>
            ) : (
                <div className="table-container glass-card">
                    <table className="data-table" id="teams-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Team Name</th>
                                <th>Coach</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teams.map((t) => (
                                <tr key={t.id}>
                                    <td>{t.id}</td>
                                    <td>{t.team_name}</td>
                                    <td>{t.coach_name || '—'}</td>
                                    <td className="action-btns">
                                        <button className="btn btn-sm btn-outline" onClick={() => handleEdit(t)}>Edit</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(t.id)}>Delete</button>
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
