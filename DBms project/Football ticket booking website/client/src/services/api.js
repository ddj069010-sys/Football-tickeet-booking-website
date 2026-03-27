// ─── Centralized Axios API Service ───
import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5050/api'
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Auth ──
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/auth/profile');
export const switchRole = (data) => API.post('/auth/switch-role', data);

export const authAPI = {
    register: registerUser,
    loginUser,
    getProfile,
    switchRole,
};

// ── Teams ──
export const getTeams = () => API.get('/teams');
export const getTeam = (id) => API.get(`/teams/${id}`);
export const createTeam = (data) => API.post('/teams', data);
export const updateTeam = (id, data) => API.put(`/teams/${id}`, data);
export const deleteTeam = (id) => API.delete(`/teams/${id}`);

export const teamAPI = {
    getTeams,
    getTeam,
    createTeam,
    updateTeam,
    deleteTeam,
};

// ── Matches ──
export const getMatches = () => API.get('/matches');
export const getMatch = (id) => API.get(`/matches/${id}`);
export const createMatch = (data) => API.post('/matches', data);
export const updateMatch = (id, data) => API.put(`/matches/${id}`, data);
export const deleteMatch = (id) => API.delete(`/matches/${id}`);
export const getMatchSeats = (id) => API.get(`/matches/${id}/seats`);

export const matchAPI = {
    getMatches,
    getMatch,
    createMatch,
    updateMatch,
    deleteMatch,
    getMatchSeats,
};

// ── Stadiums ──
export const getAllStadiums = () => API.get('/stadiums');
export const getStadiumById = (id) => API.get(`/stadiums/${id}`);
export const createStadium = (data) => API.post('/stadiums', data);
export const updateStadium = (id, data) => API.put(`/stadiums/${id}`, data);
export const deleteStadium = (id) => API.delete(`/stadiums/${id}`);

export const stadiumAPI = {
    getAllStadiums,
    getStadiumById,
    createStadium,
    updateStadium,
    deleteStadium,
};

// ── Tickets ──
export const bookTicket = (data) => API.post('/tickets/book', data);
export const getMyTickets = () => API.get('/users/me/tickets');
export const getAllTickets = () => API.get('/tickets');

export const ticketAPI = {
    bookTicket,
    getMyTickets,
    getAllTickets,
};

// ── Admin ──
export const getAdminActivity = () => API.get('/admin/activity');
export const cancelTicket = (id) => API.put(`/admin/tickets/${id}/cancel`);
export const getAdminUsers = () => API.get('/admin/users');
export const setUserStatus = (id, is_active) => API.patch(`/admin/users/${id}/status`, { is_active });
export const setUserMembership = (id, membership_type) => API.patch(`/admin/users/${id}/membership`, { membership_type });
export const getLiveBookings = () => API.get('/admin/bookings/live');
export const getRevenueReport = () => API.get('/admin/reports/revenue');
export const getSeatHeatmap = (matchId) => API.get(`/admin/reports/heatmap/${matchId}`);
export const setMatchStatus = (id, status) => API.patch(`/admin/matches/${id}/status`, { status });
export const bulkUnlockRow = (matchId, rowLabel) => API.post(`/admin/matches/${matchId}/rows/${rowLabel}/unlock`);

export const adminAPI = {
    getAdminActivity,
    cancelTicket,
    getAdminUsers,
    setUserStatus,
    setUserMembership,
    getLiveBookings,
    getRevenueReport,
    getSeatHeatmap,
    setMatchStatus,
    bulkUnlockRow,
};

// ── Notifications ──
export const getNotifications = () => API.get('/notifications');
export const markNotificationRead = (id) => API.patch(`/notifications/${id}/read`);

export const notificationAPI = {
    getNotifications,
    markNotificationRead,
};

// ── Admin Database Management (Phase 10) ──
export const adminDBAPI = {
    // Views
    getUsers: () => API.get('/admin/database/users'),
    getMatches: () => API.get('/admin/database/matches'),
    getStadiums: () => API.get('/admin/database/stadiums'),
    getTickets: () => API.get('/admin/database/tickets'),
    getPayments: () => API.get('/admin/database/payments'),
    getSeats: () => API.get('/admin/database/seats'),

    // Search
    searchUsers: (q) => API.get(`/admin/search/users?q=${encodeURIComponent(q)}`),
    searchMatches: (q) => API.get(`/admin/search/matches?q=${encodeURIComponent(q)}`),
    searchTickets: (q) => API.get(`/admin/search/tickets?q=${encodeURIComponent(q)}`),
    searchStadiums: (q) => API.get(`/admin/search/stadiums?q=${encodeURIComponent(q)}`),

    // CRUD (Users)
    createUser: (data) => API.post('/admin/database/users', data),
    updateUser: (id, data) => API.put(`/admin/database/users/${id}`, data),
    deleteUser: (id) => API.delete(`/admin/database/users/${id}`),

    // CRUD (Matches)
    createMatch: (data) => API.post('/admin/database/matches', data),
    updateMatch: (id, data) => API.put(`/admin/database/matches/${id}`, data),
    deleteMatch: (id) => API.delete(`/admin/database/matches/${id}`),

    // CRUD (Stadiums)
    createStadium: (data) => API.post('/admin/database/stadiums', data),
    updateStadium: (id, data) => API.put(`/admin/database/stadiums/${id}`, data),
    deleteStadium: (id) => API.delete(`/admin/database/stadiums/${id}`),

    // SQL Console & Analytics
    executeSQL: (query) => API.post('/admin/sql', { query }),
    getAnalytics: () => API.get('/admin/analytics/database'),
};

export default API;
