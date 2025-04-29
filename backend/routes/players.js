const express = require('express');
const router = express.Router();
const { getAllPlayers, getPlayerById, getTop10Players, getPlayerSeasonStats, getPlayerByName } = require('../controllers/playerController');

router.get('/', getAllPlayers);
router.get('/top10',getTop10Players);
router.get('/search/:name',getPlayerByName);
router.get('/stats/:id', getPlayerSeasonStats);
router.get('/:id', getPlayerById);


module.exports = router;
