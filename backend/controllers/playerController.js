const db = require('../db/database');

const getAllPlayers = (req, res) => {
  const sql = `
    WITH current AS (
      SELECT crt_date FROM app_settings WHERE id = 1
    )
    SELECT p.PLAYER_NAME, p.PTS, t.TEAM_NAME
    FROM player_stats p
    JOIN team_stats t ON p.TEAM_ID = t.TEAM_ID
    JOIN game_logs g ON p.PLAYER_ID = g.PLAYER_ID
    WHERE g.GAME_DATE <= (SELECT crt_date FROM current)
    GROUP BY p.PLAYER_ID
    ORDER BY p.PTS DESC
    LIMIT 1
  `;
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
};

const getPlayerById = (req,res) => {
    const sql = `
    WITH current AS (
      SELECT crt_date FROM app_settings WHERE id = 1
    ),
    player_stats_to_date AS (
      SELECT 
        PLAYER_ID,
        COUNT(*) as total_games,
        SUM(PTS) as total_pts,
        SUM(REB) as total_reb,
        SUM(AST) as total_ast
      FROM game_logs
      WHERE PLAYER_ID = ? AND GAME_DATE <= (SELECT crt_date FROM current)
      GROUP BY PLAYER_ID
    )
    SELECT 
      p.PLAYER_ID, 
      p.PLAYER_NAME, 
      p.TEAM_ID, 
      p.AGE, 
      p.GP, 
      p.MIN, 
      s.total_pts as PTS,
      s.total_reb as REB,
      s.total_ast as AST,
      t.TEAM_NAME, 
      t.COLOR1, 
      t.COLOR2,
      s.total_games as GAMES_PLAYED
    FROM player_stats p
    JOIN team_stats t ON p.TEAM_ID = t.TEAM_ID
    LEFT JOIN player_stats_to_date s ON p.PLAYER_ID = s.PLAYER_ID
    WHERE p.PLAYER_ID = ?
    `;
    const {id} = req.params;

    db.get(sql, [id, id], (err,row) => {
        if(err){
            res.status(500).json({error:err.message});
        }
        else if (!row){
            res.status(404).json({message: "Player not found!"});
        }
        else{
            res.json(row);
        }
    });
};

const getTop10Players = (req,res) =>{
  const sql = `
    WITH current AS (
      SELECT crt_date FROM app_settings WHERE id = 1
    )
    SELECT 
      g.PLAYER_ID,
      p.PLAYER_NAME,
      SUM(g.PTS + g.AST + g.REB) AS eff
    FROM game_logs g
    JOIN player_stats p ON g.PLAYER_ID = p.PLAYER_ID
    JOIN team_stats t ON p.TEAM_ID = t.TEAM_ID
    WHERE g.GAME_DATE <= (SELECT crt_date FROM current)
    GROUP BY g.PLAYER_ID
    ORDER BY eff DESC
    LIMIT 10
  `;
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
}

const getPlayerSeasonStats = (req,res) =>{
  const sql = `
    WITH current AS (
      SELECT crt_date FROM app_settings WHERE id = 1
    ),
    games_played AS (
      SELECT COUNT(*) as total_games
      FROM game_logs
      WHERE PLAYER_ID = ? AND GAME_DATE <= (SELECT crt_date FROM current)
    )
    SELECT 
      p.PLAYER_ID, 
      g.GAME_ID, 
      g.GAME_DATE, 
      g.MATCHUP, 
      g.WL, 
      g.MIN, 
      g.FGM, 
      g.FGA, 
      g.FG_PCT, 
      g.FG3M, 
      g.FG3A, 
      g.FG3_PCT, 
      g.FTM, 
      g.FTA, 
      g.FT_PCT, 
      g.OREB, 
      g.DREB, 
      g.REB,
      g.AST, 
      g.STL, 
      g.BLK, 
      g.TOV, 
      g.PF,
      g.PTS, 
      g.PLUS_MINUS,
      (SELECT total_games FROM games_played) as GAMES_PLAYED
    FROM player_stats p
    JOIN game_logs g ON p.PLAYER_ID = g.PLAYER_ID
    WHERE p.PLAYER_ID = ? AND g.GAME_DATE <= (SELECT crt_date FROM current)
  `;
  const {id} = req.params;

    db.all(sql, [id, id], (err,row) => {
        if(err){
            res.status(500).json({error:err.message});
        }
        else if (!row){
            res.status(404).json({message: "Player not found!"});
        }
        else{
            res.json(row);
        }
    });
}

