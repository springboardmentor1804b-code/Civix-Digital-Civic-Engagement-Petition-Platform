import api from './api';

class NotificationService {
  // Get recent official actions for dashboard
  async getRecentOfficialActions(limit = 3) {
    try {
      console.log('Fetching recent official actions, limit:', limit);
      const response = await api.get(`/admin-logs/official-actions/recent?limit=${limit}`);
      console.log('Recent actions response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent official actions:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  // Get all official actions (for notifications page)
  async getAllOfficialActions(page = 1, limit = 20) {
    try {
      const response = await api.get(`/admin-logs/official-actions/all?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all official actions:', error);
      throw error;
    }
  }

  // Get user notifications - ENHANCED VERSION
  async getUserNotifications(page = 1, limit = 20) {
    try {
      console.log('=== getUserNotifications FRONTEND ===');
      console.log('Fetching notifications - Page:', page, 'Limit:', limit);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        throw new Error('Authentication required');
      }
      
      console.log('Token present:', token.substring(0, 20) + '...');
      
      const response = await api.get(`/admin-logs/notifications?page=${page}&limit=${limit}`);
      
      console.log('Notifications response:', response.data);
      console.log('Notifications count:', response.data.notifications?.length || 0);
      
      return response.data;
    } catch (error) {
      console.error('=== Error fetching user notifications ===');
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Return empty result instead of throwing
      if (error.response?.status === 401) {
        console.error('Authentication failed - user may need to log in again');
      }
      
      // Return empty notifications instead of throwing error
      return {
        success: false,
        notifications: [],
        unreadCount: 0,
        pagination: {
          page: 1,
          limit: limit,
          total: 0,
          pages: 0
        },
        error: error.message
      };
    }
  }

  // Format timestamp for display
  formatTimestamp(timestamp) {
    if (!timestamp) return 'Unknown time';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Unknown time';
    }
  }
}

export default new NotificationService();