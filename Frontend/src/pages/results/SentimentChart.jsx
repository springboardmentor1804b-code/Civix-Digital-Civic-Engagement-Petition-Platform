import React, { useMemo } from 'react';

const SentimentChart = ({ polls }) => {
  // Calculate sentiment data
  const sentimentData = useMemo(() => {
    if (!polls || polls.length === 0) return { positive: 0, negative: 0, neutral: 0 };

    const sentiments = polls.reduce((acc, poll) => {
      acc[poll.sentiment] = (acc[poll.sentiment] || 0) + 1;
      return acc;
    }, { positive: 0, negative: 0, neutral: 0 });

    const total = polls.length;
    return {
      positive: Math.round((sentiments.positive / total) * 100),
      negative: Math.round((sentiments.negative / total) * 100),
      neutral: Math.round((sentiments.neutral / total) * 100)
    };
  }, [polls]);

  // Calculate engagement trends (simplified - could be enhanced with time-series data)
  const engagementData = useMemo(() => {
    if (!polls || polls.length === 0) return [];

    // Group polls by creation date and calculate average engagement
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayPolls = polls.filter(poll => {
        const pollDate = new Date(poll.createdAt);
        return pollDate >= dayStart && pollDate <= dayEnd;
      });

      const avgEngagement = dayPolls.length > 0 
        ? dayPolls.reduce((sum, poll) => sum + poll.engagementRate, 0) / dayPolls.length
        : 0;

      last7Days.push({
        date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        engagement: Math.round(avgEngagement * 100) / 100,
        polls: dayPolls.length
      });
    }

    return last7Days;
  }, [polls]);

  const maxEngagement = Math.max(...engagementData.map(d => d.engagement), 1);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Sentiment Analysis</h3>
        <p className="text-sm text-gray-600">
          Real-time sentiment distribution and engagement trends across all polls
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sentiment Distribution */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">Sentiment Distribution</h4>
          
          {/* Sentiment Bars */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-700">Positive</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ width: `${sentimentData.positive}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-10">
                  {sentimentData.positive}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-700">Negative</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all duration-500"
                    style={{ width: `${sentimentData.negative}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-10">
                  {sentimentData.negative}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
                <span className="text-sm text-gray-700">Neutral</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gray-400 transition-all duration-500"
                    style={{ width: `${sentimentData.neutral}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-10">
                  {sentimentData.neutral}%
                </span>
              </div>
            </div>
          </div>

          {/* Sentiment Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <strong>Community Sentiment:</strong> {' '}
              {sentimentData.positive > sentimentData.negative && sentimentData.positive > sentimentData.neutral
                ? <span className="text-green-600 font-medium">Generally Positive</span>
                : sentimentData.negative > sentimentData.positive && sentimentData.negative > sentimentData.neutral
                ? <span className="text-red-600 font-medium">Generally Negative</span>
                : <span className="text-gray-600 font-medium">Balanced/Neutral</span>
              }
            </div>
          </div>
        </div>

        {/* Engagement Trends */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">7-Day Engagement Trend</h4>
          
          {/* Simple Bar Chart */}
          <div className="space-y-3">
            {engagementData.map((day, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-12 text-xs text-gray-600 text-right">
                  {day.date}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-6 bg-gray-200 rounded overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${(day.engagement / maxEngagement) * 100}%` }}
                      >
                        {day.engagement > 0 && (
                          <span className="text-xs text-white font-medium">
                            {day.engagement}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 w-12">
                      {day.polls} polls
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Engagement Summary */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <strong>Avg Engagement Rate:</strong> {' '}
              <span className="text-blue-600 font-medium">
                {engagementData.length > 0 
                  ? (engagementData.reduce((sum, d) => sum + d.engagement, 0) / engagementData.length).toFixed(2)
                  : '0.00'
                } votes/hour
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time indicator */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live Data • Updates every 30 seconds</span>
          </div>
          <span>Based on {polls?.length || 0} polls</span>
        </div>
      </div>
    </div>
  );
};

export default SentimentChart;