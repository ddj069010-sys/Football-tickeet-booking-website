const express = require('express');
const router = express.Router();
const db = require('../config/db');

// @route   GET /api/db-connection
// @desc    Check active MariaDB connection status
// @access  Public
router.get('/', (req, res) => {
    // Ping the database to verify active connection
    db.query('SELECT VERSION() AS version', (err, results) => {
        if (err) {
            console.error('Database connection API error:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Database connection failed',
                error: err.message,
                status: 'disconnected'
            });
        }
        
        // Active connection success
        return res.status(200).json({
            success: true,
            message: 'Active database connection established',
            database: process.env.DB_NAME || 'test',
            user: process.env.DB_USER || 'root',
            db_version: results[0] ? results[0].version : 'Unknown',
            status: 'connected'
        });
    });
});

module.exports = router;
