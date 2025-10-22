const Petition = require('../models/Petition');
const User = require('../models/User');

// Get all petitions
exports.getPetitions = async (req, res) => {
    try {
        const petitions = await Petition.find()
            .populate('author', 'name')
            .populate('signatures', 'name')
            .populate('comments.user', 'name') // Populate comment user
            .sort({ date: -1 });
        res.json(petitions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Create a new petition
exports.createPetition = async (req, res) => {
    const { title, description, category, signatureGoal, location } = req.body;
    try {
        const newPetition = new Petition({
            title,
            description,
            category,
            signatureGoal,
            location,
            author: req.user.id,
        });

        const petition = await newPetition.save();
        const populatedPetition = await Petition.findById(petition._id)
            .populate('author', 'name')
            .populate('comments.user', 'name'); // Populate comment user
        res.json(populatedPetition);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Sign a petition
exports.signPetition = async (req, res) => {
    try {
        const petition = await Petition.findById(req.params.id);
        if (!petition) {
            return res.status(404).json({ msg: 'Petition not found' });
        }

        // Check if the user is the author of the petition
        if (petition.author.toString() === req.user.id) {
            return res.status(400).json({ msg: 'You cannot sign your own petition' });
        }

        // Check if user has already signed
        if (petition.signatures.includes(req.user.id)) {
            return res.status(400).json({ msg: 'You have already signed this petition' });
        }

        petition.signatures.unshift(req.user.id);
        await petition.save();
        const finalPetition = await Petition.findById(req.params.id)
            .populate('author', 'name')
            .populate('signatures', 'name')
            .populate('comments.user', 'name'); // Populate comment user
        res.json(finalPetition);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update a petition
exports.updatePetition = async (req, res) => {
    const { title, description, category, signatureGoal, location } = req.body;

    try {
        let petition = await Petition.findById(req.params.id);
        if (!petition) {
            return res.status(404).json({ msg: 'Petition not found' });
        }

        // Check if the user is the author of the petition
        if (petition.author.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        petition = await Petition.findByIdAndUpdate(
            req.params.id,
            { $set: { title, description, category, signatureGoal, location } },
            { new: true }
        );

        // Repopulate before sending
        const populatedPetition = await Petition.findById(petition._id)
            .populate('author', 'name')
            .populate('signatures', 'name')
            .populate('comments.user', 'name');

        res.json(populatedPetition);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete a petition
exports.deletePetition = async (req, res) => {
    try {
        let petition = await Petition.findById(req.params.id);
        if (!petition) {
            return res.status(404).json({ msg: 'Petition not found' });
        }

        // Check if the user is the author of the petition
        if (petition.author.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await Petition.findByIdAndDelete(req.params.id);


        res.json({ msg: 'Petition removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update petition status
exports.updatePetitionStatus = async (req, res) => {
    try {
        let petition = await Petition.findById(req.params.id);
        if (!petition) {
            return res.status(404).json({ msg: 'Petition not found' });
        }

        const user = await User.findById(req.user.id);

        // Check if the user is a public officer
        if (user.role !== 'Public_officer') {
            return res.status(401).json({ msg: 'User not authorized to change status' });
        }

        petition = await Petition.findByIdAndUpdate(
            req.params.id,
            { $set: { status: req.body.status } },
            { new: true }
        ).populate('author', 'name').populate('signatures', 'name').populate('comments.user', 'name'); // Populate comment user

        res.json(petition);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Add a new comment to a petition
exports.addComment = async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ msg: 'Comment text is required' });
    }

    try {
        const petition = await Petition.findById(req.params.id);
        if (!petition) {
            return res.status(404).json({ msg: 'Petition not found' });
        }

        const newComment = {
            user: req.user.id,
            text: text,
        };

        petition.comments.push(newComment);

        await petition.save();

        // Populate the new comment and return the whole petition
        const populatedPetition = await Petition.findById(req.params.id)
            .populate('author', 'name')
            .populate('signatures', 'name')
            .populate('comments.user', 'name');

        res.json(populatedPetition);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};