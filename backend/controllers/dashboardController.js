import Petition from "../models/Petition.js";
import Poll from "../models/Poll.js";

// This function for regular citizens remains unchanged
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const myPetitionsCount = await Petition.countDocuments({ owner: userId });
    const pollsCreatedCount = await Poll.countDocuments({ owner: userId });
  const successfulPetitionsCount = await Petition.countDocuments({
      owner: userId,
      status: { $in: ["Closed", "Approved"] },
    });
    res.json({
      myPetitions: myPetitionsCount,
      successfulPetitions: successfulPetitionsCount,
      pollsCreated: pollsCreatedCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ THIS FUNCTION HAS BEEN UPDATED
// @desc    Get stats for the official dashboard
// @route   GET /api/dashboard/official-stats
export const getOfficialDashboardStats = async (req, res) => {
  try {
    // --- Calculate Stats (Location filter has been removed) ---
    const totalPetitions = await Petition.countDocuments();
    const updatedPetitions = await Petition.countDocuments({
      status: { $in: ["Under Review", "Approved", "Rejected", "Closed"] },
    });
    const totalPolls = await Poll.countDocuments();
    const updatedPolls = 0; // Placeholder for now

    res.json({
      stats: {
        totalPetitions,
        updatedPetitions,
        totalPolls,
        updatedPolls,
      },
      // Trending petitions list has been removed as requested
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
