const db = require('../db/database');

async function checkAndProcessRoundEnd(currentDate) {
    // 1. Find all rounds where last game date <= currentDate and not yet processed
   

    const rounds = await new Promise((resolve, reject) => {
        db.all(`
        SELECT round_no, MAX(game_date) as last_game_date
        FROM game_logs
        GROUP BY round_no
        HAVING last_game_date <= ?
    `, [currentDate], (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
    });

    console.log(rounds)
    console.log("hello")

    for (const round of rounds) {
        //2. Check if this round has already been processed (e.g., in a fantasy_round_scores table)
        const alreadyProcessed = await new Promise((resolve, reject) => {
            db.get('SELECT 1 FROM fantasy_round_scores WHERE round_no = ?', [round.round_no], (err, row) => {
              if (err) return reject(err);
              resolve(row);
            });
          });
        if (!alreadyProcessed) {
            // 3. Run your round-end logic for this round
            await processRound(round.round_no);
        }
    }
}

async function processRound(round_no){
    // const userIds = db.all(`SELECT user_id FROM fantasy_teams`,[]);
    //console.log(userIds);
    const userIds = await new Promise((resolve, reject) => {
        db.all('SELECT user_id FROM fantasy_teams', [], (err, row) => {
          if (err) return reject(err);
          resolve(row);
        });
    });
    console.log(userIds);

    for (const userId of userIds){
        const roundScore = await new Promise((resolve, reject) => {
            db.get(`SELECT
                    fr.user_id,
                    SUM(gl.PIR) AS total_pir
                FROM
                    fantasy_rosters fr
                JOIN
                    game_logs gl ON fr.player_id = gl.player_id
                WHERE
                    fr.user_id = ?
                AND
                    gl.round_no = ?
                GROUP BY
                    fr.user_id;
                `, [userId.user_id, round_no], (err, row) => {
              if (err) return reject(err);
              resolve(row);
            });
        });
        if (roundScore && roundScore.total_pir !== null) {
            await new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO fantasy_round_scores (round_no, user_id, score)
                     VALUES (?, ?, ?)`,
                    [round_no, userId.user_id, roundScore.total_pir],
                    function (err) {
                        if (err) return reject(err);
                        resolve();
                    }
                );
            });
        }
    }

    //netestate inca
    // const playerPIRs = await new Promise((resolve, reject) => {
    //     db.all(
    //         `SELECT player_id, PIR
    //          FROM game_logs
    //          WHERE round_no = ?`,
    //         [round_no],
    //         (err, rows) => {
    //             if (err) return reject(err);
    //             resolve(rows);
    //         }
    //     );
    // });
    
    // // 2. For each player/game, update their fantasy_price
    // for (const { player_id, PIR } of playerPIRs) {
    //     await new Promise((resolve, reject) => {
    //         db.run(
    //             `UPDATE player_stats
    //              SET fantasy_price = fantasy_price + (0.02 * ?)
    //              WHERE PLAYER_ID = ?`,
    //             [PIR, player_id],
    //             function (err) {
    //                 if (err) return reject(err);
    //                 resolve();
    //             }
    //         );
    //     });
    // }
}

// Get the current round
const getCurrentRound = (req, res) => {
    db.get('SELECT crt_round FROM app_settings WHERE id = 1', [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({row});
    });
};

// Update the current round
// const updateCurrentDate = async (req, res) => {
//     const { date } = req.body;

//     if (!date) {
//         return res.status(400).json({ error: 'Date is required' });
//     }

//     // Validate date format (YYYY-MM-DD)
//     const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
//     if (!dateRegex.test(date)) {
//         return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
//     }

//     const sql = `
//         INSERT INTO app_settings (id, crt_date) 
//         VALUES (1, ?) 
//         ON CONFLICT(id) DO UPDATE SET crt_date = ?
//     `;

//     try {
//         await new Promise((resolve, reject) => {
//             db.run(sql, [date, date], function(err) {
//                 if (err) return reject(err);
//                 resolve();
//             });
//         });

//         await checkAndProcessRoundEnd(date);

//         return res.json({ 
//             message: 'Date updated and round processed if needed',
//             currentDate: date
//         });
//     } catch (err) {
//         console.error(err.message);
//         return res.status(500).json({ error: err.message });
//     }
// };

// Advance to next round (max 82)
const advanceRound = async (req, res) => {
    try {
        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE app_settings SET crt_round = MIN(crt_round + 1, 82) WHERE id = 1`,
                [],
                function (err) {
                    if (err) return reject(err);
                    resolve();
                }
            );
        });
        db.get('SELECT crt_round FROM app_settings WHERE id = 1', [], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ crt_round: row.crt_round });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Go back to previous round (min 1)
const goBackRound = async (req, res) => {
    try {
        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE app_settings SET crt_round = MAX(crt_round - 1, 1) WHERE id = 1`,
                [],
                function (err) {
                    if (err) return reject(err);
                    resolve();
                }
            );
        });
        db.get('SELECT crt_round FROM app_settings WHERE id = 1', [], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ crt_round: row.crt_round });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Set round to a specific value (1-82)
const setRound = async (req, res) => {
    const { round } = req.body;
    if (typeof round !== 'number' || round < 1 || round > 82) {
        return res.status(400).json({ error: 'Round must be a number between 1 and 82' });
    }
    try {
        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE app_settings SET crt_round = ? WHERE id = 1`,
                [round],
                function (err) {
                    if (err) return reject(err);
                    resolve();
                }
            );
        });
        db.get('SELECT crt_round FROM app_settings WHERE id = 1', [], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ crt_round: row.crt_round });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    //getCurrentDate,
    //updateCurrentDate,
    getCurrentRound,
    advanceRound,
    goBackRound,
    setRound,
};