const getPlayerByName = (req,res) =>{
  const sql = `
      SELECT p.PLAYER_ID, p.PLAYER_NAME, p.TEAM_ID, p.AGE, t.TEAM_NAME
      FROM player_stats p
      JOIN team_stats t 
      ON p.TEAM_ID = t.TEAM_ID
      WHERE p.PLAYER_NAME LIKE ?
      LIMIT 5
      `;
  const {name} = req.params;
  const searchTerm = `%${name}%`; //pt cautare partiala

  db.all(sql, [searchTerm], (err,row) => {
    if(err){
        res.status(500).json({error:err.message});
    }
    else if (!row || row.length === 0){
        res.status(404).json({message: "Player not found!"});
    }
    else{
        res.json(row);
    }
  });
}

const getPlayerShots = (req,res) =>{
  const sql = `
  SELECT LOC_X, LOC_Y, SHOT_MADE_FLAG, SHOT_ZONE_BASIC 
  FROM shots 
  WHERE PLAYER_ID = ?
  `
  const {id} = req.params;
  db.all(sql, [id], (err,row) => {
    if(err){
      res.status(500).json({error:err.message});
    }
    else if (!row){
      res.status(404).json({message: "Player not found!"});
    }
    else{
      res.json(row);
    }
  });
}

const getPlayerAverages = (req, res) => {
    const { id } = req.params;
    
    const sql = `
    WITH current AS (
        SELECT crt_date FROM app_settings WHERE id = 1
    )
    SELECT 
        p.PLAYER_ID,
        p.PLAYER_NAME,
        t.TEAM_NAME,
        ROUND(AVG(g.PTS), 1) as AVG_PTS,
        ROUND(AVG(g.REB), 1) as AVG_REB,
        ROUND(AVG(g.AST), 1) as AVG_AST,
        ROUND(AVG(g.STL), 1) as AVG_STL,
        ROUND(AVG(g.BLK), 1) as AVG_BLK,
        ROUND(AVG(g.TOV), 1) as AVG_TOV,
        ROUND(AVG(g.MIN), 1) as AVG_MIN,
        ROUND(AVG(g.FG_PCT) * 100, 1) as AVG_FG_PCT,
        ROUND(AVG(g.FG3_PCT) * 100, 1) as AVG_FG3_PCT,
        ROUND(AVG(g.FT_PCT) * 100, 1) as AVG_FT_PCT,
        COUNT(g.GAME_ID) as GAMES_PLAYED
    FROM player_stats p
    JOIN team_stats t ON p.TEAM_ID = t.TEAM_ID
    JOIN game_logs g ON p.PLAYER_ID = g.PLAYER_ID
    WHERE p.PLAYER_ID = ? AND g.GAME_DATE <= (SELECT crt_date FROM current)
    GROUP BY p.PLAYER_ID
    `;

    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ message: "Player not found!" });
            return;
        }
        res.json(row);
    });
};

const getAllPlayersWithStats = (req, res) => {
    const sql = `
    WITH current AS (
        SELECT crt_date FROM app_settings WHERE id = 1
    ),
    player_stats_to_date AS (
        SELECT 
            PLAYER_ID,
            COUNT(*) as games_played,
            SUM(PTS) as total_pts,
            SUM(REB) as total_reb,
            SUM(AST) as total_ast
        FROM game_logs
        WHERE GAME_DATE <= (SELECT crt_date FROM current)
        GROUP BY PLAYER_ID
    )
    SELECT 
        p.PLAYER_ID,
        p.PLAYER_NAME,
        p.TEAM_ID,
        p.AGE,
        t.TEAM_NAME,
        t.COLOR1,
        t.COLOR2,
        COALESCE(s.games_played, 0) as games_played,
        COALESCE(s.total_pts, 0) as total_pts,
        COALESCE(s.total_reb, 0) as total_reb,
        COALESCE(s.total_ast, 0) as total_ast,
        CASE 
            WHEN COALESCE(s.games_played, 0) > 0 
            THEN ROUND(CAST(s.total_pts AS FLOAT) / s.games_played, 1)
            ELSE 0 
        END as ppg,
        CASE 
            WHEN COALESCE(s.games_played, 0) > 0 
            THEN ROUND(CAST(s.total_reb AS FLOAT) / s.games_played, 1)
            ELSE 0 
        END as rpg,
        CASE 
            WHEN COALESCE(s.games_played, 0) > 0 
            THEN ROUND(CAST(s.total_ast AS FLOAT) / s.games_played, 1)
            ELSE 0 
        END as apg
    FROM player_stats p
    JOIN team_stats t ON p.TEAM_ID = t.TEAM_ID
    LEFT JOIN player_stats_to_date s ON p.PLAYER_ID = s.PLAYER_ID
    ORDER BY ppg DESC`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
};

module.exports = { 
    getAllPlayers,
    getPlayerById,
    getTop10Players,
    getPlayerSeasonStats,
    getPlayerByName,
    getPlayerShots,
    getPlayerAverages,
    getAllPlayersWithStats
};
