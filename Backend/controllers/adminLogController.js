import AdminLog from '../models/AdminLog.js';
import Petition from '../models/Petition.js';
import Poll from '../models/Poll.js';
import notificationService from '../services/notificationService.js';

// Create a new admin log entry
export const createAdminLog = async (req, res) => {
  try {
    const { action, user_id, relatedPetition, relatedPoll, metadata } = req.body;

    if (!action || !user_id) {
      return res.status(400).json({
        success: false,
        message: 'Action and user_id are required'
      });
    }

    const adminLog = new AdminLog({
      action,
      user_id,
      relatedPetition,
      relatedPoll,
      metadata,
      read: false
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

// Get recent official actions (for dashboard - no auth required)
export const getRecentOfficialActions = async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    
    const result = await notificationService.getRecentActions(parseInt(limit));
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching recent official actions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent official actions',
      error: error.message
    });
  }
};

// Get all official actions with pagination
export const getAllOfficialActions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const result = await notificationService.getAllOfficialActions(
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching all official actions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch official actions',
      error: error.message
    });
  }
};

// Get user notifications
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const { page = 1, limit = 20 } = req.query;
    
    const result = await notificationService.getUserNotifications(
      userId,
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getUserNotifications controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    const notification = await AdminLog.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Verify user owns this notification
    if (notification.user_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    notification.read = true;
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    // Find user's petitions and polls
    const [userPetitions, userPolls] = await Promise.all([
      Petition.find({ creator: userId }).select('_id'),
      Poll.find({ creator: userId }).select('_id')
    ]);

    const petitionIds = userPetitions.map(p => p._id);
    const pollIds = userPolls.map(p => p._id);

    // Update all unread notifications
    const result = await AdminLog.updateMany(
      {
        $or: [
          { relatedPetition: { $in: petitionIds } },
          { relatedPoll: { $in: pollIds } }
        ],
        read: false
      },
      { read: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Delete old logs (cleanup utility)
export const deleteOldLogs = async (req, res) => {
  try {
    const { daysOld = 365 } = req.body;

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
      metadata,
      read: false
    });
    await log.save();
    return log;
  } catch (error) {
    console.error('Error logging admin action:', error);
    return null;
  }
};
