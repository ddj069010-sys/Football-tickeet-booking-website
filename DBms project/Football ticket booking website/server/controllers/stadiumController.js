const db = require('../config/db');

// @desc Get all stadiums
const getAllStadiums = (req, res) => {
    db.query('SELECT * FROM stadiums ORDER BY name ASC', (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, stadiums: result, data: result });
    });
};

// @desc Get stadium by id
const getStadiumById = (req, res) => {
    db.query('SELECT * FROM stadiums WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ error: 'Stadium not found' });
        res.json({ success: true, stadium: result[0] });
    });
};

// @desc Create stadium + auto-generate seats for all matches linked to it
const createStadium = (req, res) => {
    const { name, location, total_rows, seats_per_row } = req.body;
    if (!name || !location) return res.status(400).json({ error: 'Name and location are required' });

    const rows = parseInt(total_rows) || 10;
    const seatsPerRow = parseInt(seats_per_row) || 20;

    db.query(
        'INSERT INTO stadiums (name, location, total_rows, seats_per_row) VALUES (?, ?, ?, ?)',
        [name, location, rows, seatsPerRow],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                success: true,
                message: 'Stadium created successfully',
                id: result.insertId
            });
        }
    );
};

// @desc Update stadium
const updateStadium = (req, res) => {
    const { name, location, total_rows, seats_per_row } = req.body;
    db.query(
        'UPDATE stadiums SET name = ?, location = ?, total_rows = ?, seats_per_row = ? WHERE id = ?',
        [name, location, parseInt(total_rows), parseInt(seats_per_row), req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Stadium not found' });
            res.json({ success: true, message: 'Stadium updated successfully' });
        }
    );
};

// @desc Delete stadium
const deleteStadium = (req, res) => {
    db.query('DELETE FROM stadiums WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Cannot delete stadium that has active matches.' });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Stadium not found' });
        res.json({ success: true, message: 'Stadium deleted successfully' });
    });
};

module.exports = { getAllStadiums, getStadiumById, createStadium, updateStadium, deleteStadium };
