const express = require('express');
const router = express.Router();
const { getAllStadiums, getStadiumById, createStadium, updateStadium, deleteStadium } = require('../controllers/stadiumController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', getAllStadiums);
router.get('/:id', getStadiumById);
router.post('/', verifyToken, isAdmin, createStadium);
router.put('/:id', verifyToken, isAdmin, updateStadium);
router.delete('/:id', verifyToken, isAdmin, deleteStadium);

module.exports = router;
