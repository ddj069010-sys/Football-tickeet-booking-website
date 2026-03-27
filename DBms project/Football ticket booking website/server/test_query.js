const pool = require('./config/db');

async function testTicketsQuery() {
    try {
        console.log("Testing getMyTickets query...");
        await pool.query(
            `SELECT t.id as ticket_id, t.booking_status, t.booked_at as booking_date,
              m.match_date, m.id as match_id,
              s.\`row_number\`, s.seat_number, s.seat_type,
              p.amount, p.payment_method, p.transaction_id, p.payment_status,
              ht.team_name as home_team, at.team_name as away_team,
              std.name as stadium_name
       FROM tickets t
       JOIN matches m ON t.match_id = m.id
       JOIN seats s ON t.seat_id = s.id
       JOIN payments p ON t.payment_id = p.id
       JOIN teams ht ON m.home_team_id = ht.id
       JOIN teams at ON m.away_team_id = at.id
       JOIN stadiums std ON m.stadium_id = std.id
       WHERE t.user_id = ?
       ORDER BY t.booked_at DESC LIMIT 1`,
            [1]
        );
        console.log("getMyTickets query OK");

        console.log("Testing getAllTickets query...");
        await pool.query(
            `SELECT t.id as ticket_id, u.name as user_name, u.email,
              t.booking_status, t.booked_at as booking_date,
              m.match_date,
              s.\`row_number\`, s.seat_number, s.seat_type,
              p.amount, p.transaction_id,
              ht.team_name as home_team, at.team_name as away_team
       FROM tickets t
       JOIN users u ON t.user_id = u.id
       JOIN matches m ON t.match_id = m.id
       JOIN seats s ON t.seat_id = s.id
       JOIN payments p ON t.payment_id = p.id
       JOIN teams ht ON m.home_team_id = ht.id
       JOIN teams at ON m.away_team_id = at.id
       ORDER BY t.booked_at DESC LIMIT 1`
        );
        console.log("getAllTickets query OK");
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        process.exit();
    }
}

testTicketsQuery();
