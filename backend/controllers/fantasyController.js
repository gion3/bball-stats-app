const admin = require('firebase-admin');
const db = require('../db/database');

// Placeholder functions for fantasy league management

// Helper to generate a random access code
function generateAccessCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * @desc Create a new league
 * @route POST /api/leagues/create
 * @access Private
 */
exports.createLeague = async (req, res) => {
    const { name } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication token required.' });
    if (!name) return res.status(400).json({ message: 'League name required.' });

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid } = decodedToken;

        db.get('SELECT id FROM users WHERE firebase_uid = ?', [uid], (err, user) => {
            if (err || !user) return res.status(500).json({ message: 'User lookup failed.' });

            // Fetch the user's only fantasy team
            db.get('SELECT id FROM fantasy_teams WHERE user_id = ?', [user.id], (err, team) => {
                if (err) return res.status(500).json({ message: 'Failed to fetch user team.' });
                if (!team) return res.status(400).json({ message: 'User does not have a fantasy team.' });

                // Generate unique access code
                function insertLeagueWithCode() {
                    const accessCode = generateAccessCode();
                    db.run(
                        'INSERT INTO fantasy_leagues (name, access_code, created_by) VALUES (?, ?, ?)',
                        [name, accessCode, user.id],
                        function (err) {
                            if (err && err.message.includes('UNIQUE constraint failed: leagues.access_code')) {
                                // Retry with a new code
                                insertLeagueWithCode();
                            } else if (err) {
                                return res.status(500).json({ message: 'Failed to create league', error: err.message });
                            } else {
                                // Add creator as first member using their only team
                                db.run(
                                    'INSERT INTO fantasy_league_members (league_id, user_id) VALUES (?, ?)',
                                    [this.lastID, user.id],
                                    (err) => {
                                        if (err) return res.status(500).json({ message: 'Failed to add creator to league', error: err.message });
                                        res.status(201).json({ leagueId: this.lastID, accessCode });
                                    }
                                );
                            }
                        }
                    );
                }
                insertLeagueWithCode();
            });
        });
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.', error: error.message });
    }
};
/**
 * @desc Join a league using access code
 * @route POST /api/leagues/join
 * @access Private
 */
exports.joinLeague = async (req, res) => {
    const { accessCode} = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication token required.' });
    if (!accessCode) return res.status(400).json({ message: 'Access code required.' });

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid } = decodedToken;

        db.get('SELECT id FROM users WHERE firebase_uid = ?', [uid], (err, user) => {
            if (err || !user) return res.status(500).json({ message: 'User lookup failed.' });

            db.get('SELECT id FROM fantasy_leagues WHERE access_code = ?', [accessCode], (err, league) => {
                if (err || !league) return res.status(404).json({ message: 'League not found.' });

                // Check if already a member
                db.get(
                    'SELECT id FROM fantasy_league_members WHERE league_id = ? AND user_id = ?',
                    [league.id, user.id],
                    (err, member) => {
                        if (member) return res.status(409).json({ message: 'Already a member of this league.' });

                        db.run(
                            'INSERT INTO fantasy_league_members (league_id, user_id) VALUES (?, ?)',
                            [league.id, user.id],
                            function (err) {
                                if (err) return res.status(500).json({ message: 'Failed to join league', error: err.message });
                                res.status(200).json({ message: 'Joined league successfully.' });
                            }
                        );
                    }
                );
            });
        });
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.', error: error.message });
    }
};
/**
 * @desc Get details of a fantasy league (user names and team names)
 * @route GET /api/leagues/:id
 * @access Public
 */
exports.getLeagueDetails = async (req, res) => {
    const { id } = req.params;

    // Query to get user names and team names for all members of the league
    const sql = `
        SELECT 
            users.display_name, 
            fantasy_teams.name AS team_name
        FROM fantasy_league_members
        JOIN users ON fantasy_league_members.user_id = users.id
        JOIN fantasy_teams ON fantasy_league_members.team_id = fantasy_teams.id
        WHERE fantasy_league_members.league_id = ?
    `;

    db.all(sql, [id], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to fetch league members', error: err.message });
        }
        res.status(200).json({ members: rows });
    });
};

// Placeholder functions for fantasy team management

/**
 * @desc Create a new fantasy team
 * @route POST /api/fantasy/teams
 * @access Private
 */
