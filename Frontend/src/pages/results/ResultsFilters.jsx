import React, { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const ResultsFilters = ({ filters, onFilterChange, polls }) => {
  const [dropdowns, setDropdowns] = useState({
    status: false,
    timeRange: false,
    pollType: false
  });

  const statusOptions = ['All Status', 'Active', 'Closed'];
  const timeRangeOptions = ['All Time', 'Last 24 Hours', 'Last Week', 'Last Month'];
  const pollTypeOptions = ['All Polls', 'My Polls', 'Polls I Voted On'];

  const toggleDropdown = (dropdown) => {
    setDropdowns(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }));
  };

  const handleSelect = (filterType, value) => {
    onFilterChange(filterType, value);
    setDropdowns(prev => ({ ...prev, [filterType]: false }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
      <div className="flex flex-wrap items-center gap-4">
        <h3 className="text-sm font-medium text-gray-900">Filter Results:</h3>
        
        {/* Status Filter */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('status')}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            
            <span>{filters.status}</span>
            <ExpandMoreIcon className="w-4 h-4" />
          </button>
          {dropdowns.status && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              {statusOptions.map(option => (
                <button 
                  key={option}
                  onClick={() => handleSelect('status', option)} 
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    filters.status === option
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Time Range Filter */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('timeRange')}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            
            <span>{filters.timeRange}</span>
            <ExpandMoreIcon className="w-4 h-4" />
          </button>
          {dropdowns.timeRange && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              {timeRangeOptions.map(option => (
                <button 
                  key={option}
                  onClick={() => handleSelect('timeRange', option)} 
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    filters.timeRange === option
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Poll Type Filter */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('pollType')}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            
            <span>{filters.pollType}</span>
            <ExpandMoreIcon className="w-4 h-4" />
          </button>
          {dropdowns.pollType && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              {pollTypeOptions.map(option => (
                <button 
                  key={option}
                  onClick={() => handleSelect('pollType', option)} 
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    filters.pollType === option
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear Filters */}
        <button
          onClick={() => {
            onFilterChange('status', 'All Status');
            onFilterChange('timeRange', 'All Time');
            onFilterChange('pollType', 'All Polls');
          }}
          className="px-3 py-2 text-sm bg-gray-200 rounded text-gray-600 hover:text-gray-800"
        >
          Clear All
        </button>

        {/* Results Count */}
        <div className="ml-auto text-sm text-gray-500">
          Showing results for {polls?.length || 0} polls
        </div>
      </div>
    </div>
  );
};

export default ResultsFilters;