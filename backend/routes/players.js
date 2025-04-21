const express = require('express');
const router = express.Router();
const { getAllPlayers, getPlayerById, getTop10Players } = require('../controllers/playerController');

router.get('/', getAllPlayers);
router.get('/top10',getTop10Players);
router.get('/:id', getPlayerById);


module.exports = router;
