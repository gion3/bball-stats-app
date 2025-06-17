const express = require('express');
const router = express.Router();
const { getGameById, getTeamIdsFromGameId, getTeamScoreFromTeamGameId,getTotalPointsFromGameId ,getMostRecentGames, getMetaDataById, getStandings} = require('../controllers/teamController');

router.get('/game/metadata/:id',getMetaDataById);
router.get('/game/most-recent',getMostRecentGames);
router.get('/game/:id', getGameById);
router.get('/game/:id/teams', getTeamIdsFromGameId);
router.get('/game/:game_id/teams/:team_id', getTeamScoreFromTeamGameId);
router.get('/game/:id/final-score',getTotalPointsFromGameId);
router.get('/standings',getStandings);


module.exports = router;
