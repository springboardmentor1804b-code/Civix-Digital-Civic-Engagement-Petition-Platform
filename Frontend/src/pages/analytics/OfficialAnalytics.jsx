import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  LineChart, Line, ResponsiveContainer 
} from 'recharts';
import { Refresh, TrendingUp } from '@mui/icons-material';
import officialService from '../../services/officialService';

const OfficialAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await officialService.getAnalytics();
      
      if (response.analytics) {
        setAnalytics(response.analytics);
        console.log('Analytics updated:', response.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left mt-[70px] sm:mt-0">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* <TrendingUp className="text-blue-600" sx={{ fontSize: 40 }} /> */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600 mt-1">Data insights and trends for civic engagement</p>
              </div>
            </div>
            <button
              onClick={fetchAnalytics}
              className="flex items-center text-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Refresh fontSize="small" />
              Refresh Data
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Last updated: {new Date().toLocaleTimeString()} • Auto-refreshes every 30 seconds
          </p>
        </div>

        {/* Analytics Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Analytics</h3>
            <span className="text-sm text-gray-500">Data insights and trends</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Petitions by Category */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Petitions by Category</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.petitionsByCategory || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Signature Trends */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Signature Trends (30 Days)</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics?.signatureTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Additional Analytics Stats */}
        {analytics?.overview && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Overview Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 font-medium">Total Petitions</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {analytics.overview.totalPetitions || 0}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 font-medium">Active Petitions</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {analytics.overview.activePetitions || 0}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-600 font-medium">Under Review</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">
                  {analytics.overview.reviewedPetitions || 0}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-600 font-medium">Total Signatures</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {analytics.overview.totalSignatures || 0}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficialAnalytics;
