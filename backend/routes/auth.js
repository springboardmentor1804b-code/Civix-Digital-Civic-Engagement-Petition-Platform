const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
    registerUser, 
    loginUser, 
    getLoggedInUser, 
    getUserPolls,
    updateUserProfile,  // IMPORTED
    changePassword,     // IMPORTED
    deleteUser          // IMPORTED
} = require('../controllers/auth');

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

// @route   PUT api/auth/user
// @desc    Update user profile
// @access  Private
router.put('/user', auth, updateUserProfile); // ADDED

// @route   POST api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', auth, changePassword); // ADDED

// @route   DELETE api/auth/user
// @desc    Delete user account
// @access  Private
router.delete('/user', auth, deleteUser); // ADDED

// @route   GET api/auth/user/polls/:id
// @desc    Get polls created by logged in user
// @access  Private
router.get('/user/polls', auth, getUserPolls);


module.exports = router;