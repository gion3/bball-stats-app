require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const playerRoutes = require('./routes/players');
const aiRoutes = require('./routes/ai');
const teamRoutes = require('./routes/teams');

app.use(cors());
app.use(express.json());

app.use('/api/players', playerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/teams', teamRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
