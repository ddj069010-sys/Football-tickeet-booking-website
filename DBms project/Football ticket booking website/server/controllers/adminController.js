const db = require('../config/db');

// @desc Admin analytics/stats for the dashboard
const getDatabaseAnalytics = (req, res) => {
    const queries = {
        users: 'SELECT COUNT(*) AS total_users FROM users',
        bookings: 'SELECT COUNT(*) AS total_bookings FROM tickets',
        revenue: 'SELECT COALESCE(SUM(amount), 0) AS total_revenue FROM payments WHERE payment_status = "success"',
        matches: 'SELECT COUNT(*) AS total_matches FROM matches',
        teams: 'SELECT COUNT(*) AS total_teams FROM teams',
        stadiums: 'SELECT COUNT(*) AS total_stadiums FROM stadiums',
        occupancy: `SELECT 
            ROUND(
                (SELECT COUNT(*) FROM seats WHERE is_booked = 1) /
                NULLIF((SELECT COUNT(*) FROM seats), 0) * 100, 2
            ) AS seat_occupancy`
    };

    Promise.all(Object.values(queries).map(q => new Promise((resolve, reject) => {
        db.query(q, (err, r) => err ? reject(err) : resolve(r[0]));
    }))).then(([users, bookings, revenue, matches, teams, stadiums, occupancy]) => {
        res.json({
            total_users: users.total_users || 0,
            total_bookings: bookings.total_bookings || 0,
            total_revenue: revenue.total_revenue || 0,
            total_matches: matches.total_matches || 0,
            total_teams: teams.total_teams || 0,
            total_stadiums: stadiums.total_stadiums || 0,
            seat_occupancy: occupancy.seat_occupancy || 0
        });
    }).catch(err => res.status(500).json({ error: err.message }));
};

// @desc Get all users with aggregate data (Admin)
const getAllUsers = (req, res) => {
    const query = `
        SELECT 
            u.id, u.name, u.email, u.role, u.is_active, u.membership_type, u.created_at,
            COUNT(t.id) AS total_bookings,
            COALESCE(SUM(p.amount), 0) AS total_spent
        FROM users u
        LEFT JOIN tickets t ON u.id = t.user_id
        LEFT JOIN payments p ON t.payment_id = p.id AND p.payment_status = 'success'
        GROUP BY u.id
        ORDER BY u.created_at DESC
    `;
    db.query(query, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, users: result });
    });
};

// @desc Update user membership/status (Admin)
const updateUserStatus = (req, res) => {
    const { is_active } = req.body;
    db.query('UPDATE users SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'User status updated' });
    });
};

const updateUserMembership = (req, res) => {
    const { membership_type } = req.body;
    db.query('UPDATE users SET membership_type = ? WHERE id = ?', [membership_type, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'User membership updated' });
    });
};

// @desc Delete user (Admin)
const deleteUser = (req, res) => {
    db.query('DELETE FROM users WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'User deleted' });
    });
};

// @desc Get all tickets including relational data (Admin)
const getAllTickets = (req, res) => {
    const query = `
        SELECT t.*, 
               u.name AS user_name, u.email,
               m.match_date,
               t1.team_name AS home_team,
               t2.team_name AS away_team,
               s.name AS stadium,
               p.amount, p.payment_status, p.transaction_id,
               se.seat_type, se.row_number, se.seat_number
        FROM tickets t
        LEFT JOIN users u ON t.user_id = u.id
        LEFT JOIN matches m ON t.match_id = m.id
        LEFT JOIN teams t1 ON m.home_team_id = t1.id
        LEFT JOIN teams t2 ON m.away_team_id = t2.id
        LEFT JOIN stadiums s ON m.stadium_id = s.id
        LEFT JOIN payments p ON t.payment_id = p.id
        LEFT JOIN seats se ON t.seat_id = se.id
        ORDER BY t.created_at DESC
    `;
    db.query(query, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, tickets: result });
    });
};

// @desc Cancel a ticket (Admin)
const cancelTicket = (req, res) => {
    db.query(
        'UPDATE tickets SET booking_status = "cancelled" WHERE id = ?',
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: 'Ticket cancelled' });
        }
    );
};

