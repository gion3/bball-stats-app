const express = require('express');
const router = express.Router();
const { getAiResponse, getTweet } = require('../controllers/aiController');

router.post('/ask-ai', getAiResponse);
router.get('/get-tweet/:gameId', getTweet);

module.exports = router;