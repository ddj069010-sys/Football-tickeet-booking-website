const pool = require('../../config/db');

exports.searchUsers = async (req, res) => {
    const { q } = req.query;
    try {
        if (!q) {
            return res.json([]);
        }
        const [rows] = await pool.query(
            "SELECT id, name, email, role, membership_type, is_active, created_at FROM users WHERE email LIKE ? OR name LIKE ? ORDER BY created_at DESC LIMIT 50",
            [`%${q}%`, `%${q}%`]
        );
        res.json(rows);
    } catch (error) {
        console.error("Error searching users:", error);
        res.status(500).json({ message: "Failed to search users" });
    }
};

exports.searchMatches = async (req, res) => {
    const { q } = req.query;
    try {
        if (!q) {
            return res.json([]);
        }
        const [rows] = await pool.query(`
            SELECT m.*, ht.team_name AS home_team_name, at.team_name AS away_team_name, s.name AS stadium_name
            FROM matches m
            LEFT JOIN teams ht ON m.home_team_id = ht.id
            LEFT JOIN teams at ON m.away_team_id = at.id
            LEFT JOIN stadiums s ON m.stadium_id = s.id
            WHERE ht.team_name LIKE ? OR at.team_name LIKE ? OR s.name LIKE ?
            ORDER BY m.match_date DESC LIMIT 50
        `, [`%${q}%`, `%${q}%`, `%${q}%`]);
        res.json(rows);
    } catch (error) {
        console.error("Error searching matches:", error);
        res.status(500).json({ message: "Failed to search matches" });
    }
};

exports.searchTickets = async (req, res) => {
    const { q } = req.query;
    try {
        if (!q) {
            return res.json([]);
        }
        const [rows] = await pool.query(`
            SELECT t.*, u.email, m.match_date, p.transaction_id
            FROM tickets t
            LEFT JOIN users u ON t.user_id = u.id
            LEFT JOIN matches m ON t.match_id = m.id
            LEFT JOIN payments p ON t.payment_id = p.id
            WHERE p.transaction_id LIKE ? OR u.email LIKE ?
            ORDER BY t.created_at DESC LIMIT 50
        `, [`%${q}%`, `%${q}%`]);
        res.json(rows);
    } catch (error) {
        console.error("Error searching tickets:", error);
        res.status(500).json({ message: "Failed to search tickets" });
    }
};

exports.searchStadiums = async (req, res) => {
    const { q } = req.query;
    try {
        if (!q) {
            return res.json([]);
        }
        const [rows] = await pool.query(
            "SELECT * FROM stadiums WHERE name LIKE ? OR location LIKE ? ORDER BY created_at DESC LIMIT 50",
            [`%${q}%`, `%${q}%`]
        );
        res.json(rows);
    } catch (error) {
        console.error("Error searching stadiums:", error);
        res.status(500).json({ message: "Failed to search stadiums" });
    }
};
