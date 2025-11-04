const User = require("../models/User");
const Petition = require("../models/Petition");
const Poll = require("../models/Poll");

// ✅ Get all public officials
exports.getOfficials = async (req, res) => {
  try {
    const officials = await User.find({ role: "Public_officer" }).select("-password");
    res.json(officials);
  } catch (err) {
    console.error("Error fetching officials:", err.message);
    res.status(500).send("Server Error");
  }
};

// ✅ Get analytics + activity for logged-in official
exports.getOfficialAnalytics = async (req, res) => {
  try {
    const officialId = req.user.id; // comes from middleware (auth)

    // Get petitions authored by this official
    const petitions = await Petition.find({ author: officialId });

    // Get polls created by this official
    const polls = await Poll.find({ createdBy: officialId });

    // ✅ Petitions signed by this official (not authored)
    const petitionsSigned = await Petition.countDocuments({
      signatures: officialId, // assuming Petition has `signatures: [userIds]`
      author: { $ne: officialId }, // exclude self-authored petitions
    });

    // ✅ Polls voted in by this official (not created)
    const pollsVotedIn = await Poll.countDocuments({
      voters: officialId, // assuming Poll has `voters: [userIds]`
      createdBy: { $ne: officialId }, // exclude polls they created
    });

    // My activity overview
    const petitionsAuthored = petitions.length;
    const pollsCreated = polls.length;

    // Petition analytics
    const petitionStatusCounts = petitions.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});

    const totalSignatures = petitions.reduce(
      (sum, p) => sum + (p.signatures ? p.signatures.length : 0),
      0
    );

    // Poll analytics (Open vs Closed)
    const now = new Date();
    const pollStatusCounts = polls.reduce((acc, poll) => {
      const isClosed = poll.closedAt && poll.closedAt < now;
      acc[isClosed ? "Closed" : "Open"] = (acc[isClosed ? "Closed" : "Open"] || 0) + 1;
      return acc;
    }, {});

    const totalVotes = polls.reduce(
      (sum, poll) => sum + (poll.voters ? poll.voters.length : 0),
      0
    );

    // ✅ Final response
    res.json({
      activity: {
        petitionsAuthored,
        petitionsSigned,
        pollsCreated,
        pollsVotedIn,
      },
      petitions: {
        total: petitionsAuthored,
        status: petitionStatusCounts,
        totalSignatures,
      },
      polls: {
        total: pollsCreated,
        status: pollStatusCounts,
        totalVotes,
      },
    });
  } catch (err) {
    console.error("Error fetching official analytics:", err.message);
    res.status(500).send("Server Error");
  }
};