import express from 'express';
import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';

const router = express.Router();
const db = new sqlite3.Database('./users.db');

// Ensure users table exists
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    password TEXT
)`);

// **Register Route**
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const salt = await bcrypt.genSalt();
        const hashedPw = await bcrypt.hash(password, salt);

        const sql = `INSERT INTO users (name, password) VALUES (?, ?)`;
        db.run(sql, [username, hashedPw], function (err) {
            if (err) {
                return res.status(400).json({ error: "User already exists" });
            }
            res.status(201).json({ id: this.lastID, username });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// **Login Route**
router.post('/login', (req, res) => {
    const { name, password } = req.body;
    const sql = `SELECT * FROM users WHERE name = ?`;

    db.get(sql, [name], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(400).json({ error: "User not found" });

        try {
            if (await bcrypt.compare(password, user.password)) {
                res.json({ message: "Login successful" });
            } else {
                res.status(401).json({ error: "Incorrect password" });
            }
        } catch {
            res.status(500).json({ error: "Server error" });
        }
    });
});

export default router;
