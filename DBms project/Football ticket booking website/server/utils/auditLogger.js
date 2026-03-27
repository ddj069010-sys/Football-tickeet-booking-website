// ─── Audit Logger Utility ───
const db = require('../config/db');

/**
 * Logs an admin/system action to audit_logs.
 * Uses callback-style query — never throws, never blocks main logic.
 */
function logAction(userId, action, details = "") {
    const sql = "INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)";
    db.query(sql, [userId, action, details], (err) => {
        if (err) {
            console.warn("Audit log skipped:", err.message);
        }
    });
}

module.exports = { logAction };
