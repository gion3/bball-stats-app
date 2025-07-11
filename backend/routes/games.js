const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.get('/next-round', gameController.getNextRound);
router.get('/round/:round_no', gameController.getCurrentRoundGames);
router.get('/most-recent-game-player-row/:id', gameController.getLastGameStatsForPlayer);
router.get('/player-game-stat-row/:playerId/:gameId', gameController.getGameStatsForPlayer);
router.get('/crt', gameController.getCurrentRoundNumber);

module.exports = router;