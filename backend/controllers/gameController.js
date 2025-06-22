const db = require('../db/database');

//returns a 15-count list of gameIds after the crt_date from the database
const getNextRound = (req,res) =>{
    const sql = `SELECT GAME_ID, MIN(GAME_DATE) AS gd, matchup
FROM game_logs
WHERE GAME_DATE > (SELECT crt_date FROM app_settings where id= 1)
GROUP BY GAME_ID
ORDER BY gd
LIMIT 10;`;
    db.all(sql, [], (err,rows) =>{
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
          }
        return res.json(rows);
    })
}
//fetch statline of the most recent game of a player
const getLastGameStatsForPlayer = (req, res) =>{
    const sql = `SELECT * FROM game_logs
WHERE PLAYER_ID = ? AND
GAME_DATE < (SELECT crt_date FROM app_settings where id= 1)
ORDER BY GAME_DATE desc
LIMIT 1`
const {id} = req.params;

    db.get(sql, [id], (err, rows)=>{
        if(err){
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        return res.json(rows);
    })
}

const getGameStatsForPlayer = (req, res) =>{
    const sql = `SELECT * FROM game_logs
WHERE PLAYER_ID = ? AND
GAME_ID = ? AND
GAME_DATE < (SELECT crt_date FROM app_settings where id= 1)
ORDER BY GAME_DATE desc
LIMIT 1`
const {playerId,gameId} = req.params;

    db.get(sql, [playerId, gameId], (err, rows)=>{
        if(err){
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        return res.json(rows);
    })
}

module.exports = {
    getNextRound,
    getLastGameStatsForPlayer,
    getGameStatsForPlayer,
}