// @desc Get activity log (recent actions across tables)
const getActivityLog = (req, res) => {
    const query = `
        SELECT 
            'ticket' AS type,
            CONCAT(u.name, ' booked a ticket for ', t1.team_name, ' vs ', t2.team_name) AS description,
            tk.id AS entity_id,
            tk.created_at AS timestamp,
            u.name AS user_name,
            u.email AS user_email,
            'Booking Confirmed' AS action
        FROM tickets tk
        LEFT JOIN users u ON tk.user_id = u.id
        LEFT JOIN matches m ON tk.match_id = m.id
        LEFT JOIN teams t1 ON m.home_team_id = t1.id
        LEFT JOIN teams t2 ON m.away_team_id = t2.id
        ORDER BY tk.created_at DESC
        LIMIT 20
    `;
    db.query(query, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, activity: result });
    });
};

// @desc Revenue report grouped by match (expected by AdminReports.jsx)
const getRevenueReport = (req, res) => {
    const query = `
        SELECT 
            m.id AS match_id,
            t1.team_name AS home_team,
            t2.team_name AS away_team,
            m.match_date,
            COUNT(t.id) AS tickets_sold,
            COALESCE(SUM(p.amount), 0) AS total_revenue
        FROM matches m
        LEFT JOIN teams t1 ON m.home_team_id = t1.id
        LEFT JOIN teams t2 ON m.away_team_id = t2.id
        LEFT JOIN tickets t ON m.id = t.match_id AND t.booking_status = 'confirmed'
        LEFT JOIN payments p ON t.payment_id = p.id AND p.payment_status = 'success'
        GROUP BY m.id
        ORDER BY total_revenue DESC
    `;
    db.query(query, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, report: result });
    });
};

// @desc Get live bookings stream (expected by AdminReports.jsx)
const getLiveBookings = (req, res) => {
    const query = `
        SELECT 
            t.id AS ticket_id,
            u.name AS user_name, u.email AS user_email,
            t1.team_name AS home_team, t2.team_name AS away_team,
            se.seat_type, se.row_number AS row_label, se.seat_number,
            p.payment_method, p.amount,
            t.booking_status,
            t.created_at
        FROM tickets t
        JOIN users u ON t.user_id = u.id
        JOIN matches m ON t.match_id = m.id
        JOIN teams t1 ON m.home_team_id = t1.id
        JOIN teams t2 ON m.away_team_id = t2.id
        JOIN seats se ON t.seat_id = se.id
        LEFT JOIN payments p ON t.payment_id = p.id
        WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ORDER BY t.created_at DESC
        LIMIT 10
    `;
    db.query(query, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, bookings: result });
    });
};

// @desc Generic Database View handlers for AdminDatabasePanel.jsx
const getDbView = (table) => (req, res) => {
    const validTables = ['users', 'matches', 'stadiums', 'tickets', 'payments', 'seats', 'teams'];
    if (!validTables.includes(table)) return res.status(400).json({ error: 'Invalid table' });
    
    db.query(`SELECT * FROM ${table} ORDER BY 1 DESC LIMIT 100`, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
};

// @desc Quick SQL console (Admin only)
const executeSQL = (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    const upperQ = query.toUpperCase().trim();
    if (upperQ.startsWith('DROP') || upperQ.startsWith('TRUNCATE')) {
        return res.status(403).json({ error: 'DROP and TRUNCATE are not permitted via the console.' });
    }

    db.query(query, (err, result) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ success: true, result });
    });
};

// @desc Search handlers
const searchEntity = (table, fields) => (req, res) => {
    const q = req.query.q;
    if (!q) return res.json([]);
    
    const whereClause = fields.map(f => `${f} LIKE ?`).join(' OR ');
    const params = fields.map(() => `%${q}%`);
    
    db.query(`SELECT * FROM ${table} WHERE ${whereClause} LIMIT 20`, params, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
};

// @desc Get notifications for the current user
const getNotifications = (req, res) => {
    const userId = req.user?.id;
    const query = `
        SELECT 
            t.id,
            CONCAT('Your ticket for ', t1.team_name, ' vs ', t2.team_name, ' is ', t.booking_status) AS message,
            t.created_at AS timestamp,
            FALSE AS is_read
        FROM tickets t
        LEFT JOIN matches m ON t.match_id = m.id
        LEFT JOIN teams t1 ON m.home_team_id = t1.id
        LEFT JOIN teams t2 ON m.away_team_id = t2.id
        WHERE t.user_id = ?
        ORDER BY t.created_at DESC LIMIT 10
    `;
    db.query(query, [userId || 0], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, notifications: result });
    });
};

module.exports = {
    getDatabaseAnalytics,
    getAllUsers, deleteUser, updateUserStatus, updateUserMembership,
    getAllTickets, cancelTicket,
    getActivityLog, getRevenueReport, getLiveBookings,
    executeSQL,
    getDbView,
    searchEntity,
    getNotifications
};


