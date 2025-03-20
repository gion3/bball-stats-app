import express from 'express';
import bcrypt from 'bcrypt';
import cors from 'cors';
import sqlite3 from 'sqlite3';
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

const db = new sqlite3.Database('database.db', (err) => {
    if (err) {
        console.error('Eroare la deschiderea bazei de date', err.message)
    } else {
        console.log('Conectat la baza de date')
    }
})

app.get('/api/players', (req,res) =>{
    const query = `
    SELECT players.player_id, players.player_name, players.player_position, teams.team_name
    FROM players
    INNER JOIN teams ON players.fk_team_id = teams.team_id
    `
    db.all(query, (err, rows) => {
        if (err) {
            console.error('Eroare la interogare', err.message)
            res.status(500).json({message: 'Eroare la interogare'})
        } else {
            res.status(200).json(rows)
        }
    })
})

app.listen(3000, () => {
    console.log('Server pornit pe port 3000')
})