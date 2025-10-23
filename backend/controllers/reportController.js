import Petition from "../models/Petition.js";
import Poll from "../models/Poll.js";
import User from "../models/User.js";

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const { user } = req;

    // Get total counts
    const totalPetitions = await Petition.countDocuments();
    const totalPolls = await Poll.countDocuments();
    const totalUsers = await User.countDocuments();

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentPetitions = await Petition.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const recentPolls = await Poll.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Month-over-month growth comparing CURRENT month vs LAST month
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      petitionsThisMonth,
      petitionsLastMonth,
      pollsThisMonth,
      pollsLastMonth
    ] = await Promise.all([
      Petition.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Petition.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } }),
      Poll.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Poll.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } })
    ]);

    const pctChange = (current, previous) => {
      if (previous === 0) {
        return current > 0 ? 100 : 0;
      }
      return Math.round(((current - previous) / previous) * 100);
    };

    const growth = {
      petitionsPct: pctChange(petitionsThisMonth, petitionsLastMonth),
      pollsPct: pctChange(pollsThisMonth, pollsLastMonth)
    };

    // Get petitions by status
    const petitionsByStatus = await Petition.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Get polls by status (since Poll model doesn't have status, we'll use a default)
    const pollCount = await Poll.countDocuments();
    const pollsByStatus = [
      { _id: "Active", count: pollCount }
    ];

    // Get users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);

    // Get top locations for petitions
    const topPetitionLocations = await Petition.aggregate([
      {
        $group: {
          _id: "$location",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get monthly activity for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyActivity = await Petition.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          petitions: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthlyPollActivity = await Poll.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          polls: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Get most active users (by petitions created)
    const mostActiveUsers = await User.aggregate([
      {
        $lookup: {
          from: "petitions",
          localField: "_id",
          foreignField: "owner",
          as: "petitions"
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          petitionCount: { $size: "$petitions" }
        }
      },
      { $sort: { petitionCount: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalPetitions,
          totalPolls,
          totalUsers,
          recentPetitions,
          recentPolls,
          recentUsers,
          growth
        },
        charts: {
          petitionsByStatus,
          pollsByStatus,
          usersByRole,
          topPetitionLocations,
          monthlyActivity,
          monthlyPollActivity
        },
        insights: {
          mostActiveUsers
        }
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
      error: error.message
    });
  }
};

// Get detailed reports
export const getDetailedReports = async (req, res) => {
  try {
    const { type, startDate, endDate, location, status } = req.query;

    let matchQuery = {};

    // Add date filter if provided
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Add location filter if provided
    if (location) {
      matchQuery.location = new RegExp(location, 'i');
    }

    // Add status filter if provided (only for petitions, not polls)
    if (status && type !== 'polls') {
      matchQuery.status = status;
    }

    let data = {};

    switch (type) {
      case 'petitions':
        data = await Petition.find(matchQuery)
          .populate('owner', 'name email role')
          .sort({ createdAt: -1 })
          .limit(100);
        break;

      case 'polls':
        data = await Poll.find(matchQuery)
          .populate('owner', 'name email role')
          .sort({ createdAt: -1 })
          .limit(100);
        break;

      case 'users':
        data = await User.find(matchQuery)
          .select('-password')
          .sort({ createdAt: -1 })
          .limit(100);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid report type. Use 'petitions', 'polls', or 'users'"
        });
    }

    res.json({
      success: true,
      data,
      filters: {
        type,
        startDate,
        endDate,
        location,
        status
      }
    });
  } catch (error) {
    console.error("Error fetching detailed reports:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching detailed reports",
      error: error.message
    });
  }
};

// Export reports as CSV
export const exportReports = async (req, res) => {
  try {
    const { type, startDate, endDate, location, status } = req.query;

    let matchQuery = {};

    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (location) {
      matchQuery.location = new RegExp(location, 'i');
    }

    if (status && type !== 'polls') {
      matchQuery.status = status;
    }

    let data = [];
    let filename = '';

    switch (type) {
      case 'petitions':
        data = await Petition.find(matchQuery)
          .populate('owner', 'name email role')
          .sort({ createdAt: -1 });
        filename = `petitions_${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'polls':
        data = await Poll.find(matchQuery)
          .populate('owner', 'name email role')
          .sort({ createdAt: -1 });
        filename = `polls_${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'users':
        data = await User.find(matchQuery)
          .select('-password')
          .sort({ createdAt: -1 });
        filename = `users_${new Date().toISOString().split('T')[0]}.csv`;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid export type"
        });
    }

    // Convert to CSV format
    let csv = '';
    if (data.length > 0) {
      const headers = Object.keys(data[0].toObject()).join(',');
      csv += headers + '\n';
      
      data.forEach(item => {
        const values = Object.values(item.toObject()).map(value => 
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        ).join(',');
        csv += values + '\n';
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);

  } catch (error) {
    console.error("Error exporting reports:", error);
    res.status(500).json({
      success: false,
      message: "Error exporting reports",
      error: error.message
    });
  }
};