import Poll from "../models/Poll.js";

// Create a poll
export const createPoll = async (req, res) => {
  try {
    const { question, description, options, location, lat, lng, expiresAt } = req.body;
    if (!question || !description || !options || options.length < 2 || !location || !expiresAt) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const poll = new Poll({
      question,
      description,
      options,
      location,
      lat,
      lng,
      expiresAt,
      creator: req.user.id
    });
    await poll.save();
    res.status(201).json({ success: true, poll });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error creating poll", error: err.message });
  }
};

// Get all polls
export const getPolls = async (req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    res.json({ success: true, polls });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching polls", error: err.message });
  }
};

// Get poll by ID
export const getPollById = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ success: false, message: "Poll not found" });
    res.json({ success: true, poll });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching poll", error: err.message });
  }
};

// Vote on a poll
export const votePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ success: false, message: "Poll not found" });

    const { option } = req.body;
    if (typeof option !== "number" || option < 0 || option >= poll.options.length) {
      return res.status(400).json({ success: false, message: "Invalid option" });
    }

    // Prevent double voting
    if (poll.votes.some(v => v.user.toString() === req.user.id)) {
      return res.status(400).json({ success: false, message: "You have already voted" });
    }

    poll.votes.push({ user: req.user.id, option });
    await poll.save();
    res.json({ success: true, poll });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error voting", error: err.message });
  }
};

// Delete a poll
export const deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ success: false, message: "Poll not found" });
    if (poll.creator.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only delete your own poll" });
    }
    await poll.deleteOne();
    res.json({ success: true, message: "Poll deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting poll", error: err.message });
  }
};
export const getVotedPolls = async (req, res) => {
  try {
    const userId = req.params.userId;
    const polls = await Poll.find({ "votes.user": userId });
    res.json({ polls });
  } catch (err) {
    res.status(500).json({ message: "Error fetching voted polls", error: err.message });
  }
};
export const editPoll = async (req, res) => {
  try {
    const pollId = req.params.pollId;
    const { question, description, options } = req.body;
    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    // Only creator can edit
    if (poll.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    poll.question = question || poll.question;
    poll.description = description || poll.description;
    poll.options = options || poll.options;
    await poll.save();

    res.json({ success: true, poll });
  } catch (err) {
    res.status(500).json({ message: "Error editing poll", error: err.message });
  }
};