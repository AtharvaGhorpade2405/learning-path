const { Router } = require('express');
const auth = require('../middleware/auth');
const {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  sendStreakRequest,
  acceptStreakRequest,
  getFriends,
} = require('../controllers/socialController');

const router = Router();

// Friend connections
router.post('/request', auth, sendFriendRequest);
router.post('/accept', auth, acceptFriendRequest);
router.post('/decline', auth, declineFriendRequest);
router.get('/friends', auth, getFriends);

// Shared streak lifecycle
router.post('/streak/request', auth, sendStreakRequest);
router.post('/streak/accept', auth, acceptStreakRequest);

module.exports = router;
