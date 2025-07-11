const express = require('express');
const router = express.Router();
const { getCurrentDate, updateCurrentDate } = require('../controllers/dateController');

// Get current date
router.get('/current-round', getCurrentRound);

// Update current date (admin only)
router.post('/admin/current-date', updateCurrentDate);

module.exports = router; 