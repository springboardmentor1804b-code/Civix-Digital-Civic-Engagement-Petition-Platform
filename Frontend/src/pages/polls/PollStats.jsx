import React, { useEffect, useState } from "react";
import { pollService } from "../../services/pollService";
import { getCurrentUserId } from "../../utils/auth";

const PollStats = ({ onCreatePoll, refreshTrigger }) => {
  const userId = getCurrentUserId();
  
  const [stats, setStats] = useState({
    activePolls: 0,
    votedPolls: 0,
    myPolls: 0,
    closedPolls: 0,
    totalPolls: 0,
    loading: true
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userId) {
        console.warn("User ID not found. Make sure the user is logged in.");
        setError("Please log in to view your statistics");
        return;
      }

      // Method 1: Use comprehensive stats API (recommended)
      try {
        const comprehensiveStats = await pollService.getPollStats(userId);
        setStats({
          activePolls: comprehensiveStats.activePolls || 0,
          votedPolls: comprehensiveStats.votedPolls || 0,
          myPolls: comprehensiveStats.myPolls || 0,
          closedPolls: comprehensiveStats.closedPolls || 0,
          totalPolls: comprehensiveStats.totalPolls || 0,
          loading: false
        });
        return;
      } catch (statsError) {
        console.log("Comprehensive stats not available, falling back to individual queries");
      }

      // Method 2: Fetch all polls and calculate stats (fallback)
      const polls = await pollService.getPolls();
      
      // Helper function to normalize user IDs for comparison
      const normalizeId = (u) => typeof u === "string" ? u : (u?._id || u?.id || "");

      // Calculate stats from polls data
      const activePolls = polls.filter(p => 
        p.status === "active" || p.status === "Active"
      ).length;

      const closedPolls = polls.filter(p => 
        p.status === "closed" || p.status === "Closed"
      ).length;

      const myPolls = polls.filter(p => 
        normalizeId(p.creator) === String(userId)
      ).length;

      // Calculate voted polls - check if user has voted in each poll
      let votedPolls = 0;
      for (const poll of polls) {
        if (poll.votes && Array.isArray(poll.votes)) {
          const hasVoted = poll.votes.some(vote => 
            normalizeId(vote.user) === String(userId)
          );
          if (hasVoted) votedPolls++;
        } else if (poll.userHasVoted) {
          votedPolls++;
        }
      }

      setStats({
        activePolls,
        votedPolls,
        myPolls,
        closedPolls,
        totalPolls: polls.length,
        loading: false
      });

    } catch (err) {
      console.error("Error fetching poll stats:", err);
      setError("Failed to load poll statistics");
      setStats(prev => ({ ...prev, loading: false }));
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats on component mount and when refreshTrigger changes
  useEffect(() => {
    fetchStats();
  }, [userId, refreshTrigger]);

  // Auto-refresh stats every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchStats();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [loading, userId]);

  const statsData = [
    { 
      title: "My Polls", 
      count: stats.myPolls, 
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      description: "Polls you created"
    },    
    { 
      title: "Polls I Voted On", 
      count: stats.votedPolls, 
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      description: "Polls you participated in"
    },
    { 
      title: "Active Polls", 
      count: stats.activePolls, 
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      description: "Currently accepting votes"
    },
    { 
      title: "Closed Polls", 
      count: stats.closedPolls, 
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      description: "Completed polls"
    },
  ];

  if (loading && stats.totalPolls === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">Error loading statistics</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Stats Grid - ALL 5 CONTAINERS IN ONE LINE */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        {/* First 4 stat cards */}
        {statsData.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} rounded-lg shadow-sm border ${stat.borderColor} p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-md`}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-base font-semibold text-gray-900 leading-tight">{stat.title}</h3>
              {loading && (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-green-600"></div>
              )}
            </div>
            
            <div className="mb-3">
              <span className={`text-3xl font-bold ${stat.color} transition-all duration-500`}>
                {stat.count}
              </span>
            </div>
            
            <p className="text-xs text-gray-600 leading-tight">
              {stat.description}
            </p>            
          </div>
        ))}

        {/* 5th container - Enhanced Create New Poll Card */}
        <div
          className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg shadow-lg p-6 hover:from-green-700 hover:to-green-800 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-xl"
          onClick={onCreatePoll}
        >
          <div className="w-full h-full flex flex-col items-center justify-center text-center text-white">
            <div className="text-4xl mb-3 font-light opacity-90">+</div>
            <h3 className="text-base font-bold mb-2 leading-tight">Create New Poll</h3>
            <p className="text-green-100 text-xs leading-tight">
              Ask your community a question
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollStats;