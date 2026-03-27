const pool = require('../../config/db');
const bcrypt = require('bcryptjs');

// ==========================================
// VIEW APIS (GET)
// ==========================================

exports.getUsers = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT id, name, email, role, membership_type, is_active, created_at FROM users ORDER BY created_at DESC");
        res.json(rows);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

exports.getMatches = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT m.*, 
                   ht.team_name AS home_team_name, 
                   at.team_name AS away_team_name,
                   s.name AS stadium_name
            FROM matches m
            LEFT JOIN teams ht ON m.home_team_id = ht.id
            LEFT JOIN teams at ON m.away_team_id = at.id
            LEFT JOIN stadiums s ON m.stadium_id = s.id
            ORDER BY m.match_date DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching matches:", error);
        res.status(500).json({ message: "Failed to fetch matches" });
    }
};

exports.getStadiums = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM stadiums ORDER BY created_at DESC");
        res.json(rows);
    } catch (error) {
        console.error("Error fetching stadiums:", error);
        res.status(500).json({ message: "Failed to fetch stadiums" });
    }
};

exports.getTickets = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT t.*, u.email, u.name AS user_name, m.match_date, 
                   ht.team_name AS home_team, at.team_name AS away_team 
            FROM tickets t
            LEFT JOIN users u ON t.user_id = u.id
            LEFT JOIN matches m ON t.match_id = m.id
            LEFT JOIN teams ht ON m.home_team_id = ht.id
            LEFT JOIN teams at ON m.away_team_id = at.id
            ORDER BY t.created_at DESC LIMIT 1000
        `);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching tickets:", error);
        res.status(500).json({ message: "Failed to fetch tickets" });
    }
};

exports.getPayments = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM payments ORDER BY created_at DESC LIMIT 1000");
        res.json(rows);
    } catch (error) {
        console.error("Error fetching payments:", error);
        res.status(500).json({ message: "Failed to fetch payments" });
    }
};

exports.getSeats = async (req, res) => {
    try {
        // Exclude seats that are just large batches to not freeze the browser, or maybe allow it
        const [rows] = await pool.query("SELECT * FROM seats LIMIT 1000");
        res.json(rows);
    } catch (error) {
        console.error("Error fetching seats:", error);
        res.status(500).json({ message: "Failed to fetch seats" });
    }
};

// ==========================================
// CRUD APIS
// ==========================================

// --- USERS ---
exports.createUser = async (req, res) => {
    const { name, email, password, role, membership_type, is_active } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password || 'default123', 10);
        await pool.query(
            "INSERT INTO users (name, email, password, role, membership_type, is_active) VALUES (?, ?, ?, ?, ?, ?)",
            [name, email, hashedPassword, role || 'user', membership_type || 'regular', is_active !== undefined ? is_active : true]
        );
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Failed to create user" });
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role, membership_type, is_active } = req.body;
    try {
        await pool.query(
            "UPDATE users SET name=?, email=?, role=?, membership_type=?, is_active=? WHERE id=?",
            [name, email, role, membership_type, is_active !== undefined ? is_active : true, id]
        );
        res.json({ message: "User updated successfully" });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Failed to update user" });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM users WHERE id=?", [id]);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: error.code === 'ER_ROW_IS_REFERENCED_2' ? "Cannot delete user. It is linked to existing data." : "Failed to delete user" });
    }
};

// --- MATCHES ---
exports.createMatch = async (req, res) => {
    const { home_team_id, away_team_id, stadium_id, match_date, base_price, base_ticket_price, total_seats, available_seats } = req.body;
    try {
        await pool.query(
            `INSERT INTO matches 
             (home_team_id, away_team_id, stadium_id, match_date, base_price, base_ticket_price, total_seats, available_seats) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [home_team_id, away_team_id, stadium_id, match_date, base_price || 50, base_ticket_price || 50, total_seats || 0, available_seats || 0]
        );
        res.status(201).json({ message: "Match created successfully" });
    } catch (error) {
        console.error("Error creating match:", error);
        res.status(500).json({ message: "Failed to create match" });
    }
};

exports.updateMatch = async (req, res) => {
    const { id } = req.params;
    const { home_team_id, away_team_id, stadium_id, match_date, base_price, base_ticket_price, total_seats, available_seats } = req.body;
    try {
        await pool.query(
            `UPDATE matches SET 
             home_team_id=?, away_team_id=?, stadium_id=?, match_date=?, base_price=?, base_ticket_price=?, total_seats=?, available_seats=? 
             WHERE id=?`,
            [home_team_id, away_team_id, stadium_id, match_date, base_price, base_ticket_price, total_seats, available_seats, id]
        );
        res.json({ message: "Match updated successfully" });
    } catch (error) {
        console.error("Error updating match:", error);
        res.status(500).json({ message: "Failed to update match" });
    }
};

exports.deleteMatch = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM matches WHERE id=?", [id]);
        res.json({ message: "Match deleted successfully" });
    } catch (error) {
        console.error("Error deleting match:", error);
        res.status(500).json({ message: error.code === 'ER_ROW_IS_REFERENCED_2' ? "Cannot delete match. It is linked to existing data." : "Failed to delete match" });
    }
};

// --- STADIUMS ---
exports.createStadium = async (req, res) => {
    const { name, location, total_rows, seats_per_row } = req.body;
    try {
        await pool.query(
            "INSERT INTO stadiums (name, location, total_rows, seats_per_row) VALUES (?, ?, ?, ?)",
            [name, location, total_rows, seats_per_row]
        );
        res.status(201).json({ message: "Stadium created successfully" });
    } catch (error) {
        console.error("Error creating stadium:", error);
        res.status(500).json({ message: "Failed to create stadium" });
    }
};

exports.updateStadium = async (req, res) => {
    const { id } = req.params;
    const { name, location, total_rows, seats_per_row } = req.body;
    try {
        await pool.query(
            "UPDATE stadiums SET name=?, location=?, total_rows=?, seats_per_row=? WHERE id=?",
            [name, location, total_rows, seats_per_row, id]
        );
        res.json({ message: "Stadium updated successfully" });
    } catch (error) {
        console.error("Error updating stadium:", error);
        res.status(500).json({ message: "Failed to update stadium" });
    }
};

exports.deleteStadium = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM stadiums WHERE id=?", [id]);
        res.json({ message: "Stadium deleted successfully" });
    } catch (error) {
        console.error("Error deleting stadium:", error);
        res.status(500).json({ message: error.code === 'ER_ROW_IS_REFERENCED_2' ? "Cannot delete stadium. It is linked to existing data." : "Failed to delete stadium" });
    }
};
