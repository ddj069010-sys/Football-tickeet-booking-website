const express = require('express');
const router = express.Router();
const {
    getDatabaseAnalytics,
    getAllUsers, deleteUser, updateUserStatus, updateUserMembership,
    getAllTickets, cancelTicket,
    getActivityLog, getRevenueReport, getLiveBookings,
    executeSQL,
    getDbView,
    searchEntity
} = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// All admin routes require token + admin role
router.use(verifyToken, isAdmin);

// Analytics & Reports
router.get('/analytics/database', getDatabaseAnalytics);
router.get('/reports/revenue', getRevenueReport);
router.get('/bookings/live', getLiveBookings);

// User management
router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/users/:id/membership', updateUserMembership);
router.delete('/users/:id', deleteUser);

// Tickets
router.get('/tickets', getAllTickets);
router.put('/tickets/:id/cancel', cancelTicket);

// Activity
router.get('/activity', getActivityLog);

// SQL Console
router.post('/sql', executeSQL);

// Database Manager Views (Phase 10)
router.get('/database/users', getDbView('users'));
router.get('/database/matches', getDbView('matches'));
router.get('/database/stadiums', getDbView('stadiums'));
router.get('/database/tickets', getDbView('tickets'));
router.get('/database/payments', getDbView('payments'));
router.get('/database/seats', getDbView('seats'));
router.get('/database/teams', getDbView('teams'));

// Search (Phase 10)
router.get('/search/users', searchEntity('users', ['name', 'email']));
router.get('/search/matches', searchEntity('matches', ['id'])); // Could join teams later
router.get('/search/stadiums', searchEntity('stadiums', ['name', 'location']));
router.get('/search/tickets', searchEntity('tickets', ['id']));

module.exports = router;

