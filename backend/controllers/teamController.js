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
    SELECT DISTINCT p.TEAM_ID, t.TEAM_NAME
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
    const sql = `SELECT DISTINCT GAME_ID, GAME_DATE FROM game_logs`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: "No games found!" });
        }

        // 2. Parse game_date and add as parsedDate property
        const gamesWithParsedDate = rows.map(row => ({
            ...row,
            parsedDate: new Date(row.GAME_DATE)
        }));

        console.log(gamesWithParsedDate);
        console.log('test');

        // 3. Sort by parsedDate descending
        gamesWithParsedDate.sort((a, b) => b.parsedDate - a.parsedDate);

        // 4. Take the first 10
        const mostRecentGames = gamesWithParsedDate.slice(0, 5);

        res.json(mostRecentGames);
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

module.exports = {
    getGameById,
    getTeamIdsFromGameId,
    getTeamScoreFromTeamGameId,
    getTotalPointsFromGameId,
    getMostRecentGames,
    getMetaDataById
}