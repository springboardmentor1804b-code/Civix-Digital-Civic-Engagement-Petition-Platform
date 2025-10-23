import React from "react";

const TimeFilter = ({ selectedPeriod, onPeriodChange, className = "" }) => {
  const periods = [
    { value: 'today', label: 'Today', description: 'See today\'s activity', icon: '📅' },
    { value: 'week', label: 'This Week', description: 'Last 7 days', icon: '📊' },
    { value: 'month', label: 'This Month', description: 'Last 30 days', icon: '📈' }
  ];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${className}`}>
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onPeriodChange(period.value)}
          className={`p-4 rounded-xl text-left transition-all duration-200 border-2 ${
            selectedPeriod === period.value
              ? 'bg-[#E84C3D] text-white border-[#E84C3D] shadow-lg transform scale-105'
              : 'bg-white text-gray-700 border-gray-200 hover:border-[#E84C3D] hover:shadow-md'
          }`}
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{period.icon}</span>
            <div>
              <div className="font-semibold text-lg">{period.label}</div>
              <div className={`text-sm ${
                selectedPeriod === period.value ? 'text-red-100' : 'text-gray-500'
              }`}>
                {period.description}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default TimeFilter;
