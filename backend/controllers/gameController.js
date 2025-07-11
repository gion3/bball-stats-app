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
//get stats for a player for the last round
const getLastRoundStatsForPlayer = (req, res) =>{
    const sql = `SELECT * FROM game_logs
WHERE PLAYER_ID = ? AND
ROUND_NO < (SELECT crt_round FROM app_settings where id= 1)
ORDER BY ROUND_NO desc
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

getCurrentRoundGames = async (req, res) => {
    const { round_no } = req.params;

    console.log(round_no)

    const sql = `
        SELECT game_id, MIN(MATCHUP) as MATCHUP, GAME_DATE
        FROM game_logs
        WHERE round_no = ?
        GROUP BY game_id;
    `;

    db.all(sql, [round_no], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to fetch current round games', error: err.message });
        }
        return res.json(rows);
    });
};


getCurrentRoundNumber = async (req,res) =>{
    console.log('OK')
    const sql = `
    WITH ordered_games AS (
            SELECT
                game_id,
                game_date,
                ROW_NUMBER() OVER (ORDER BY game_date, game_id) AS rn
            FROM (
                SELECT DISTINCT game_id, game_date
                FROM game_logs
                WHERE game_date <= (SELECT crt_date FROM app_settings WHERE id = 1)
            )
            )
            SELECT MAX(((rn - 1) / 15) + 1) AS current_round
            FROM ordered_games;`
    db.get(sql,[], (err,rows) =>{
        if (err) {
            return res.status(500).json({ message: 'Failed to fetch current round number', error: err.message });
        }
        return res.json(rows);
    })
}

module.exports = {
    getNextRound,
    getLastGameStatsForPlayer,
    getGameStatsForPlayer,
    getCurrentRoundGames,
    getCurrentRoundNumber,
    getLastRoundStatsForPlayer,
    
}