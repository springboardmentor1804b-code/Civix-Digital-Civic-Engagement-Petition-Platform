import Poll from "../models/Poll.js";

// @desc    Create a new poll
// @route   POST /api/polls/create
export const createPoll = async (req, res) => {
  const { question, description, options, location } = req.body;

  try {
    const newPoll = new Poll({
      question,
      description,
      options,
      location,
      owner: req.user.id,
    });

    const savedPoll = await newPoll.save();
    res.status(201).json(savedPoll);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all polls
// @route   GET /api/polls
export const getPolls = async (req, res) => {
  try {
    const polls = await Poll.find({})
      .sort({ createdAt: -1 })
      .populate("owner", "name");
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get a single poll by ID
// @route   GET /api/polls/:id
export const getPollById = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).populate("owner", "name");
    if (poll) {
      res.json(poll);
    } else {
      res.status(404).json({ message: "Poll not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Vote on a poll
// @route   POST /api/polls/:pollId/vote
export const voteOnPoll = async (req, res) => {
  const { pollId } = req.params;
  const { optionId } = req.body;
  const userId = req.user.id;

  try {
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }
    // Disallow voting if poll is older than 3 days
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    const isExpired = Date.now() - new Date(poll.createdAt).getTime() > threeDaysMs;
    if (isExpired) {
      return res.status(400).json({ message: "This poll has expired." });
    }
    if (poll.votedBy.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You have already voted on this poll" });
    }
    const option = poll.options.id(optionId);
    if (!option) {
      return res.status(404).json({ message: "Option not found" });
    }
    option.votes += 1;
    poll.votedBy.push(userId);

    await poll.save();
    const updatedPoll = await Poll.findById(pollId).populate("owner", "name");
    res.json(updatedPoll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update a poll
// @route   PUT /api/polls/:id
export const updatePoll = async (req, res) => {
  const { question, description } = req.body;
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (poll.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized" });
    }

    const tenMinutes = 10 * 60 * 1000;
    const isEditable = new Date() - new Date(poll.createdAt) < tenMinutes;

    if (!isEditable) {
      return res
        .status(403)
        .json({ message: "Poll can no longer be edited after 10 minutes." });
    }

    poll.question = question || poll.question;
    poll.description = description || poll.description;

    const updatedPoll = await poll.save();
    res.json(updatedPoll);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete a poll
// @route   DELETE /api/polls/:id
export const deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (poll.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized" });
    }

    await poll.deleteOne();
    res.json({ message: "Poll removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
