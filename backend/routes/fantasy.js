const express = require('express');
const router = express.Router();
const fantasyController = require('../controllers/fantasyController');

// TODO: Define fantasy league routes
// E.g., POST /api/fantasy/leagues - Create a new league
// router.post('/leagues', fantasyController.createLeague);

// Fantasy Team Routes
router.get('/teams', fantasyController.getUserTeams);
router.post('/teams', fantasyController.createTeam);
router.delete('/teams',fantasyController.deleteTeam);

// Fantasy Roster Routes
router.get('/teams/roster', fantasyController.getTeamRoster);
router.put('/teams/roster', fantasyController.setTeamRoster);
router.post('/teams/:teamId/addPlayer', fantasyController.addPlayer);
router.delete('/teams/:teamId/:playerId', fantasyController.removePlayerFromRoster);


router.post('/leagues/create', fantasyController.createLeague);
router.post('/leagues/join', fantasyController.joinLeague);
router.get('/leagues/mine', fantasyController.getMyLeagues);
router.get('/leagues/:id', fantasyController.getLeagueDetails);
router.get('/leagues/:id/usercount', fantasyController.getLeagueMemberCount);

router.get('/user/totalscore/:id', fantasyController.getUserTotalScore);
router.get('/user/scorebyround/:id', fantasyController.getUserScoreByRound);


// TODO: Define fantasy draft routes
// E.g., POST /api/fantasy/leagues/:leagueId/draft - Draft a player
// router.post('/leagues/:leagueId/draft', fantasyController.draftPlayer);

module.exports = router; 