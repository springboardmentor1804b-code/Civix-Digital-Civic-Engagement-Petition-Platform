import React, { useMemo } from 'react';

const ResultsStats = ({ polls, loading }) => {
  const stats = useMemo(() => {
    if (!polls || polls.length === 0) {
      return {
        totalPolls: 0,
        totalVotes: 0,
        avgEngagement: 0,
      };
    }

    const totalVotes = polls.reduce((sum, poll) => sum + (poll.votes?.length || 0), 0);
    
    // Calculate average engagement rate (votes per day)
    const engagementRates = polls.map(poll => {
      const pollVotes = poll.votes?.length || 0;
      if (!poll.createdAt || pollVotes === 0) return 0;
      
      const createdAt = new Date(poll.createdAt);
      const now = new Date();
      const daysAgo = Math.max((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24), 0.01);
      
      return pollVotes / daysAgo;
    });
    
    const avgEngagement = engagementRates.reduce((sum, rate) => sum + rate, 0) / polls.length;
    const activePolls = polls.filter(poll => poll.status === 'Active' || poll.status === 'active').length;

    return {
      totalPolls: polls.length,
      totalVotes,
      avgEngagement: avgEngagement.toFixed(1),
      activePolls
    };
  }, [polls]);

  const statsData = [
    {
      title: "Total Polls",
      value: stats.totalPolls,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      description: "Polls analyzed"
    },
    {
      title: "Total Votes",
      value: stats.totalVotes.toLocaleString(),
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      description: "Community participation"
    },
    {
      title: "Avg Engagement",
      value: stats.avgEngagement,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      description: "Votes per day"
    },
    
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgColor} rounded-lg shadow-sm border ${stat.borderColor} p-6 relative transform transition-all duration-300 hover:scale-105 hover:shadow-md`}
        >
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">{stat.title}</h3>
            
          </div>
          
          <div className="mb-2">
            <span className={`text-3xl font-bold ${stat.color}`}>
              {stat.value}
            </span>
          </div>
          
          <p className="text-xs text-gray-600">
            {stat.description}
          </p>
          
          
        </div>
      ))}
    </div>
  );
};

export default ResultsStats;