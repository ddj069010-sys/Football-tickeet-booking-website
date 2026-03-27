const db = require('../config/db');

// @desc Get all matches fully joined with team names and stadium names
const getAllMatches = (req, res) => {
    const query = `
        SELECT m.*, 
               m.base_price AS base_ticket_price,
               t1.team_name AS home_team,
               t1.team_name AS home_team_name, 
               t2.team_name AS away_team,
               t2.team_name AS away_team_name, 
               s.name AS stadium,
               s.name AS stadium_name,
               s.location AS stadium_location
        FROM matches m
        LEFT JOIN teams t1 ON m.home_team_id = t1.id
        LEFT JOIN teams t2 ON m.away_team_id = t2.id
        LEFT JOIN stadiums s ON m.stadium_id = s.id
        ORDER BY m.match_date ASC
    `;
    db.query(query, (err, result) => {
        if (err) {
            console.error('Matches fetch error:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, data: result, matches: result });
    });
};


// @desc Get specific match natively
const getMatchById = (req, res) => {
    const query = `
        SELECT m.*, 
               m.base_price AS base_ticket_price,
               t1.team_name AS home_team,
               t1.team_name AS home_team_name, 
               t2.team_name AS away_team,
               t2.team_name AS away_team_name, 
               s.name AS stadium,
               s.name AS stadium_name,
               s.location AS stadium_location
        FROM matches m
        JOIN teams t1 ON m.home_team_id = t1.id
        JOIN teams t2 ON m.away_team_id = t2.id
        JOIN stadiums s ON m.stadium_id = s.id
        WHERE m.id = ?
    `;
    db.query(query, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Match not found" });
        res.json({ success: true, match: result[0] });
    });
};

// @desc Create simple flat match (Admin)
const createMatch = (req, res) => {
    const { home_team_id, away_team_id, stadium_id, match_date, base_ticket_price, total_seats } = req.body;
    db.query(
        "INSERT INTO matches (home_team_id, away_team_id, stadium_id, match_date, base_price, total_seats, available_seats) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [home_team_id, away_team_id, stadium_id, match_date, base_ticket_price || 50, total_seats || 500, total_seats || 500],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: "Match created successfully with dynamic seat generation!" });
        }
    );
};

// @desc Delete match safely
const deleteMatch = (req, res) => {
    db.query("DELETE FROM matches WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: "Match deleted securely." });
    });
};

// @desc Get seats for a match
const getMatchSeats = (req, res) => {
    const query = `
        SELECT s.*, m.base_price
        FROM seats s
        JOIN matches m ON s.match_id = m.id
        WHERE s.match_id = ?
    `;
    db.query(query, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.json({ success: true, seats: [], base_price: 50 });
        res.json({ success: true, seats: result, base_price: result[0].base_price });
    });
};

// @desc Dummy update
const updateMatch = (req, res) => { res.json({ message: "Update natively mocked" }) };

module.exports = { getAllMatches, getMatchById, createMatch, updateMatch, deleteMatch, getMatchSeats };
