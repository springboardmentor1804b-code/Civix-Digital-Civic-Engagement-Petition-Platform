const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getPolls,
  createPoll,
  votePoll,
  deletePoll,
  editPoll
} = require('../controllers/pollController');

// @route   GET api/polls
// @desc    Get all polls
// @access  Public
router.get('/', getPolls);

// @route   POST api/polls
// @desc    Create a poll
// @access  Private
router.post('/', auth, createPoll);

// @route   POST api/polls/:id/vote
// @desc    Vote on a poll
// @access  Private
router.post('/:id/vote', auth, votePoll);

// @route   DELETE api/polls/:id
// @desc    Delete a poll
// @access  Private (Creator or official)
router.delete('/:id', auth, deletePoll);

// @route   PUT api/polls/:id
// @desc    Update a polls
// @access  Private
router.put('/:id', auth, editPoll);

module.exports = router;
