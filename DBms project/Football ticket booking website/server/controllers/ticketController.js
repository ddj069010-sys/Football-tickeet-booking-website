const db = require('../config/db');

// @desc Book simple ticket transactionally
const bookTicket = (req, res) => {
    const user_id = req.body.user_id || (req.user && req.user.id);
    const { match_id, seat_id, payment_method, amount } = req.body;

    if (!user_id || !match_id || !seat_id || !payment_method || !amount) {
        return res.status(400).json({ success: false, message: "Missing required booking fields" });
    }

    // Call Stored Procedure for Atomic Booking (Requirement: Stored Procedures & Transactions)
    db.query(
        "CALL sp_BookTicket(?, ?, ?, ?, ?)",
        [user_id, match_id, seat_id, payment_method, amount],
        (err, result) => {
            if (err) {
                console.error("Booking SP error:", err);
                return res.status(500).json({ success: false, error: "Database error during booking transaction." });
            }
            
            // The result of CALL is an array of result sets
            const bookingResult = result[0][0];
            
            if (bookingResult.success) {
                res.json({
                    success: true,
                    message: "Ticket booked successfully via secure transaction",
                    transaction_id: bookingResult.transaction_id
                });
            } else {
                res.status(400).json({ success: false, message: "Booking failed. Seat might be unavailable." });
            }
        }
    );
};

// @desc Fetch User specific tickets with all relational data
const getMyTickets = (req, res) => {
    const userId = req.params.userId || (req.user && req.user.id);
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const query = `
        SELECT 
            t.id AS ticket_id,
            t.booking_status,
            t.created_at,
            m.match_date,
            t1.team_name AS home_team,
            t2.team_name AS away_team,
            s.name AS stadium_name,
            s.location AS stadium_location,
            se.row_number,
            se.seat_number,
            COALESCE(se.seat_type, 'regular') AS seat_type,
            p.amount,
            p.transaction_id,
            p.payment_method,
            p.payment_status
        FROM tickets t
        LEFT JOIN matches m ON t.match_id = m.id
        LEFT JOIN teams t1 ON m.home_team_id = t1.id
        LEFT JOIN teams t2 ON m.away_team_id = t2.id
        LEFT JOIN stadiums s ON m.stadium_id = s.id
        LEFT JOIN seats se ON t.seat_id = se.id
        LEFT JOIN payments p ON t.payment_id = p.id
        WHERE t.user_id = ?
        ORDER BY t.created_at DESC
    `;

    db.query(query, [userId], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, tickets: result, data: result });
    });
};


// @desc Fetch All admin-level natively
const getAllTickets = (req, res) => {
    const query = `
        SELECT t.id AS ticket_id, t.*, 
               u.name, 
               u.email, 
               t1.team_name AS home_team, 
               t2.team_name AS away_team, 
               s.name AS stadium,
               p.amount,
               p.transaction_id,
               p.payment_status
        FROM tickets t 
        JOIN users u ON t.user_id = u.id 
        JOIN matches m ON t.match_id = m.id
        JOIN teams t1 ON m.home_team_id = t1.id 
        JOIN teams t2 ON m.away_team_id = t2.id 
        JOIN stadiums s ON m.stadium_id = s.id 
        LEFT JOIN payments p ON t.payment_id = p.id
    `;

    db.query(query, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, tickets: result });
    });
};

module.exports = { bookTicket, getMyTickets, getAllTickets };
