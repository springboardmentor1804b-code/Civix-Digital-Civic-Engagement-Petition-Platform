import api from './api';

export const reportService = {
  getReports: async () => {
    try {
      // This is a placeholder - adjust the API endpoint as needed
      const response = await api.get('/reports');
      return response.data.reports || [];
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  },

  getReportById: async (id) => {
    try {
      const response = await api.get(`/reports/${id}`);
      return response.data.report;
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error;
    }
  },

  createReport: async (reportData) => {
    try {
      const response = await api.post('/reports', reportData);
      return response.data;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  },

  updateReport: async (id, reportData) => {
    try {
      const response = await api.put(`/reports/${id}`, reportData);
      return response.data;
    } catch (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  },

  deleteReport: async (id) => {
    try {
      const response = await api.delete(`/reports/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  }
};

export default reportService;
