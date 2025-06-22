const express = require('express');
const router = express.Router();
const fantasyController = require('../controllers/fantasyController');

// TODO: Define fantasy league routes
// E.g., POST /api/fantasy/leagues - Create a new league
// router.post('/leagues', fantasyController.createLeague);

// Fantasy Team Routes
router.get('/teams', fantasyController.getUserTeams);
router.post('/teams', fantasyController.createTeam);

// Fantasy Roster Routes
router.get('/teams/:teamId/roster', fantasyController.getTeamRoster);
router.put('/teams/:teamId/roster', fantasyController.setTeamRoster);
router.post('/teams/:teamId/addPlayer', fantasyController.addPlayer);
router.delete('/teams/:teamId/roster/:playerId', fantasyController.removePlayerFromRoster);

// TODO: Define fantasy draft routes
// E.g., POST /api/fantasy/leagues/:leagueId/draft - Draft a player
// router.post('/leagues/:leagueId/draft', fantasyController.draftPlayer);

module.exports = router; 