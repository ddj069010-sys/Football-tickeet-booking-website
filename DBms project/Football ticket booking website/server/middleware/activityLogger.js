// ─── Activity Tracker Middleware / Helper ───
const { logActivity } = require('../services/loggerService');

/**
 * Higher-order function to wrap existing Express controllers without modifying their internal logic.
 * Analyzes the request and response objects to map events into user_activity_logs.
 */
const withActivityLog = (actionCategory, controllerFunc) => {
    return async (req, res, next) => {
        const originalJson = res.json;
        const originalSend = res.send;

        // Hook into res.json to capture output state
        res.json = function (body) {
            captureLog(req, res, body, actionCategory);
            return originalJson.call(this, body);
        };

        res.send = function (body) {
            // Also proxy send just in case
            if (typeof body === 'object') {
                captureLog(req, res, body, actionCategory);
            }
            return originalSend.call(this, body);
        };

        try {
            await controllerFunc(req, res, next);
        } catch (error) {
            next(error);
        }
    };
};

const captureLog = (req, res, body, category) => {
    try {
        const statusCode = res.statusCode;
        let userId = req.user ? req.user.id : null;
        let actionType = category;
        let details = `HTTP ${statusCode}`;

        // 1. Auth Events
        if (category === 'AUTH') {
            if (req.path.includes('/login') && statusCode === 200 && body.user) {
                userId = body.user.id;
                actionType = 'User login';
                details = 'Logged in successfully';
            } else if (req.path.includes('/register') && statusCode === 201 && body.user) {
                userId = body.user.id;
                actionType = 'Profile update';
                details = 'User registered account';
            }
        }

        // 2. Booking & Payment Events
        if (category === 'BOOKING') {
            if (statusCode === 200 && body.success) {
                actionType = 'Payment success';
                details = `Booked match ${req.body.match_id}. TXN: ${body.transaction_id || 'Unknown'}`;
            } else if (statusCode >= 400) {
                actionType = 'Payment failure';
                details = `Booking failed: ${body.message || body.error || 'Unknown error'}`;
            }
        }

        // 3. Admin Ticket Cancellation
        if (category === 'CANCELLATION') {
            if (statusCode === 200) {
                actionType = 'Ticket cancellation';
                details = `Admin cancelled ticket ${req.params.id}`;
            }
        }

        // 4. Admin User Management
        if (category === 'USER_MANAGEMENT') {
            if (req.path.includes('/disable')) {
                actionType = 'Profile update';
                details = `Admin disabled user ${req.params.id}`;
            } else if (req.path.includes('/membership')) {
                actionType = 'Profile update';
                details = `Admin updated membership for user ${req.params.id}`;
            }
        }

        // Send to SQL Log Stack async if userId exists
        if (userId) {
            logActivity(userId, actionType, details, req.ip || req.connection.remoteAddress);
        }

    } catch (e) {
        console.error("Activity Tracker failed silently:", e.message);
    }
};

module.exports = { withActivityLog };
