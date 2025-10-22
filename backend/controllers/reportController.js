const Petition = require('../models/Petition');
const Poll = require('../models/Poll');
const User = require('../models/User');
const mongoose = require('mongoose');

// Helper function to get counts by status/category using MongoDB aggregation
const getAggregateData = async (Model, groupField) => {
  const result = await Model.aggregate([
    // Group documents by the specified field and count them
    { $group: { _id: `$${groupField}`, count: { $sum: 1 } } },
    // Sort the results by count in descending order
    { $sort: { count: -1 } }
  ]);
  // Convert the array of objects into a single object map { category: count }
  return result.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
};

// @route   GET api/reports/community
// @desc    Get comprehensive analytics for all users (community overview)
// @access  Private (Requires authentication)
exports.getCommunityReport = async (req, res) => {
  try {
    // --- Community Overview Metrics ---
    const totalPetitions = await Petition.countDocuments();
    const totalPolls = await Poll.countDocuments();
    // Count petitions currently marked as 'Active'
    const activePetitions = await Petition.countDocuments({ status: 'Active' });
    // Count polls that have a closing date greater than or equal to the current date
    const activePolls = await Poll.countDocuments({ closedAt: { $gte: new Date() } });
    const totalUsers = await User.countDocuments();
    const activeEngagement = activePetitions + activePolls;

    // --- Petitions Breakdown ---
    const petitionStatus = await getAggregateData(Petition, 'status');
    const petitionCategory = await getAggregateData(Petition, 'category');

    // --- Poll Breakdown ---
    const pollLocations = await getAggregateData(Poll, 'targetLocation');
    const pollStatus = await Poll.aggregate([
        {
            $group: {
                _id: {
                    $cond: [{ $gte: ['$closedAt', new Date()] }, 'Active', 'Closed']
                },
                count: { $sum: 1 }
            }
        }
    ]).then(result => result.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
    }, {}));

    res.json({
      communityOverview: {
        totalPetitions,
        totalPolls,
        totalUsers,
        activeEngagement,
        activePetitions,
        activePolls
      },
      petitionAnalytics: {
        status: petitionStatus,
        category: petitionCategory,
      },
      pollAnalytics: {
        locations: pollLocations,
        status: pollStatus,
      }
    });

  } catch (err) {
    console.error('Report Generation Error:', err.message);
    res.status(500).send('Server Error during report generation');
  }
};

// @route   GET api/reports/my-activity
// @desc    Get user-specific activity metrics
// @access  Private (Requires authentication)
exports.getMyActivityReport = async (req, res) => {
  try {
    // The user ID comes from the authentication middleware
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Count content authored by the user
    const petitionsAuthored = await Petition.countDocuments({ author: userId });
    const pollsCreated = await Poll.countDocuments({ createdBy: userId });
    
    // Count content the user has participated in
    const petitionsSigned = await Petition.countDocuments({ signatures: userId });
    const pollsVotedIn = await Poll.countDocuments({ voters: userId });

    res.json({
      petitionsAuthored,
      petitionsSigned,
      pollsCreated,
      pollsVotedIn,
    });
  } catch (err) {
    console.error('My Activity Report Error:', err.message);
    res.status(500).send('Server Error generating user activity report');
  }
};