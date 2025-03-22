import express from 'express';
import bcrypt from 'bcrypt';
import cors from 'cors';
import sqlite3 from 'sqlite3';
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

const db = new sqlite3.Database('C:/Users/ionut/Desktop/nba.sqlite', (err) => {
    if (err) {
        console.error('Eroare la deschiderea bazei de date', err.message)
    } else {
        console.log('Conectat la baza de date')
    }
})

app.get('/api/players', (req,res) =>{
    let query;
    const player = req.query.player;
    if(player){
        const player = req.query.player
        query = `
        SELECT 
            p.id,
            p.full_name,
            p.first_name,
            p.last_name,
            c.position,
            c.team_name
        FROM player p
        LEFT JOIN common_player_info c ON p.id = c.person_id
        WHERE p.is_active = 1 AND LOWER(p.full_name) LIKE '%${player}%';
        `
    }
    else {query = `
    SELECT 
        p.id,
        p.full_name,
        p.first_name,
        p.last_name,
        c.position,
        c.team_name
    FROM player p
    LEFT JOIN common_player_info c ON p.id = c.person_id
    WHERE p.is_active = 1;
    `}
    db.all(query, (err, rows) => {
        if (err) {
            console.error('Eroare la interogare', err.message)
            res.status(500).json({message: 'Eroare la interogare'})
        } else {
            res.status(200).json(rows)
            console.log(rows)
        }
    })
})


app.listen(3000, () => {
    console.log('Server pornit pe port 3000')
})