exports.createTeam = async (req, res) => {
    const { teamName } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ message: 'Authentication token required.' });
    }
    if (!teamName) {
      return res.status(400).json({ message: 'Team name is required.' });
    }
  
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const { uid } = decodedToken;
  
      db.get('SELECT id FROM users WHERE firebase_uid = ?', [uid], (err, user) => {
        if (err || !user) {
          return res.status(404).json({ message: 'User not found.' });
        }
  
        // Check if user already has a team
        db.get('SELECT id FROM fantasy_teams WHERE user_id = ?', [user.id], (err, team) => {
          if (team) {
            return res.status(400).json({ message: 'User already has a fantasy team.' });
          }
  
          // Create the team with a budget of 40
          db.run('INSERT INTO fantasy_teams (name, user_id, budget) VALUES (?, ?, ?)', [teamName, user.id, 40], function (err) {
            if (err) {
              return res.status(500).json({ message: 'Failed to create team', error: err.message });
            }
            res.status(201).json({
              message: 'Team created successfully',
              teamId: this.lastID,
              teamName: teamName,
              budget: 40
            });
          });
        });
      });
    } catch (error) {
      res.status(401).json({ message: 'Invalid or expired token.', error: error.message });
    }
};
/**
 * @desc Get all fantasy teams for the authenticated user
 * @route GET /api/fantasy/teams
 * @access Private
 */
exports.getUserTeams = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid } = decodedToken;

        // Get the local user ID, then fetch their teams
        db.get('SELECT id FROM users WHERE firebase_uid = ?', [uid], (err, user) => {
            if (err) {
                return res.status(500).json({ message: 'Database error finding user', error: err.message });
            }
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            db.all('SELECT * FROM fantasy_teams WHERE user_id = ?', [user.id], (err, teams) => {
                if (err) {
                    return res.status(500).json({ message: 'Database error fetching teams', error: err.message });
                }
                res.status(200).json(teams);
            });
        });
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.', error: error.message });
    }
};

// Placeholder functions for drafting

/**
 * @desc Add a player to a fantasy team
 * @route POST /api/fantasy/teams/:teamId/addPlayer
 * @access Private
 */
exports.addPlayer = async (req, res) => {
    const { teamId } = req.params;
    const { playerId } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }
    if (!playerId) {
        return res.status(400).json({ message: 'Player ID is required.' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid } = decodedToken;

        // First, get the local user ID based on their Firebase UID
        db.get('SELECT id FROM users WHERE firebase_uid = ?', [uid], (err, user) => {
            if (err) {
                return res.status(500).json({ message: 'Database error finding user', error: err.message });
            }
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            // Next, verify the user owns the team they're modifying
            db.get('SELECT id FROM fantasy_teams WHERE id = ? AND user_id = ?', [teamId, user.id], (err, team) => {
                if (err) {
                    return res.status(500).json({ message: 'Database error verifying team ownership', error: err.message });
                }
                if (!team) {
                    return res.status(403).json({ message: 'Forbidden: You do not own this team.' });
                }

                // Finally, add the player to the roster
                const stmt = db.prepare('INSERT INTO fantasy_rosters (fantasy_team_id, player_id) VALUES (?, ?)');
                stmt.run(teamId, playerId, function (err) {
                    if (err) {
                        // Handle cases where the player is already on the team (UNIQUE constraint failure)
                        if (err.code === 'SQLITE_CONSTRAINT') {
                            return res.status(409).json({ message: 'Player is already on this team.' });
                        }
                        return res.status(500).json({ message: 'Failed to add player to team', error: err.message });
                    }
                    res.status(201).json({ message: 'Player added successfully to team', rosterEntryId: this.lastID });
                });
                stmt.finalize();
            });
        });
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.', error: error.message });
    }
};

/**
 * @desc Get the roster for a specific fantasy team
 * @route GET /api/fantasy/teams/:teamId/roster
 * @access Private
 */
exports.getTeamRoster = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid } = decodedToken;

        db.get('SELECT id FROM users WHERE firebase_uid = ?', [uid], (err, user) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err.message });
            if (!user) return res.status(404).json({ message: 'User not found.' });

            // Fetch the roster (player IDs) for this user
            db.all('SELECT player_id FROM fantasy_rosters WHERE user_id = ?', [user.id], (err, rows) => {
                if (err) {
                    return res.status(500).json({ message: 'Failed to fetch roster', error: err.message });
                }
                const playerIds = rows.map(row => row.player_id);
                res.status(200).json(playerIds);
            });
        });
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.', error: error.message });
    }
};

/**
 * @desc Set/overwrite the entire roster for a specific fantasy team
 * @route PUT /api/fantasy/teams/:teamId/roster
 * @access Private
 */
exports.setTeamRoster = async (req, res) => {
    const { playerIds } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }
    if (!Array.isArray(playerIds) || playerIds.length !== 5) {
        return res.status(400).json({ message: 'Roster must contain exactly 5 players.' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid } = decodedToken;

        db.get('SELECT id FROM users WHERE firebase_uid = ?', [uid], (err, user) => {
            if (err) return res.status(500).json({ message: 'Database error finding user', error: err.message });
            if (!user) return res.status(404).json({ message: 'User not found.' });

            // Use a transaction to ensure the roster update is atomic
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');
                db.run('DELETE FROM fantasy_rosters WHERE user_id = ?', [user.id]);
                
                const stmt = db.prepare('INSERT INTO fantasy_rosters (user_id, player_id) VALUES (?, ?)');
                for (const playerId of playerIds) {
                    stmt.run([user.id, playerId]);
                }
                stmt.finalize();

                db.run('COMMIT', (commitErr) => {
                    if (commitErr) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ message: 'Failed to save roster.', error: commitErr.message });
                    }
                    res.status(200).json({ message: 'Roster updated successfully.' });
                });
            });
        });
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.', error: error.message });
    }
};

