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
    console.log('Top 10 players:', rows);
    res.json(rows);
  });
}

module.exports = { 
    getAllPlayers,
    getPlayerById,
    getTop10Players,
};
