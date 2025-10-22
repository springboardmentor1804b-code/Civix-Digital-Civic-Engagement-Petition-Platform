const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { registerUser, loginUser, getLoggedInUser, getUserPolls } = require('../controllers/auth');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', registerUser);

// @route   POST api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post('/login', loginUser);

// @route   GET api/auth/user
// @desc    Get logged in user
// @access  Private
router.get('/user', auth, getLoggedInUser);

// @route   GET api/auth/user/polls/:id
// @desc    Get polls created by logged in user
// @access  Private
router.get('/user/polls', auth, getUserPolls);


module.exports = router;