/**
 * @desc Remove a player from a fantasy team's roster
 * @route DELETE /api/fantasy/teams/:teamId/roster/:playerId
 * @access Private
 */
exports.removePlayerFromRoster = async (req, res) => {
    const { teamId, playerId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid } = decodedToken;

        // Verify user owns the team
        db.get('SELECT id FROM users WHERE firebase_uid = ?', [uid], (err, user) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err.message });
            if (!user) return res.status(404).json({ message: 'User not found.' });

            db.get('SELECT id FROM fantasy_teams WHERE id = ? AND user_id = ?', [teamId, user.id], (err, team) => {
                if (err) return res.status(500).json({ message: 'Database error', error: err.message });
                if (!team) return res.status(403).json({ message: 'Forbidden: You do not own this team.' });

                // Delete the player from the roster
                db.run('DELETE FROM fantasy_rosters WHERE fantasy_team_id = ? AND player_id = ?', [teamId, playerId], function (err) {
                    if (err) {
                        return res.status(500).json({ message: 'Failed to remove player', error: err.message });
                    }
                    if (this.changes === 0) {
                        return res.status(404).json({ message: 'Player not found on this roster.' });
                    }
                    res.status(200).json({ message: 'Player removed successfully.' });
                });
            });
        });
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.', error: error.message });
    }
};

/**
 * @desc Get all leagues the authenticated user is a member of
 * @route GET /api/leagues/mine
 * @access Private
 */
exports.getMyLeagues = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication token required.' });
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid } = decodedToken;
        db.get('SELECT id FROM users WHERE firebase_uid = ?', [uid], (err, user) => {
            if (err || !user) return res.status(500).json({ message: 'User lookup failed.' });
            const sql = `
                SELECT l.id, l.name, l.access_code, l.created_by, l.created_at
                FROM fantasy_league_members m
                JOIN fantasy_leagues l ON m.league_id = l.id
                WHERE m.user_id = ?
            `;
            db.all(sql, [user.id], (err, rows) => {
                if (err) return res.status(500).json({ message: 'Failed to fetch leagues', error: err.message });
                res.status(200).json({ leagues: rows });
            });
        });
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.', error: error.message });
    }
};
/**
 * @desc Get number of users in a league
 * @route GET /api/leagues/:id/usercount
 * @access Public
 */
exports.getLeagueMemberCount = async (req, res) => {
    const { id } = req.params;

    const sql = `
        select count(user_id) from fantasy_league_members
        where league_id = ?;
    `;

    db.all(sql, [id], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to fetch number of league members', error: err.message });
        }
        res.status(200).json({ members: rows });
    });
};

/**
 * @desc Get number of users in a league
 * @route GET /api/leagues/userdata/:id
 * @access Public
 */
exports.getMemberDataForLeague = async (req, res) => {
    const { id } = req.params;
    const sql = `
        
    `;
    db.all(sql, [id], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to fetch member data', error: err.message });
        }
        res.status(200).json({ members: rows });
    });
};
exports.getUserTotalScore = async (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT ROUND(SUM(SCORE),2) as total_score FROM fantasy_round_scores
        WHERE user_id = ?;
    `;
    db.all(sql, [id], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to fetch member total score', error: err.message });
        }
        res.status(200).json({ members: rows });
    });
};
exports.getUserScoreByRound = async (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT round_no, ROUND(SUM(score), 2) as score_per_round
        FROM fantasy_round_scores
        WHERE user_id = ?
        GROUP BY round_no
        ORDER BY round_no ASC
    `;
    db.all(sql, [id], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to fetch scores by round', error: err.message });
        }
        res.status(200).json({ scores: rows });
    });
};

exports.deleteTeam = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid } = decodedToken;

        db.get('SELECT id FROM users WHERE firebase_uid = ?', [uid], (err, user) => {
            if (err) return res.status(500).json({ message: 'Database error finding user', error: err.message });
            if (!user) return res.status(404).json({ message: 'User not found.' });

            // Delete the user's team and roster
            db.serialize(() => {
                db.run('DELETE FROM fantasy_teams WHERE user_id = ?', [user.id]);
                db.run('DELETE FROM fantasy_rosters WHERE user_id = ?', [user.id], (err) => {
                    if (err) {
                        return res.status(500).json({ message: 'Failed to delete roster.', error: err.message });
                    }
                    res.status(200).json({ message: 'Fantasy team and roster deleted successfully.' });
                });
            });
        });
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.', error: error.message });
    }
};