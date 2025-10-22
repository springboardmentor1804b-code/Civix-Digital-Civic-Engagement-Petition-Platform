const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getPetitions,
    createPetition,
    signPetition,
    updatePetition,
    deletePetition,
    updatePetitionStatus
} = require('../controllers/petitionController');

// @route   GET api/petitions
// @desc    Get all petitions
// @access  Public
router.get('/', getPetitions);

// @route   POST api/petitions
// @desc    Create a petition
// @access  Private
router.post('/', auth, createPetition);

// @route   POST api/petitions/:id/sign
// @desc    Sign a petition
// @access  Private
router.post('/:id/sign', auth, signPetition);

// @route   PUT api/petitions/:id
// @desc    Update a petition
// @access  Private
router.put('/:id', auth, updatePetition);

// @route   DELETE api/petitions/:id
// @desc    Delete a petition
// @access  Private
router.delete('/:id', auth, deletePetition);

// @route   PUT api/petitions/:id/status
// @desc    Update petition status
// @access  Private (Officials only)
router.put('/:id/status', auth, updatePetitionStatus);


module.exports = router;