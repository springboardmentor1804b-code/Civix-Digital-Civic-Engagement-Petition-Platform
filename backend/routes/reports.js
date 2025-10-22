const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getCommunityReport, getMyActivityReport } = require('../controllers/reportController');

// @route   GET api/reports/community
// @desc    Get community-wide aggregated report data (e.g., total petitions, poll breakdown)
// @access  Private (Requires authentication via 'auth' middleware)
router.get('/community', auth, getCommunityReport);

// @route   GET api/reports/my-activity
// @desc    Get user-specific activity report data (e.g., my signed petitions, my created polls)
// @access  Private (Requires authentication via 'auth' middleware)
router.get('/my-activity', auth, getMyActivityReport);

module.exports = router;
