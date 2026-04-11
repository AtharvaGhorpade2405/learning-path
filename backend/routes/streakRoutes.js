const { Router } = require('express');
const auth = require('../middleware/auth');
const { pingActivity } = require('../controllers/streakController');

const router = Router();

router.post('/ping-activity', auth, pingActivity);

module.exports = router;
