const db = require('../db/database');

const getGameById = (req,res) =>{
    const sql = `
    SELECT g.PLAYER_ID, p.TEAM_ID, g.GAME_DATE, g.MATCHUP, g.WL, g.MIN, g.OREB, g.DREB, g.REB,
    g.AST, g.STL, g.BLK, g.TOV, g.PF,g.PTS, g.PLAYER_NAME
    FROM game_logs g
	  JOIN player_stats p
	  ON g.PLAYER_ID = p.PLAYER_ID
    WHERE g.GAME_ID = ?
    `;
    const {id} = req.params;

    db.all(sql, [id], (err,row) => {
        if(err){
            res.status(500).json({error:err.message});
        }
        else if (!row){
            res.status(404).json({message: "Game not found!"});
        }
        else{
            res.json(row);
        }
    });
}

const getTeamIdsFromGameId = (req,res) =>{
  const sql = `
    SELECT DISTINCT p.TEAM_ID
    FROM game_logs g
	  JOIN player_stats p
	  ON g.PLAYER_ID = p.PLAYER_ID
    WHERE g.GAME_ID = ?`;
    const {id} = req.params;

    db.all(sql, [id], (err,row) => {
        if(err){
            res.status(500).json({error:err.message});
        }
        else if (!row){
            res.status(404).json({message: "Game not found!"});
        }
        else{
            res.json(row);
        }
    });
}

const getTeamScoreFromTeamGameId = (req,res) =>{
  const sql = `
    SELECT sum(g.PTS) as total_points
    FROM game_logs g
	JOIN player_stats p
	ON g.PLAYER_ID = p.PLAYER_ID
    WHERE g.GAME_ID = ? AND p.TEAM_ID = ?
    `;
    const {game_id, team_id} = req.params;

    db.all(sql, [game_id, team_id], (err,row) => {
        if(err){
            res.status(500).json({error:err.message});
        }
        else if (!row){
            res.status(404).json({message: "Game not found!"});
        }
        else{
            res.json(row);
        }
    });
}

const getTotalPointsFromGameId = (req,res) =>{
    const sql = `
    SELECT g.MATCHUP, SUM(g.PTS) AS total_points
    FROM game_logs g
    WHERE g.GAME_ID = ?
    GROUP BY g.MATCHUP
    `;
    const {id} = req.params;

    db.all(sql, [id], (err,row) => {
        if(err){
            res.status(500).json({error:err.message});
        }
        else if (!row){
            res.status(404).json({message: "Game not found!"});
        }
        else{
            res.json(row);
        }
    });
}

module.exports = {
    getGameById,
    getTeamIdsFromGameId,
    getTeamScoreFromTeamGameId,
    getTotalPointsFromGameId
}