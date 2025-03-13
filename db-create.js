// create-db.js
import sqlite3 from 'sqlite3';

// Connect to the SQLite database (or create it if it doesn't exist)
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err);
  } else {
    console.log('Connected to SQLite database');
    createTables();
  }
});

// Function to create tables
function createTables() {
  db.serialize(() => {
    // Create the 'teams' table
    db.run(`
      CREATE TABLE IF NOT EXISTS teams (
        team_id INTEGER PRIMARY KEY AUTOINCREMENT,
        team_name TEXT NOT NULL
      )
    `, (err) => {
      if (err) {
        console.error('Error creating teams table:', err);
      } else {
        console.log('Teams table created or already exists');
        populateTeams();
      }
    });

    // Create the 'players' table
    db.run(`
      CREATE TABLE IF NOT EXISTS players (
        player_id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_name TEXT NOT NULL,
        fk_team_id INTEGER,
        FOREIGN KEY (fk_team_id) REFERENCES teams(team_id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating players table:', err);
      } else {
        console.log('Players table created or already exists');
        populatePlayers();
      }
    });
  });
}

// Function to populate the 'teams' table with sample data
function populateTeams() {
  const teams = [
    { team_name: 'Los Angeles Lakers' },
    { team_name: 'Golden State Warriors' },
    { team_name: 'Chicago Bulls' },
    { team_name: 'Miami Heat' },
  ];

  const insertTeam = db.prepare('INSERT INTO teams (team_name) VALUES (?)');
  teams.forEach((team) => {
    insertTeam.run(team.team_name, (err) => {
      if (err) {
        console.error('Error inserting team:', err);
      }
    });
  });
  insertTeam.finalize();
  console.log('Teams table populated with sample data');
}

// Function to populate the 'players' table with sample data
function populatePlayers() {
  const players = [
    { player_name: 'LeBron James', fk_team_id: 1 },
    { player_name: 'Anthony Davis', fk_team_id: 1 },
    { player_name: 'Stephen Curry', fk_team_id: 2 },
    { player_name: 'Klay Thompson', fk_team_id: 2 },
    { player_name: 'Michael Jordan', fk_team_id: 3 },
    { player_name: 'Scottie Pippen', fk_team_id: 3 },
    { player_name: 'Jimmy Butler', fk_team_id: 4 },
    { player_name: 'Bam Adebayo', fk_team_id: 4 },
  ];

  const insertPlayer = db.prepare('INSERT INTO players (player_name, fk_team_id) VALUES (?, ?)');
  players.forEach((player) => {
    insertPlayer.run(player.player_name, player.fk_team_id, (err) => {
      if (err) {
        console.error('Error inserting player:', err);
      }
    });
  });
  insertPlayer.finalize();
  console.log('Players table populated with sample data');

  // Close the database connection after all operations are done
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
  });
}