import { useState, useEffect } from 'react';
import API from '../services/api';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionMsg, setActionMsg] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await API.get('/admin/users');
            setUsers(res.data.users || []);
        } catch (err) {
            setError('Failed to load users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            await API.patch(`/admin/users/${userId}/status`, { is_active: !currentStatus });
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
            setActionMsg(`User ${!currentStatus ? 'enabled' : 'disabled'} successfully.`);
            setTimeout(() => setActionMsg(''), 3000);
        } catch {
            setActionMsg('Action failed. Please try again.');
        }
    };

    const handleMembership = async (userId, membership_type) => {
        try {
            await API.patch(`/admin/users/${userId}/membership`, { membership_type });
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, membership_type } : u));
            setActionMsg(`Membership updated to ${membership_type}.`);
            setTimeout(() => setActionMsg(''), 3000);
        } catch {
            setActionMsg('Action failed. Please try again.');
        }
    };

    const membershipColor = { regular: '#a1a1aa', vip: '#3b82f6', vvip: '#8b5cf6' };

    if (loading) return <div style={{ color: 'white', padding: '2rem' }}>Loading users...</div>;

    return (
        <div style={{ color: 'white', padding: '2rem' }}>
            <h1 style={{ marginBottom: '0.5rem' }}>👥 User Control Panel</h1>
            <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>Manage user accounts, memberships, and access.</p>

            {error && <div style={{ background: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
            {actionMsg && <div style={{ background: '#10b981', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{actionMsg}</div>}

            <div style={{ background: '#18181b', borderRadius: '12px', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #3f3f46' }}>
                            {['User', 'Bookings', 'Total Spent', 'Last Login', 'Membership', 'Status', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '1rem', color: '#a1a1aa', textAlign: 'left', fontSize: '0.85rem' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#a1a1aa' }}>No users found.</td></tr>
                        ) : users.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #27272a' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#27272a'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: 'bold' }}>{u.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>{u.email}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>{u.total_bookings || 0}</td>
                                <td style={{ padding: '1rem', color: '#34d399', fontWeight: 'bold' }}>£{parseFloat(u.total_spent || 0).toFixed(2)}</td>
                                <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#a1a1aa' }}>
                                    {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', background: `${membershipColor[u.membership_type]}22`, color: membershipColor[u.membership_type] }}>
                                        {(u.membership_type || 'regular').toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', background: u.is_active ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: u.is_active ? '#34d399' : '#f87171' }}>
                                        {u.is_active ? 'Active' : 'Disabled'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <button onClick={() => handleToggleStatus(u.id, u.is_active)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px', border: 'none', cursor: 'pointer', background: u.is_active ? '#ef4444' : '#10b981', color: 'white' }}>
                                            {u.is_active ? 'Disable' : 'Enable'}
                                        </button>
                                        <select onChange={e => e.target.value && handleMembership(u.id, e.target.value)} defaultValue="" style={{ padding: '0.3rem', fontSize: '0.75rem', borderRadius: '4px', background: '#3f3f46', color: 'white', border: 'none', cursor: 'pointer' }}>
                                            <option value="">Membership ▾</option>
                                            <option value="regular">Regular</option>
                                            <option value="vip">VIP</option>
                                            <option value="vvip">VVIP</option>
                                        </select>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
