const db = require('../db/database');

const getAllPlayers = (req, res) => {
  const sql = `
    SELECT p.PLAYER_NAME, p.PTS, t.TEAM_NAME
    FROM player_stats p
    JOIN team_stats t ON p.TEAM_ID = t.TEAM_ID
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
    SELECT p.PLAYER_ID, p.PLAYER_NAME, p.TEAM_ID, p.AGE, p.GP, p.MIN, p.PTS, p.REB, p.AST, t.TEAM_NAME, t.COLOR1, t.COLOR2   
    FROM player_stats p
    JOIN team_stats t 
    ON p.TEAM_ID = t.TEAM_ID
    WHERE PLAYER_ID = ?
    `;
    const {id} = req.params;

    db.get(sql, [id], (err,row) => {
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
    SELECT p.PLAYER_ID, (p.PTS + p.AST + p.REB) as eff
    FROM player_stats p
    JOIN team_stats t ON p.TEAM_ID = t.TEAM_ID
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
    SELECT p.PLAYER_ID, g.GAME_ID, g.GAME_DATE, g.MATCHUP, g.WL, g.MIN, g.FGM, g.FGA, g.FG_PCT, g.FG3M, 
    g.FG3A, g.FG3_PCT, g.FTM, g.FTA, g.FT_PCT, g.OREB, g.DREB, g.REB,
    g.AST, g.STL, g.BLK, g.TOV, g.PF,g.PTS, g.PLUS_MINUS
    FROM player_stats p
    JOIN game_logs g
    ON p.PLAYER_ID = g.PLAYER_ID
    WHERE p.PLAYER_ID = ?
  `;
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

module.exports = { 
    getAllPlayers,
    getPlayerById,
    getTop10Players,
    getPlayerSeasonStats,
    getPlayerByName,
    getPlayerShots
};
