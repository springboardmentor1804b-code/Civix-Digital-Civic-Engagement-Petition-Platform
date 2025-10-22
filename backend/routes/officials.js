const express = require('express');
const router = express.Router();
const { getOfficials } = require('../controllers/officialController');

// @route   GET api/officials
// @desc    Get all public officials
// @access  Public
router.get('/', getOfficials);

module.exports = router;