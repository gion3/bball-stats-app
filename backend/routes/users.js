const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route to handle user synchronization after Firebase login
router.post('/sync', userController.syncUser);

module.exports = router; 