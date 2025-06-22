require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const playerRoutes = require('./routes/players');
const aiRoutes = require('./routes/ai');
const teamRoutes = require('./routes/teams');
const dateRoutes = require('./routes/dates');
const fantasyRoutes = require('./routes/fantasy');
const userRoutes = require('./routes/users');
const gameRoutes = require('./routes/games');

app.use(cors());
app.use(express.json());

app.use('/api/players', playerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api', dateRoutes);
app.use('/api/fantasy', fantasyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
