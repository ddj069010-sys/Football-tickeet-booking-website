const pool = require('../../config/db');

exports.executeSQL = async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ message: "No query provided" });
    }

    // Security check - blocked commands (Regex based)
    if (/drop|truncate/i.test(query)) {
        throw new Error("Dangerous query blocked");
    }

    try {
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error("SQL Execution Error:", error);
        res.status(400).json({ message: error.message });
    }
};

exports.getAnalytics = async (req, res) => {
    try {
        const [[{ total_users }]] = await pool.query("SELECT COUNT(*) AS total_users FROM users");
        const [[{ total_bookings }]] = await pool.query("SELECT COUNT(*) AS total_bookings FROM tickets");
        const [[{ total_revenue }]] = await pool.query("SELECT SUM(amount) AS total_revenue FROM payments WHERE payment_status = 'success'");
        const [[{ seat_occupancy }]] = await pool.query("SELECT COUNT(*) AS seat_occupancy FROM seats WHERE is_booked = TRUE");

        res.json({
            total_users: total_users || 0,
            total_bookings: total_bookings || 0,
            total_revenue: total_revenue || 0,
            seat_occupancy: seat_occupancy || 0
        });

    } catch (error) {
        console.error("Error fetching admin database analytics:", error);
        res.status(500).json({ message: "Failed to fetch analytics" });
    }
};
