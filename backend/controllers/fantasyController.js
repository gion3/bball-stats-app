const admin = require('firebase-admin');
const db = require('../db/database');

// Placeholder functions for fantasy league management

/**
 * @desc Create a new fantasy league
 * @route POST /api/fantasy/leagues
 * @access Private
 */
exports.createLeague = async (req, res) => {
  // TODO: Implement logic to create a new fantasy league
  res.status(201).json({ message: 'Fantasy league created successfully' });
};

/**
 * @desc Get details of a fantasy league
 * @route GET /api/fantasy/leagues/:id
 * @access Public
 */
exports.getLeagueDetails = async (req, res) => {
    // TODO: Implement logic to fetch league details from the database
    res.status(200).json({ message: `Details for league ${req.params.id}` });
};


// Placeholder functions for fantasy team management

/**
 * @desc Create a new fantasy team
 * @route POST /api/fantasy/teams
 * @access Private
 */
exports.createTeam = async (req, res) => {
  const { teamName } = req.body;
  const token = req.headers.authorization?.split(' ')[1]; // Expects "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required.' });
  }

  if (!teamName) {
    return res.status(400).json({ message: 'Team name is required.' });
  }

  try {
    // Verify the Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid } = decodedToken;

    // Get the local user ID from the users table
    db.get('SELECT id FROM users WHERE firebase_uid = ?', [uid], (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Database error finding user', error: err.message });
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found in local database. Please sync user first.' });
      }

      // Insert the new team into the database
      const stmt = db.prepare('INSERT INTO fantasy_teams (name, user_id) VALUES (?, ?)');
      stmt.run(teamName, user.id, function (err) {
        if (err) {
          return res.status(500).json({ message: 'Failed to create team', error: err.message });
        }
        res.status(201).json({
          message: 'Team created successfully',
          teamId: this.lastID,
          teamName: teamName,
        });
      });
      stmt.finalize();
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
    const { teamId } = req.params;
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

                // Fetch the roster (player IDs)
                db.all('SELECT player_id FROM fantasy_rosters WHERE fantasy_team_id = ?', [teamId], (err, rows) => {
                    if (err) {
                        return res.status(500).json({ message: 'Failed to fetch roster', error: err.message });
                    }
                    const playerIds = rows.map(row => row.player_id);
                    res.status(200).json(playerIds);
                });
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
    const { teamId } = req.params;
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

            db.get('SELECT id FROM fantasy_teams WHERE id = ? AND user_id = ?', [teamId, user.id], (err, team) => {
                if (err) return res.status(500).json({ message: 'Database error verifying team', error: err.message });
                if (!team) return res.status(403).json({ message: 'Forbidden: You do not own this team.' });

                // Use a transaction to ensure the roster update is atomic
                db.serialize(() => {
                    db.run('BEGIN TRANSACTION');
                    db.run('DELETE FROM fantasy_rosters WHERE fantasy_team_id = ?', [teamId]);
                    
                    const stmt = db.prepare('INSERT INTO fantasy_rosters (fantasy_team_id, player_id) VALUES (?, ?)');
                    for (const playerId of playerIds) {
                        stmt.run([teamId, playerId]);
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