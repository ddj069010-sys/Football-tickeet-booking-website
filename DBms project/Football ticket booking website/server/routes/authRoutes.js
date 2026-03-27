// ─── Auth Routes ───
const express = require('express');
const router = express.Router();
const { register, login, getProfile, switchRole } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { withActivityLog } = require('../middleware/activityLogger');

router.post('/register', withActivityLog('AUTH', register));
router.post('/login', withActivityLog('AUTH', login));
router.get('/profile', verifyToken, getProfile);
router.post('/switch-role', verifyToken, switchRole);

module.exports = router;
