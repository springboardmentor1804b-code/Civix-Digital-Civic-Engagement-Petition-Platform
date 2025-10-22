const User = require('../models/User');

// Get all users with the role 'Public_officer'
exports.getOfficials = async (req, res) => {
    try {
        const officials = await User.find({ role: 'Public_officer' }).select('-password');
        res.json(officials);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};