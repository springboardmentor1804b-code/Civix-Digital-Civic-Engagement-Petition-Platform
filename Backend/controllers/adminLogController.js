import AdminLog from '../models/AdminLog.js';
import Petition from '../models/Petition.js';
import Poll from '../models/Poll.js';

// Create a new admin log entry
export const createAdminLog = async (req, res) => {
  try {
    const { action, user_id, relatedPetition, relatedPoll, metadata } = req.body;

    const adminLog = new AdminLog({
      action,
      user_id,
      relatedPetition,
      relatedPoll,
      metadata
    });

    await adminLog.save();

    res.status(201).json({
      success: true,
      message: 'Admin log created successfully',
      log: adminLog
    });
  } catch (error) {
    console.error('Error creating admin log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin log',
      error: error.message
    });
  }
};

// Get all admin logs with pagination and filters
export const getAdminLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      user_id, 
      relatedPetition, 
      relatedPoll,
      startDate,
      endDate 
    } = req.query;

    const query = {};
    
    if (user_id) query.user_id = user_id;
    if (relatedPetition) query.relatedPetition = relatedPetition;
    if (relatedPoll) query.relatedPoll = relatedPoll;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AdminLog.find(query)
        .populate('user_id', 'name email role')
        .populate('relatedPetition', 'title status')
        .populate('relatedPoll', 'title status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AdminLog.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin logs',
      error: error.message
    });
  }
};

// Get logs by user (petition creator)
export const getLogsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AdminLog.find({ user_id: userId })
        .populate('user_id', 'name email role')
        .populate('relatedPetition', 'title status')
        .populate('relatedPoll', 'title status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AdminLog.countDocuments({ user_id: userId })
    ]);

    res.status(200).json({
      success: true,
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user logs',
      error: error.message
    });
  }
};

// Get logs for a specific petition
export const getLogsByPetition = async (req, res) => {
  try {
    const { petitionId } = req.params;

    const logs = await AdminLog.find({ relatedPetition: petitionId })
      .populate('user_id', 'name email role')
      .populate('relatedPetition', 'title status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      logs
    });
  } catch (error) {
    console.error('Error fetching petition logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch petition logs',
      error: error.message
    });
  }
};

// Get logs for a specific poll
export const getLogsByPoll = async (req, res) => {
  try {
    const { pollId } = req.params;

    const logs = await AdminLog.find({ relatedPoll: pollId })
      .populate('user_id', 'name email role')
      .populate('relatedPoll', 'title status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      logs
    });
  } catch (error) {
    console.error('Error fetching poll logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch poll logs',
      error: error.message
    });
  }
};

// Get recent admin actions (for dashboard)
export const getRecentActions = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const logs = await AdminLog.find()
      .populate('user_id', 'name email role')
      .populate('relatedPetition', 'title status')
      .populate('relatedPoll', 'title status')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      logs
    });
  } catch (error) {
    console.error('Error fetching recent actions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent actions',
      error: error.message
    });
  }
};

// Delete old logs (cleanup utility)
export const deleteOldLogs = async (req, res) => {
  try {
    const { daysOld = 365 } = req.body; // Default: delete logs older than 1 year

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await AdminLog.deleteMany({
      createdAt: { $lt: cutoffDate }
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} old admin logs`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting old logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete old logs',
      error: error.message
    });
  }
};

// Helper function to log admin actions (can be imported in other controllers)
export const logAdminAction = async (action, userId, relatedPetitionId = null, relatedPollId = null, metadata = {}) => {
  try {
    const log = new AdminLog({
      action,
      user_id: userId,
      relatedPetition: relatedPetitionId,
      relatedPoll: relatedPollId,
      metadata
    });
    await log.save();
    return log;
  } catch (error) {
    console.error('Error logging admin action:', error);
    return null;
  }
};
