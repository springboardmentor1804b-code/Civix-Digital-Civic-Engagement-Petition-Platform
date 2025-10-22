const Poll = require('../models/Poll');
const User = require('../models/User');

// Get all polls
exports.getPolls = async (req, res) => {
  try {
    const polls = await Poll.find()
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });
    res.json(polls);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Create a new poll
exports.createPoll = async (req, res) => {
  const { title, options, targetLocation, closedAt } = req.body;

  try {
    const newPoll = new Poll({
      title,
      options: options.map((opt) => ({ optionText: opt })),
      createdBy: req.user.id,
      targetLocation,
    });
    
    if (closedAt) newPoll.closedAt = closedAt;

    const poll = await newPoll.save();
    const populatedPoll = await Poll.findById(poll._id).populate('createdBy', 'name');
    res.json(populatedPoll);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Vote on a poll
exports.votePoll = async (req, res) => {
  const { optionIndex } = req.body;

  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ msg: 'Poll not found' });
    }

    // Prevent double voting
    if (poll.voters.includes(req.user.id)) {
      return res.status(400).json({ msg: 'You have already voted' });
    }

    poll.options[optionIndex].votes += 1;
    poll.voters.push(req.user.id);

    await poll.save();

    const updatedPoll = await Poll.findById(req.params.id).populate('createdBy', 'name');
    res.json(updatedPoll);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete a poll (only creator or official)
exports.deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ msg: 'Poll not found' });

    const user = await User.findById(req.user.id);

    if (poll.createdBy.toString() !== req.user.id && user.role !== 'official') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Poll.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Poll removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


exports.editPoll = async (req, res) => {
  const { title, description, options, closedAt } = req.body;
  try {
    let poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ msg: 'Poll not found' });

    const user = await User.findById(req.user.id);
    if (poll.createdBy.toString() !== req.user.id && user.role !== 'official') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Update fields
    if (title) poll.title = title;
    if (description) poll.description = description;
    if (options && options.length >= 2 && options.length <= 5) {
      poll.options = options.map((opt) => ({
        optionText: typeof opt === 'string' ? opt : opt.optionText,
        votes: typeof opt === 'string' ? 0 : opt.votes || 0, }));
      poll.voters = []; // Reset voters on options change
    }
    if (closedAt) poll.closedAt = closedAt;

    await poll.save();
    const updatedPoll = await Poll.findById(req.params.id).populate('createdBy', 'name');
    res.json(updatedPoll);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}
