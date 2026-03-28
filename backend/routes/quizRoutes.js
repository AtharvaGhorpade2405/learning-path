const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { generateQuiz } = require('../controllers/quizController');

router.post('/generate', auth, generateQuiz);

module.exports = router;
