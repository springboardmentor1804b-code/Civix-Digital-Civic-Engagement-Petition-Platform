import api from './api';

const officialService = {
  // Get analytics data
  getAnalytics: async () => {
    try {
      console.log('Fetching analytics from:', '/petitions/analytics');
      const response = await api.get('/petitions/analytics');
      console.log('Analytics response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  // Get petitions for review
  getPetitionsForReview: async (params = {}) => {
    try {
      const response = await api.get('/petitions/review/list', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching petitions for review:', error);
      throw error;
    }
  },

  // Update petition status
  updatePetitionStatus: async (petitionId, statusData) => {
    try {
      const response = await api.put(`/petitions/${petitionId}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Error updating petition status:', error);
      throw error;
    }
  },

  // Verify petition
  verifyPetition: async (petitionId, verificationData) => {
    try {
      const response = await api.put(`/petitions/${petitionId}/verify`, verificationData);
      return response.data;
    } catch (error) {
      console.error('Error verifying petition:', error);
      throw error;
    }
  },

  // Add official response
  addOfficialResponse: async (petitionId, responseData) => {
    try {
      const response = await api.post(`/petitions/${petitionId}/response`, responseData);
      return response.data;
    } catch (error) {
      console.error('Error adding official response:', error);
      throw error;
    }
  },

  // Get official responses for a petition
  getOfficialResponses: async (petitionId, isPublic = true) => {
    try {
      const response = await api.get(`/petitions/${petitionId}/responses`, {
        params: { isPublic }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching official responses:', error);
      throw error;
    }
  }
};

export default officialService;