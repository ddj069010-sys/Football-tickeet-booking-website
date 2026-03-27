const express = require('express');
const router = express.Router();
const { getAllTeams, getTeamById, createTeam, updateTeam, deleteTeam } = require('../controllers/teamController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', getAllTeams);
router.get('/:id', getTeamById);
router.post('/', verifyToken, isAdmin, createTeam);
router.put('/:id', verifyToken, isAdmin, updateTeam);
router.delete('/:id', verifyToken, isAdmin, deleteTeam);

module.exports = router;
