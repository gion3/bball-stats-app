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
    SELECT DISTINCT p.PLAYER_ID, p.TEAM_ID, t.TEAM_NAME
    FROM game_logs g
	JOIN player_stats p
	ON g.PLAYER_ID = p.PLAYER_ID
    JOIN team_stats t
    ON p.TEAM_ID = t.TEAM_ID
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

const getMostRecentGames = (req,res) =>{
    const sql = `
    WITH current AS (
        SELECT crt_date FROM app_settings WHERE id = 1
    )
    SELECT DISTINCT GAME_ID, GAME_DATE 
    FROM game_logs 
    WHERE GAME_DATE <= (SELECT crt_date FROM current)
    ORDER BY GAME_DATE DESC
    LIMIT 5`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: "No games found!" });
        }

        res.json(rows);
    });
}

const getMetaDataById = (req,res) =>{
    const sql = `
    SELECT GAME_DATE, MATCHUP
    FROM game_logs
    WHERE GAME_ID = ?
    LIMIT 1
    `;
    const {id} = req.params;

    db.get(sql, [id], (err,row) => {
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

const getStandings = (req,res) =>{
  const sql = `
    WITH current AS (
    SELECT crt_date FROM app_settings WHERE id = 1
    ),
    unique_games AS (
        SELECT
            GAME_ID,
            GAME_DATE,
            home_team_id,
            away_team_id,
            WL,
            MATCHUP
        FROM game_logs
        WHERE GAME_DATE <= (SELECT crt_date FROM current)
        GROUP BY GAME_ID
    ),
    game_winners AS (
        SELECT
            GAME_ID,
            home_team_id,
            away_team_id,
            CASE
                WHEN WL = 'W' AND MATCHUP LIKE '%vs.%' THEN home_team_id
                WHEN WL = 'L' AND MATCHUP LIKE '%vs.%' THEN away_team_id
                WHEN WL = 'W' AND MATCHUP LIKE '%@%' THEN away_team_id
                WHEN WL = 'L' AND MATCHUP LIKE '%@%' THEN home_team_id
            END AS winner_team_id,
            CASE
                WHEN WL = 'W' AND MATCHUP LIKE '%vs.%' THEN away_team_id
                WHEN WL = 'L' AND MATCHUP LIKE '%vs.%' THEN home_team_id
                WHEN WL = 'W' AND MATCHUP LIKE '%@%' THEN home_team_id
                WHEN WL = 'L' AND MATCHUP LIKE '%@%' THEN away_team_id
            END AS loser_team_id
        FROM unique_games
    ),
    team_wins AS (
        SELECT winner_team_id AS team_id, COUNT(*) AS wins
        FROM game_winners
        GROUP BY winner_team_id
    ),
    team_losses AS (
        SELECT loser_team_id AS team_id, COUNT(*) AS losses
        FROM game_winners
        GROUP BY loser_team_id
    )
    SELECT
        t.team_id,
        ts.team_name,
        COALESCE(w.wins, 0) AS W,
        COALESCE(l.losses, 0) AS L,
        COALESCE(w.wins, 0) + COALESCE(l.losses, 0) AS GP,
        ROUND(CAST(COALESCE(w.wins, 0) AS FLOAT) / (COALESCE(w.wins, 0) + COALESCE(l.losses, 0)), 3) AS W_PCT
    FROM (
        SELECT home_team_id AS team_id FROM game_winners
        UNION
        SELECT away_team_id AS team_id FROM game_winners
    ) t
    LEFT JOIN team_wins w ON t.team_id = w.team_id
    LEFT JOIN team_losses l ON t.team_id = l.team_id
    LEFT JOIN team_stats ts ON t.team_id = ts.team_id
    ORDER BY W_PCT DESC, W DESC;
  `;
  db.all(sql, [], (err,rows) => {
    if(err){
      res.status(500).json({error:err.message});
    }
    else{
      res.json(rows);
    }
  })
}

module.exports = {
    getGameById,
    getTeamIdsFromGameId,
    getTeamScoreFromTeamGameId,
    getTotalPointsFromGameId,
    getMostRecentGames,
    getMetaDataById,
    getStandings
}