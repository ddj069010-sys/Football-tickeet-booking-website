const express = require('express');
const router = express.Router();
const { getNotifications } = require('../controllers/adminController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, getNotifications);

module.exports = router;
