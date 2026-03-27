// ─── Match Routes ───
const express = require('express');
const router = express.Router();
const { getAllMatches, getMatchById, createMatch, updateMatch, deleteMatch, getMatchSeats } = require('../controllers/matchController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', getAllMatches);
router.get('/:id', getMatchById);
router.get('/:id/seats', getMatchSeats);
router.post('/', verifyToken, isAdmin, createMatch);
router.put('/:id', verifyToken, isAdmin, updateMatch);
router.delete('/:id', verifyToken, isAdmin, deleteMatch);

module.exports = router;
