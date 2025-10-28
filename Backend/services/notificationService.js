import AdminLog from '../models/AdminLog.js';
import User from '../models/User.js';
import Petition from '../models/Petition.js';
import Poll from '../models/Poll.js';
import mongoose from 'mongoose';

class NotificationService {
  // Get recent actions for dashboard (last 3)
  async getRecentActions(limit = 3) {
    try {
      const logs = await AdminLog.find()
        .populate('user_id', 'name email role')
        .populate('relatedPetition', 'title status creator')
        .populate('relatedPoll', 'title status creator')
        .sort({ createdAt: -1 })
        .limit(limit);

      return {
        success: true,
        actions: logs.map(log => this.formatAction(log))
      };
    } catch (error) {
      console.error('Get recent actions error:', error);
      throw error;
    }
  }

  // Get all official actions with pagination
  async getAllOfficialActions(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const query = userId ? { user_id: userId } : {};

      const [logs, total] = await Promise.all([
        AdminLog.find(query)
          .populate('user_id', 'name email role')
          .populate('relatedPetition', 'title status creator')
          .populate('relatedPoll', 'title status creator')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        AdminLog.countDocuments(query)
      ]);

      return {
        success: true,
        actions: logs.map(log => this.formatAction(log)),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Get all official actions error:', error);
      throw error;
    }
  }

  // Format action for consistent response - ENHANCED
  formatAction(log) {
    // Extract official information from metadata
    const officialName = log.metadata?.officialName || 
                        log.metadata?.official?.name || 
                        log.metadata?.official || 
                        'System';
    
    const officialDepartment = log.metadata?.officialDepartment || 
                              log.metadata?.official?.department || 
                              'N/A';
    
    const officialPosition = log.metadata?.officialPosition || 
                            log.metadata?.official?.position || 
                            'N/A';

    // FIXED: Get petition title from multiple sources
    const petitionTitle = log.metadata?.petitionTitle || 
                         log.relatedPetition?.title || 
                         'Petition';

    // FIXED: Get poll title from multiple sources  
    const pollTitle = log.metadata?.pollTitle || 
                     log.relatedPoll?.title || 
                     'Poll';

    return {
      id: log._id,
      action: log.action,
      official: officialName,
      officialDepartment: officialDepartment,
      officialPosition: officialPosition,
      officialDetails: `${officialName} - ${officialPosition} (${officialDepartment})`,
      petitionTitle: log.relatedPetition ? petitionTitle : null,
      pollTitle: log.relatedPoll ? pollTitle : null,
      timestamp: log.createdAt,
      relatedPetition: log.relatedPetition ? {
        id: log.relatedPetition._id,
        title: petitionTitle,
        status: log.relatedPetition.status,
        creator: log.relatedPetition.creator
      } : null,
      relatedPoll: log.relatedPoll ? {
        id: log.relatedPoll._id,
        title: pollTitle,
        status: log.relatedPoll.status,
        creator: log.relatedPoll.creator
      } : null,
      metadata: log.metadata
    };
  }

  // Get user-specific notifications
  async getUserNotifications(userId, page = 1, limit = 20) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Convert to ObjectId if string
      const userObjectId = typeof userId === 'string' 
        ? new mongoose.Types.ObjectId(userId)
        : userId;

      const skip = (page - 1) * limit;

      // STEP 1: Find all petitions created by this user
      const userPetitions = await Petition.find({ creator: userObjectId })
        .select('_id title')
        .lean();
      
      const petitionIds = userPetitions.map(p => p._id);

      // STEP 2: Find all polls created by this user
      const userPolls = await Poll.find({ creator: userObjectId })
        .select('_id title')
        .lean();
      
      const pollIds = userPolls.map(p => p._id);

      // STEP 3: Build query
      const query = {
        $or: []
      };

      if (petitionIds.length > 0) {
        query.$or.push({ relatedPetition: { $in: petitionIds } });
      }

      if (pollIds.length > 0) {
        query.$or.push({ relatedPoll: { $in: pollIds } });
      }

      if (query.$or.length === 0) {
        return {
          success: true,
          notifications: [],
          unreadCount: 0,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            pages: 0
          }
        };
      }
      
      const [logs, total] = await Promise.all([
        AdminLog.find(query)
          .populate('relatedPetition', 'title status creator')
          .populate('relatedPoll', 'title status creator')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        AdminLog.countDocuments(query)
      ]);

      if (logs.length === 0) {
        return {
          success: true,
          notifications: [],
          unreadCount: 0,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            pages: 0
          }
        };
      }

      // STEP 5: Format notifications
      const notifications = logs.map(log => this.formatNotification(log));
      const unreadCount = logs.filter(log => !log.read).length;

      return {
        success: true,
        notifications,
        unreadCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Get user notifications error:', error);
      throw error;
    }
  }

  // Format notification for user - ENHANCED with Verification Details
  formatNotification(log) {
    let title = '';
    let body = log.action;

    const actionLower = log.action.toLowerCase();
    
    // Extract official name from metadata
    const officialName = log.metadata?.officialName || 'Official';
    const officialPosition = log.metadata?.officialPosition || '';
    const officialDepartment = log.metadata?.officialDepartment || '';
    
    // Build official title string
    const officialTitle = officialPosition && officialDepartment 
      ? `${officialName} (${officialPosition}, ${officialDepartment})`
      : officialName;
    
    if (actionLower.includes('approved')) {
      title = 'Petition Approved';
      body = `Your petition was approved by ${officialTitle}`;
    } else if (actionLower.includes('rejected')) {
      title = 'Petition Rejected';
      body = `Your petition was rejected by ${officialTitle}`;
    } else if (actionLower.includes('verified petition') && !actionLower.includes('unverified')) {
      title = '✓ Petition Verified';
      body = `Your petition "${log.metadata?.petitionTitle || 'petition'}" has been verified by ${officialTitle}`;
      if (log.metadata?.verificationNote) {
        body += `\nNote: ${log.metadata.verificationNote}`;
      }
    } else if (actionLower.includes('unverified')) {
      title = 'Petition Unverified';
      body = `Your petition was marked as invalid by ${officialTitle}`;
      if (log.metadata?.verificationNote) {
        body += `\nReason: ${log.metadata.verificationNote}`;
      }
    } else if (actionLower.includes('under_review') || actionLower.includes('under review')) {
      title = 'Petition Under Review';
      body = `Your petition is now under review by ${officialTitle}`;
    } else if (actionLower.includes('response')) {
      title = 'Official Response Added';
      body = `${officialTitle} added a response to your petition`;
    } else if (actionLower.includes('closed')) {
      title = 'Petition Closed';
      body = `Your petition was closed by ${officialTitle}`;
    } else if (actionLower.includes('forwarded')) {
      title = 'Petition Forwarded';
      body = `Your petition was forwarded by ${officialTitle}`;
    } else if (actionLower.includes('status')) {
      title = 'Status Updated';
      body = `${officialTitle} updated your petition status: ${log.metadata?.newStatus || 'Updated'}`;
    } else {
      title = 'Official Update';
      body = `${officialTitle}: ${log.action}`;
    }

    return {
      id: log._id,
      title,
      body,
      timestamp: log.createdAt,
      read: log.read || false,
      relatedPetition: log.relatedPetition,
      relatedPoll: log.relatedPoll,
      officialName: officialName,
      officialPosition: officialPosition,
      officialDepartment: officialDepartment,
      officialDetails: officialTitle,
      verificationNote: log.metadata?.verificationNote,
      metadata: log.metadata
    };
  }
}

export default new NotificationService();