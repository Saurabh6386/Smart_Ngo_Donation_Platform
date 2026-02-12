const express = require('express');
const router = express.Router();
const { getStats, getRecentActivity, getLeaderboard } = require('../controllers/analyticsController');

router.get('/stats', getStats);
router.get('/recent', getRecentActivity);
router.get('/leaderboard', getLeaderboard);

module.exports = router;