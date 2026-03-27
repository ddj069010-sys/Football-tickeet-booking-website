// ─── Ticket Routes ───
const express = require('express');
const router = express.Router();
const { bookTicket, getMyTickets, getAllTickets } = require('../controllers/ticketController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { withActivityLog } = require('../middleware/activityLogger');

router.post('/book', verifyToken, withActivityLog('BOOKING', bookTicket));
router.post('/', verifyToken, withActivityLog('BOOKING', bookTicket)); // Keep for backwards compatibility
router.get('/my', verifyToken, getMyTickets);
router.get('/', verifyToken, isAdmin, getAllTickets);

module.exports = router;
