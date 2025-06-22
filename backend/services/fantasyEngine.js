const db = require('../db/database'); // Assuming you have a db connection module


async function calculatePlayerScoreMostRecentGame(playerId){
  const player = await fetch(`http://localhost:5000/api/games/most-recent-game-player-row/${playerId}`);

  return ((player.PTS + player.REB + player.AST + player.STL + player.BLK) - ((player.FGA - player.FGM) + (player.FTA - player.FTM)
  +player.TOV + player.PF))
};
async function calculatePlayerScoreWithGameId(playerId, gameId){
  const player = await fetch(`http://localhost:5000/api/games/player-game-stat-row/${playerId}/${gameId}`);

  return ((player.PTS + player.REB + player.AST + player.STL + player.BLK) - ((player.FGA - player.FGM) + (player.FTA - player.FTM)
  +player.TOV + player.PF))
};

/**
 * Calculates fantasy scores for all active leagues for a given time period.
 * This function would be called by a scheduler (e.g., a cron job).
 */
async function calculateWeeklyScores() {
  console.log('Starting weekly score calculation...');

  // 1. Get the scoring rules
  // const scoringRules = await db.all('SELECT * FROM fantasy_scoring_rules');
  
  // 2. Get all active matchups
  // const activeMatchups = await db.all('SELECT * FROM fantasy_matchups WHERE status = ?', ['active']);
  // create an endpoint that selects all the following games on a round-by-round basis.

  //create an endpoint that fetches the last 15 games or the last game for each player




  // 3. For each matchup, calculate team scores
  // for (const matchup of activeMatchups) {
    // a. Get rosters for both teams
    // b. For each player, fetch their real-life stats for the week
    // c. Calculate fantasy points based on scoring rules
    // d. Update the matchup score in the database
  // }

  console.log('Finished weekly score calculation.');
}
//create function that calculates the performance for a player in a game.

module.exports = {
  calculateWeeklyScores,
  calculatePlayerScoreMostRecentGame,
  calculatePlayerScoreWithGameId
}; 