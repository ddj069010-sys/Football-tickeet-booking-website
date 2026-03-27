// ─── User Activity Logger Service ───
const db = require('../config/db');

/**
 * Logs a user action into the user_activity_logs table.
 * Uses callback-style query — never throws, never blocks main logic.
 */
const logActivity = (userId, actionType, actionDetails = '', ipAddress = null) => {
    const sql = `
        INSERT INTO user_activity_logs (user_id, action_type, action_details, ip_address)
        VALUES (?, ?, ?, ?)
    `;
    db.query(sql, [userId, actionType, actionDetails, ipAddress], (err) => {
        if (err) {
            // Silent fail — logging should never crash the main business logic
            console.warn('Activity log skipped:', err.message);
        }
    });
};

module.exports = { logActivity };
