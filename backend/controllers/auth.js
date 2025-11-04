const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Poll = require('../models/Poll');
// ADDED - to delete user content
const Petition = require('../models/Petition');


const registerUser = async (req, res) => {
  const { name, email, password, location, role } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      location,
      role,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: 360000,
      },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: 360000,
      },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// ADDED FUNCTION
const getLoggedInUser = async (req, res) => {
  try {
    // req.user.id is coming from the auth middleware
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


const getUserPolls = async (req, res) => {
  try {
    const polls = await Poll.find({ createdBy: req.user.id }).populate('createdBy', 'name');
    res.json({totalUserPoll: polls.length });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- NEW FUNCTIONS FOR SETTINGS ---

// @desc    Update user profile (name, location)
const updateUserProfile = async (req, res) => {
  const { name, location } = req.body;
  const updateFields = {};
  if (name) updateFields.name = name;
  if (location) updateFields.location = location;

  try {
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Change user password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete user account
const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // 1. Delete user's petitions
    await Petition.deleteMany({ author: userId });

    // 2. Delete user's polls
    await Poll.deleteMany({ createdBy: userId });

    // 3. Remove user's signatures from other petitions
    await Petition.updateMany(
      { signatures: userId },
      { $pull: { signatures: userId } }
    );

    // 4. Remove user's votes from other polls
    await Poll.updateMany(
      { voters: userId },
      { $pull: { voters: userId } }
      // Note: This doesn't decrease the vote count, but removes them from the voter list.
      // A more complex implementation would also decrement the specific option count.
    );

    // 5. Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ msg: 'User account deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


module.exports = {
  registerUser,
  loginUser,
  getLoggedInUser,
  getUserPolls,
  updateUserProfile, // EXPORT NEW
  changePassword,    // EXPORT NEW
  deleteUser,        // EXPORT NEW
};