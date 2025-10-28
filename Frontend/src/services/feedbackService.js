import api from './api';

const feedbackService = {
  // Submit feedback
  submitFeedback: async (feedbackData) => {
    try {
      console.log('Submitting feedback:', feedbackData);
      const response = await api.post('/feedback', feedbackData);
      console.log('Feedback submitted:', response.data);
      return response.data;
    } catch (error) {
      console.error('Submit feedback error:', error);
      throw error;
    }
  },

  // Get user's own feedback
  getUserFeedback: async () => {
    try {
      console.log('Fetching user feedback...');
      const response = await api.get('/feedback/my');
      console.log('User feedback received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get user feedback error:', error);
      throw error;
    }
  },

  // Delete feedback
  deleteFeedback: async (feedbackId) => {
    try {
      console.log('Deleting feedback:', feedbackId);
      const response = await api.delete(`/feedback/${feedbackId}`);
      console.log('Feedback deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('Delete feedback error:', error);
      throw error;
    }
  },

  // Admin: Get all feedback
  getAllFeedback: async (params = {}) => {
    try {
      console.log('Fetching all feedback (admin)...');
      const response = await api.get('/feedback/all', { params });
      console.log('All feedback received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get all feedback error:', error);
      throw error;
    }
  },

  // Admin: Update feedback status
  updateFeedbackStatus: async (feedbackId, statusData) => {
    try {
      console.log('Updating feedback status:', feedbackId, statusData);
      const response = await api.put(`/feedback/${feedbackId}/status`, statusData);
      console.log('Feedback status updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update feedback status error:', error);
      throw error;
    }
  },

  // Admin: Respond to feedback
  respondToFeedback: async (feedbackId, message) => {
    try {
      console.log('Responding to feedback:', feedbackId);
      const response = await api.post(`/feedback/${feedbackId}/respond`, { message });
      console.log('Feedback response sent:', response.data);
      return response.data;
    } catch (error) {
      console.error('Respond to feedback error:', error);
      throw error;
    }
  },
};

export default feedbackService;