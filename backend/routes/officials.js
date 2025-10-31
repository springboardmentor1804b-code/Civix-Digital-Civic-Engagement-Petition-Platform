const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getOfficials,
  getOfficialAnalytics,
} = require('../controllers/officialController');

// Public - list all officials
router.get('/', getOfficials);

// Private - analytics for the logged-in official
router.get('/analytics', auth, getOfficialAnalytics);

module.exports = router;