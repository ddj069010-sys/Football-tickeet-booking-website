// ─── Manage Stadiums (Admin) ───
import { useState, useEffect } from 'react';
import { stadiumAPI } from '../services/api';

export default function ManageStadiums() {
    const [stadiums, setStadiums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: '', location: '', total_rows: 10, seats_per_row: 20 });

    const loadData = async () => {
        try {
            const res = await stadiumAPI.getAllStadiums();
            setStadiums(res.data.stadiums);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const resetForm = () => {
        setForm({ name: '', location: '', total_rows: 10, seats_per_row: 20 });
        setEditingId(null);
        setShowForm(false);
        setError('');
    };

    const handleEdit = (stadium) => {
        setForm({
            name: stadium.name,
            location: stadium.location,
            total_rows: stadium.total_rows,
            seats_per_row: stadium.seats_per_row
        });
        setEditingId(stadium.id);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const payload = { ...form, total_rows: parseInt(form.total_rows), seats_per_row: parseInt(form.seats_per_row) };
            if (editingId) {
                await stadiumAPI.updateStadium(editingId, payload);
            } else {
                await stadiumAPI.createStadium(payload);
            }
            resetForm();
            loadData();
        } catch (err) {
            setError(err.response?.data?.error || 'Operation failed.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this stadium? All associated matches will also be affected.')) return;
        try {
            await stadiumAPI.deleteStadium(id);
            loadData();
        } catch (err) {
            setError(err.response?.data?.error || 'Delete failed. Ensure no matches are linked.');
        }
    };

    return (
        <div className="page" id="manage-stadiums-page">
            <div className="page-header">
                <h1>Manage Stadiums</h1>
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
                    + Add Stadium
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {showForm && (
                <div className="form-card glass-card">
                    <h3>{editingId ? 'Edit Stadium' : 'Create New Stadium'}</h3>
                    <form onSubmit={handleSubmit} className="admin-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Stadium Name</label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Total Rows</label>
                                <input type="number" value={form.total_rows} onChange={(e) => setForm({ ...form, total_rows: e.target.value })} min="1" required />
                                <small>Rows 1-2 will automatically be created as VVIP, 3-5 as VIP.</small>
                            </div>
                            <div className="form-group">
                                <label>Seats per Row</label>
                                <input type="number" value={form.seats_per_row} onChange={(e) => setForm({ ...form, seats_per_row: e.target.value })} min="1" required />
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
                <div className="loading">Loading stadiums...</div>
            ) : (
                <div className="table-container glass-card">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Location</th>
                                <th>Rows</th>
                                <th>Seats/Row</th>
                                <th>Total Capacity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stadiums.map((s) => (
                                <tr key={s.id}>
                                    <td>{s.id}</td>
                                    <td>{s.name}</td>
                                    <td>{s.location}</td>
                                    <td>{s.total_rows}</td>
                                    <td>{s.seats_per_row}</td>
                                    <td>{s.total_rows * s.seats_per_row}</td>
                                    <td className="action-btns">
                                        <button className="btn btn-sm btn-outline" onClick={() => handleEdit(s)}>Edit</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.id)}>Delete</button>
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
