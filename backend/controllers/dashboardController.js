import Petition from "../models/Petition.js";
import Poll from "../models/Poll.js";
import User from "../models/User.js";

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

// Get engagement trends data with time filtering
export const getEngagementTrends = async (req, res) => {
  try {
    console.log("Engagement trends endpoint called with:", req.query);
    const { period = 'week', userId } = req.query;
    
    let startDate, endDate = new Date();
    
    // Calculate date range based on period
    switch (period) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
    }

    // Build match query
    let petitionMatch = { createdAt: { $gte: startDate, $lte: endDate } };
    let pollMatch = { createdAt: { $gte: startDate, $lte: endDate } };
    
    // If userId is provided, filter by user (for citizen dashboard)
    if (userId) {
      petitionMatch.owner = userId;
      pollMatch.owner = userId;
    }

    // Get daily aggregated data
    const petitionTrends = await Petition.aggregate([
      { $match: petitionMatch },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    const pollTrends = await Poll.aggregate([
      { $match: pollMatch },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    // Create arrays with all days in the period
    const daysInPeriod = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      daysInPeriod.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Fill in the data arrays
    const petitionsData = daysInPeriod.map(date => {
      const dayData = petitionTrends.find(trend => 
        trend._id.year === date.getFullYear() &&
        trend._id.month === date.getMonth() + 1 &&
        trend._id.day === date.getDate()
      );
      return dayData ? dayData.count : 0;
    });

    const pollsData = daysInPeriod.map(date => {
      const dayData = pollTrends.find(trend => 
        trend._id.year === date.getFullYear() &&
        trend._id.month === date.getMonth() + 1 &&
        trend._id.day === date.getDate()
      );
      return dayData ? dayData.count : 0;
    });

    // If no data exists, create some sample data for demonstration
    if (petitionsData.every(val => val === 0) && pollsData.every(val => val === 0)) {
      console.log("No data found, creating realistic sample data for demonstration");
      
      // Create more realistic sample data based on the period
      let samplePetitions, samplePolls;
      
      if (period === 'today') {
        // For today, show hourly data
        samplePetitions = Array.from({ length: 24 }, (_, i) => {
          // More activity during business hours (9 AM - 5 PM)
          if (i >= 9 && i <= 17) {
            return Math.floor(Math.random() * 3) + 1;
          }
          return Math.floor(Math.random() * 2);
        });
        samplePolls = Array.from({ length: 24 }, (_, i) => {
          if (i >= 9 && i <= 17) {
            return Math.floor(Math.random() * 2) + 1;
          }
          return Math.floor(Math.random() * 2);
        });
        daysInPeriod = Array.from({ length: 24 }, (_, i) => new Date(new Date().setHours(i, 0, 0, 0)));
      } else if (period === 'week') {
        // For week, show daily data with realistic patterns
        samplePetitions = [3, 5, 2, 4, 6, 3, 4]; // More activity on weekdays
        samplePolls = [2, 3, 4, 3, 5, 2, 3];
      } else if (period === 'month') {
        // For month, show weekly data
        samplePetitions = Array.from({ length: 30 }, (_, i) => {
          // More activity on weekdays
          const dayOfWeek = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000).getDay();
          if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            return Math.floor(Math.random() * 4) + 2;
          }
          return Math.floor(Math.random() * 2) + 1;
        });
        samplePolls = Array.from({ length: 30 }, (_, i) => {
          const dayOfWeek = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000).getDay();
          if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            return Math.floor(Math.random() * 3) + 1;
          }
          return Math.floor(Math.random() * 2) + 1;
        });
      }
      
      res.json({
        success: true,
        data: {
          petitionsData: samplePetitions,
          pollsData: samplePolls,
          totalPetitions: samplePetitions.reduce((a, b) => a + b, 0),
          totalPolls: samplePolls.reduce((a, b) => a + b, 0),
          period,
          startDate,
          endDate,
          labels: daysInPeriod.map(date => {
            if (period === 'today') {
              return date.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true });
            }
            return date.toLocaleDateString();
          }),
          isSampleData: true
        }
      });
      return;
    }

    // Get total counts for the period
    const totalPetitions = await Petition.countDocuments(petitionMatch);
    const totalPolls = await Poll.countDocuments(pollMatch);

    res.json({
      success: true,
      data: {
        petitionsData,
        pollsData,
        totalPetitions,
        totalPolls,
        period,
        startDate,
        endDate,
        labels: daysInPeriod.map(date => date.toLocaleDateString())
      }
    });

  } catch (error) {
    console.error("Error fetching engagement trends:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching engagement trends",
      error: error.message
    });
  }
};

// Fallback engagement trends function with mock data
export const getEngagementTrendsFallback = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    // Generate realistic mock data based on period
    let dataLength, petitionsData, pollsData, labels;
    
    if (period === 'today') {
      dataLength = 24; // hourly data
      petitionsData = Array.from({ length: dataLength }, (_, i) => {
        // More activity during business hours (9 AM - 5 PM)
        if (i >= 9 && i <= 17) {
          return Math.floor(Math.random() * 3) + 1;
        }
        return Math.floor(Math.random() * 2);
      });
      pollsData = Array.from({ length: dataLength }, (_, i) => {
        if (i >= 9 && i <= 17) {
          return Math.floor(Math.random() * 2) + 1;
        }
        return Math.floor(Math.random() * 2);
      });
      labels = Array.from({ length: dataLength }, (_, i) => {
        const hour = new Date();
        hour.setHours(i, 0, 0, 0);
        return hour.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true });
      });
    } else if (period === 'week') {
      dataLength = 7; // daily data
      petitionsData = [3, 5, 2, 4, 6, 3, 4]; // More activity on weekdays
      pollsData = [2, 3, 4, 3, 5, 2, 3];
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    } else if (period === 'month') {
      dataLength = 30; // daily data for month
      petitionsData = Array.from({ length: dataLength }, (_, i) => {
        // More activity on weekdays
        const dayOfWeek = new Date(Date.now() - (dataLength - i) * 24 * 60 * 60 * 1000).getDay();
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          return Math.floor(Math.random() * 4) + 2;
        }
        return Math.floor(Math.random() * 2) + 1;
      });
      pollsData = Array.from({ length: dataLength }, (_, i) => {
        const dayOfWeek = new Date(Date.now() - (dataLength - i) * 24 * 60 * 60 * 1000).getDay();
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          return Math.floor(Math.random() * 3) + 1;
        }
        return Math.floor(Math.random() * 2) + 1;
      });
      labels = Array.from({ length: dataLength }, (_, i) => {
        const date = new Date(Date.now() - (dataLength - i) * 24 * 60 * 60 * 1000);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
    }
    
    res.json({
      success: true,
      data: {
        petitionsData,
        pollsData,
        totalPetitions: petitionsData.reduce((a, b) => a + b, 0),
        totalPolls: pollsData.reduce((a, b) => a + b, 0),
        period,
        labels,
        isSampleData: true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in fallback engagement trends",
      error: error.message
    });
  }
};
