// ─── Notification Service ───
const pool = require('../config/db');

const createNotification = async (userId, title, message, connection = null) => {
    try {
        const query = `
            INSERT INTO notifications (user_id, title, message)
            VALUES (?, ?, ?)
        `;

        if (connection) {
            await connection.query(query, [userId, title, message]);
        } else {
            await pool.query(query, [userId, title, message]);
        }
    } catch (e) {
        console.error('Failed to create notification:', e);
    }
};

module.exports = { createNotification };
