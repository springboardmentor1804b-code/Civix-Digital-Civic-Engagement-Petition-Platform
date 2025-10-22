import api from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get user from localStorage
const getUserFromStorage = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

export const petitionService = {
  // Get all petitions with signature counts
  getAllPetitions: async (params = {}) => {
    try {
      const response = await api.get('/petitions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching petitions:', error);
      throw error;
    }
  },

  // Get petition by ID
  getPetitionById: async (id) => {
    try {
      const response = await api.get(`/petitions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching petition:', error);
      throw error;
    }
  },

  // Create petition
  createPetition: async (petitionData) => {
    try {
      const user = getUserFromStorage();
      const response = await api.post('/petitions', {
        ...petitionData,
        userId: user?.user?.id || user?.id // Include user ID from localStorage
      });
      return response.data;
    } catch (error) {
      console.error('Error creating petition:', error);
      throw error;
    }
  },

  // Sign petition - FIXED TO USE CORRECT ENDPOINT
  signPetition: async (petitionId) => {
    try {
      const user = getUserFromStorage();
      
      if (!user || (!user.user?.id && !user.id)) {
        throw new Error('User not authenticated. Please login first.');
      }

      const userId = user.user?.id || user.id;
      
      console.log('Signing petition:', petitionId, 'with user:', userId);
      
      // Use the correct endpoint format: /petitions/:id/sign
      const response = await api.post(`/petitions/${petitionId}/sign`, {
        userId: userId
      });
      
      return response.data;
    } catch (error) {
      console.error('Error signing petition:', error);
      throw error;
    }
  },

  // Update petition
  updatePetition: async (id, petitionData) => {
    try {
      const response = await api.put(`/petitions/${id}`, petitionData);
      return response.data;
    } catch (error) {
      console.error('Error updating petition:', error);
      throw error;
    }
  },

  // Delete petition
  deletePetition: async (id) => {
    try {
      const response = await api.delete(`/petitions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting petition:', error);
      throw error;
    }
  },

  // Get petition signatures
  getPetitionSignatures: async (petitionId) => {
    try {
      const response = await api.get(`/petitions/${petitionId}/signatures`);
      return response.data;
    } catch (error) {
      console.error('Error fetching signatures:', error);
      throw error;
    }
  }
};

export default petitionService;
