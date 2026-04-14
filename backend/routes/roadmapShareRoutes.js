const express = require('express');
const {
  shareRoadmap,
  getPendingShares,
  rejectShare,
  acceptShare
} = require('../controllers/roadmapShareController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/share', shareRoadmap);
router.get('/shares/pending', getPendingShares);
router.post('/shares/reject', rejectShare);
router.post('/shares/accept', acceptShare);

module.exports = router;
