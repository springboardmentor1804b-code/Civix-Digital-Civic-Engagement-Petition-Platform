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
const { getNotifications, markAsRead } = require('../controllers/NotificationController');

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

// @route   GET api/auth/notifications
// @desc    Get all notifications for logged in user
// @access  Private
router.get('/notifications', auth, getNotifications);

// @route   PATCH api/auth/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.patch('/notifications/:id/read', auth, markAsRead);


module.exports = router;