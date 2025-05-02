const express = require('express');
const router = express.Router();
const { getGameById, getTeamIdsFromGameId, getTeamScoreFromTeamGameId,getTotalPointsFromGameId } = require('../controllers/teamController');

router.get('/game/:id', getGameById);
router.get('/game/:id/teams', getTeamIdsFromGameId);
router.get('/game/:game_id/teams/:team_id', getTeamScoreFromTeamGameId);
router.get('/game/:id/final-score',getTotalPointsFromGameId);

module.exports = router;
