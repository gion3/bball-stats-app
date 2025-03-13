import express from 'express';
import bcrypt from 'bcrypt';
import cors from 'cors';
import sqlite from 'sqlite3';
import authRoutes from './routes/auth.js';
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.use('/auth',authRoutes)

app.listen(3000, () => {
    console.log('Server pornit pe port 3000')
})
