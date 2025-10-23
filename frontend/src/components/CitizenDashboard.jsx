import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../Utils/api";
import { toast } from "react-toastify";
import EngagementChart from "./ui/EngagementChart";
import TimeFilter from "./ui/TimeFilter";

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    myPetitions: 0,
    successfulPetitions: 0,
    pollsCreated: 0,
  });
  const [engagementData, setEngagementData] = useState({
    petitionsData: [],
    pollsData: [],
    labels: []
  });
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [loading, setLoading] = useState(false);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboard/stats");
        setStats(res.data);
      } catch (err) {
        toast.error("Could not load dashboard stats.");
      }
    };
    fetchStats();
  }, []);

  // Fetch engagement trends data
  const fetchEngagementData = async (period = selectedPeriod) => {
    setLoading(true);
    try {
      // First try the authenticated endpoint
      let res;
      try {
        res = await api.get(`/dashboard/engagement-trends?period=${period}&userId=${user?.id}`);
      } catch (authError) {
        console.log("Auth endpoint failed, trying fallback:", authError.message);
        // If authenticated endpoint fails, use fallback
        res = await api.get(`/dashboard/engagement-trends-fallback?period=${period}`);
      }
      
      if (res.data.success) {
        console.log("Engagement data received:", res.data.data);
        setEngagementData({
          petitionsData: res.data.data.petitionsData,
          pollsData: res.data.data.pollsData,
          labels: res.data.data.labels
        });
      } else {
        throw new Error("API returned success: false");
      }
    } catch (err) {
      console.error("Engagement trends error:", err);
      toast.error("Could not load engagement trends.");
      
      // Set fallback data to prevent empty graph
      const fallbackData = {
        petitionsData: [2, 4, 1, 3, 5, 2, 3],
        pollsData: [1, 2, 3, 2, 4, 1, 2],
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      };
      setEngagementData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchEngagementData();
  }, []);

  // Set up smart refresh - only refresh when needed
  useEffect(() => {
    // Listen for storage events (when user creates petitions/polls in other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'petitionCreated' || e.key === 'pollCreated') {
        console.log('New content created, refreshing engagement data...');
        fetchEngagementData();
        // Clear the storage event
        localStorage.removeItem(e.key);
      }
    };

    // Listen for custom events from other components
    const handleContentCreated = () => {
      console.log('Content created event received, refreshing...');
      fetchEngagementData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('contentCreated', handleContentCreated);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('contentCreated', handleContentCreated);
    };
  }, [user?.id]);

  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    fetchEngagementData(period);
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="font-semibold text-[#2D3E50]">
          Welcome back, {user?.name}!
        </h2>
        <p className="text-gray-600">See what's happening in your community.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white shadow rounded-lg p-4 border-t-4 border-[#E84C3D]">
          <h3 className="text-gray-500 text-sm">My Petitions</h3>
          <p className="text-2xl font-bold text-[#2D3E50]">
            {stats.myPetitions}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 border-t-4 border-[#E84C3D]">
          <h3 className="text-gray-500 text-sm">Successful Petitions</h3>
          <p className="text-2xl font-bold text-[#2D3E50]">
            {stats.successfulPetitions}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 border-t-4 border-[#E84C3D]">
          <h3 className="text-gray-500 text-sm">Polls Created</h3>
          <p className="text-2xl font-bold text-[#2D3E50]">
            {stats.pollsCreated}
          </p>
        </div>
      </div>
      
      {/* Time Filter and Engagement Chart */}
      <div className="mt-4 sm:mt-6">
        <div className="mb-3 sm:mb-4">
          <TimeFilter 
            selectedPeriod={selectedPeriod}
            onPeriodChange={handlePeriodChange}
            className="justify-center"
          />
        </div>
        <div className="overflow-x-auto">
          <EngagementChart
            petitionsData={engagementData.petitionsData}
            pollsData={engagementData.pollsData}
            labels={engagementData.labels}
            loading={loading}
            onDataFetch={() => fetchEngagementData(selectedPeriod)}
            className="min-w-[300px]"
          />
        </div>
      </div>
    </>
  );
};

export default CitizenDashboard;
