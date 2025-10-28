import React, { useState, useEffect } from 'react';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { pollService } from '../../services/pollService';

const PollFilters = ({ activeFilter, onFilterChange }) => {
  const [dropdowns, setDropdowns] = useState({ location: false, status: false, type: false });
  const [isMobile, setIsMobile] = useState(false);
  const [locations, setLocations] = useState(['All Locations']);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [locationCounts, setLocationCounts] = useState({});

  const pollTypes = ['Active Polls', 'Polls I Voted On', 'My Polls', 'All Polls'];
  const statuses = ['All Status', 'Active', 'Closed'];

  // Fetch real-time locations from polls
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoadingLocations(true);
        const polls = await pollService.getPolls();
        
        // Extract unique locations and count polls per location
        const locationMap = {};
        polls.forEach(poll => {
          if (poll.location) {
            locationMap[poll.location] = (locationMap[poll.location] || 0) + 1;
          }
        });
        
        // Sort locations alphabetically
        const uniqueLocations = Object.keys(locationMap).sort();
        
        setLocations(['All Locations', ...uniqueLocations]);
        setLocationCounts(locationMap);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setLocations(['All Locations']);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
    
    // Refresh locations every 30 seconds
    const interval = setInterval(fetchLocations, 30000);
    return () => clearInterval(interval);
  }, []);

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      const isMobileSize = window.innerWidth < 768; // md breakpoint
      setIsMobile(isMobileSize);
      
      // Force grid view on mobile
      if (isMobileSize && activeFilter.view !== 'Grid View') {
        onFilterChange('view', 'Grid View');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [activeFilter.view, onFilterChange]);

  const toggleDropdown = (dropdown) => {
    setDropdowns(prev => ({ ...prev, [dropdown]: !prev[dropdown] }));
  };

  const handleSelect = (type, value) => {
    onFilterChange(type, value);
    setDropdowns(prev => ({ ...prev, [type]: false }));
  };

  const clearFilters = () => {
    onFilterChange('type', 'Active Polls');
    onFilterChange('location', 'All Locations');
    onFilterChange('status', 'All Status');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setDropdowns({ location: false, status: false, type: false });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate total polls count
  const totalPolls = Object.values(locationCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 space-y-4 md:space-y-0">
        {/* Poll Type Filters */}
        {isMobile ? (
          // Mobile: Dropdown Select
          <div className="relative dropdown-container">
            <button
              onClick={() => toggleDropdown('type')}
              className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <span>{activeFilter.type || 'Active Polls'}</span>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${dropdowns.type ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdowns.type && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
                {pollTypes.map(type => (
                  <button 
                    key={type} 
                    onClick={() => handleSelect('type', type)} 
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      activeFilter.type === type
                        ? 'bg-green-50 text-green-600 font-medium border-l-4 border-green-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Desktop: Horizontal Buttons
          <div className="flex space-x-4 overflow-x-auto">
            {pollTypes.map(type => (
              <button
                key={type}
                onClick={() => onFilterChange('type', type)}
                className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                  activeFilter.type === type 
                    ? 'text-green-600 border-b-2 border-green-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}

        {/* Right Side Controls */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 items-start sm:items-center">
          {/* View Toggle - HIDDEN ON MOBILE */}
          {!isMobile && (
            <div className="flex items-center bg-gray-100 rounded-lg p-1 mr-2">
              <button
                onClick={() => onFilterChange('view', 'List View')}
                className={`flex items-center px-2 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeFilter.view === 'List View' || !activeFilter.view
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ViewListIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onFilterChange('view', 'Grid View')}
                className={`flex items-center px-2 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeFilter.view === 'Grid View'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <GridViewIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Location Filter - Real-time from polls */}
            <div className="relative dropdown-container">
              <button
                onClick={() => toggleDropdown('location')}
                disabled={loadingLocations}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                
                <span>
                  {loadingLocations ? 'Loading...' : (activeFilter.location || 'All Locations')}
                </span>
                <svg 
                  className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${dropdowns.location ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdowns.location && !loadingLocations && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                  {locations.map(item => {
                    const count = item === 'All Locations' ? totalPolls : (locationCounts[item] || 0);
                    return (
                      <button 
                        key={item} 
                        onClick={() => handleSelect('location', item)} 
                        className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${
                          activeFilter.location === item
                            ? 'bg-green-50 text-green-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {item !== 'All Locations' && <LocationOnIcon sx={{ fontSize: 14 }} />}
                          {item}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          activeFilter.location === item
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                  {locations.length === 1 && (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      No locations available
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative dropdown-container">
              <button
                onClick={() => toggleDropdown('status')}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
              >
                <span>{activeFilter.status || 'All Status'}</span>
                <svg 
                  className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${dropdowns.status ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdowns.status && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                  {statuses.map(item => (
                    <button 
                      key={item} 
                      onClick={() => handleSelect('status', item)} 
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        activeFilter.status === item
                          ? 'bg-green-50 text-green-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm bg-gray-200 rounded text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Location Filter Info Banner */}
      {activeFilter.location && activeFilter.location !== 'All Locations' && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <LocationOnIcon className="text-green-600" sx={{ fontSize: 20 }} />
          <span className="text-sm text-green-800">
            Showing polls for <strong>{activeFilter.location}</strong>
            <span className="ml-2 text-green-600">
              ({locationCounts[activeFilter.location] || 0} {locationCounts[activeFilter.location] === 1 ? 'poll' : 'polls'})
            </span>
          </span>
          <button
            onClick={() => handleSelect('location', 'All Locations')}
            className="ml-auto text-green-600 hover:text-green-800 text-sm font-medium"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

export default PollFilters;