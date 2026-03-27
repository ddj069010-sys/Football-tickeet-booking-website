const db = require('../config/db');

// @desc Get all teams
const getAllTeams = (req, res) => {
    db.query('SELECT * FROM teams ORDER BY team_name ASC', (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, teams: result, data: result });
    });
};

// @desc Get team by id
const getTeamById = (req, res) => {
    db.query('SELECT * FROM teams WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ error: 'Team not found' });
        res.json({ success: true, team: result[0] });
    });
};

// @desc Create team
const createTeam = (req, res) => {
    const { team_name, coach_name } = req.body;
    if (!team_name) return res.status(400).json({ error: 'Team name is required' });

    db.query(
        'INSERT INTO teams (team_name, coach_name) VALUES (?, ?)',
        [team_name, coach_name || null],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                success: true,
                message: 'Team created successfully',
                id: result.insertId
            });
        }
    );
};

// @desc Update team
const updateTeam = (req, res) => {
    const { team_name, coach_name } = req.body;
    db.query(
        'UPDATE teams SET team_name = ?, coach_name = ? WHERE id = ?',
        [team_name, coach_name || null, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Team not found' });
            res.json({ success: true, message: 'Team updated successfully' });
        }
    );
};

// @desc Delete team
const deleteTeam = (req, res) => {
    db.query('DELETE FROM teams WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Cannot delete team that has matches linked to it.' });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Team not found' });
        res.json({ success: true, message: 'Team deleted successfully' });
    });
};

module.exports = { getAllTeams, getTeamById, createTeam, updateTeam, deleteTeam };
