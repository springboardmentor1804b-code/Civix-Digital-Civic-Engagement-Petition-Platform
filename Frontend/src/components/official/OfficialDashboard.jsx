import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell, ResponsiveContainer 
} from 'recharts';
import {
  CheckCircle,
  PriorityHigh,
  Edit,
  Verified,
  LocationOn,
  People,
  AccessTime,
  Task,
  CheckBox,
  Cancel,
  Refresh,
  Assessment,
  TrendingUp,
  TimelineOutlined
} from '@mui/icons-material';
import officialService from '../../services/officialService';

const OfficialDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [petitionsToReview, setPetitionsToReview] = useState([]);
  const [allPetitions, setAllPetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Location filter state
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [availableLocations, setAvailableLocations] = useState([]);
  
  // Status filter state
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // DYNAMIC COUNTS STATE - Like PetitionStats
  const [totalPetitionsCount, setTotalPetitionsCount] = useState(0);
  const [activePetitionsCount, setActivePetitionsCount] = useState(0);
  const [reviewedPetitionsCount, setReviewedPetitionsCount] = useState(0);
  const [closedPetitionsCount, setClosedPetitionsCount] = useState(0);

  useEffect(() => {
    fetchAnalytics();
    fetchPetitionsToReview();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAnalytics();
      fetchPetitionsToReview();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Filter petitions when location or status changes
  useEffect(() => {
    filterPetitions();
  }, [selectedLocation, selectedStatus, allPetitions]);

  const fetchAnalytics = async () => {
    try {
      const response = await officialService.getAnalytics();
      
      if (response.analytics) {
        setAnalytics(response.analytics);
        
        // UPDATE DYNAMIC COUNTS - Like PetitionStats approach
        const overview = response.analytics.overview;
        setTotalPetitionsCount(overview.totalPetitions || 0);
        setActivePetitionsCount(overview.activePetitions || 0);
        setReviewedPetitionsCount(overview.reviewedPetitions || 0);
        setClosedPetitionsCount(overview.closedPetitions || 0);
        
        console.log('Analytics updated:', overview);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchPetitionsToReview = async () => {
    try {
      // Fetch all petitions without status filter
      const response = await officialService.getPetitionsForReview({});
      const petitions = response.petitions || [];
      
      // Store all petitions
      setAllPetitions(petitions);
      
      // Extract unique locations
      const locations = [...new Set(petitions.map(p => p.location))].sort();
      setAvailableLocations(locations);
      
      // Initially show all petitions
      setPetitionsToReview(petitions);
      
      // DEBUG: Log all unique statuses in the database
      const uniqueStatuses = [...new Set(petitions.map(p => p.status))];
      console.log('=== PETITION STATUS DEBUG ===');
      console.log('All unique statuses:', uniqueStatuses);
      console.log('Total petitions fetched:', petitions.length);
      console.log('Petition status breakdown:', {
        active: petitions.filter(p => p.status === 'active').length,
        under_review: petitions.filter(p => p.status === 'under_review').length,
        closed: petitions.filter(p => p.status === 'closed').length,
        // REMOVED: in_progress and successful from debug
      });
      console.log('Sample petition:', petitions[0]);
      console.log('=========================');
    } catch (error) {
      console.error('Error fetching petitions to review:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPetitions = () => {
    let filtered = allPetitions;

    // Filter by status - SIMPLIFIED to only handle active, under_review, and closed
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(p => {
        if (selectedStatus === 'active') {
          return p.status === 'active';
        } else if (selectedStatus === 'under_review') {
          // Only under_review status
          return p.status === 'under_review';
        } else if (selectedStatus === 'closed') {
          // Only closed status
          return p.status === 'closed';
        }
        return true;
      });
    }

    // Filter by location
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(p => p.location === selectedLocation);
    }

    setPetitionsToReview(filtered);
    
    // DEBUG: Log filtering results
    console.log('=== FILTER DEBUG ===');
    console.log('Selected status:', selectedStatus);
    console.log('Selected location:', selectedLocation);
    console.log('All petitions count:', allPetitions.length);
    console.log('Filtered petitions count:', filtered.length);
    console.log('Filtered petition statuses:', filtered.map(p => p.status));
    console.log('==================');
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
  };

  const updatePetitionStatus = async (petitionId, status, response) => {
    try {
      await officialService.updatePetitionStatus(petitionId, {
        status,
        officialResponse: response
      });
      
      // REFRESH COUNTS AFTER UPDATE - Dynamic update
      await fetchAnalytics();
      await fetchPetitionsToReview();
      
      alert('Petition status updated successfully!');
    } catch (error) {
      console.error('Error updating petition status:', error);
      alert('Error updating petition status');
    }
  };

  const verifyPetition = async (petitionId, verified, note) => {
    try {
      await officialService.verifyPetition(petitionId, {
        verified,
        verificationNote: note
      });
      
      // REFRESH COUNTS AFTER VERIFICATION - Dynamic update
      await fetchAnalytics();
      await fetchPetitionsToReview();
      
      alert(`Petition ${verified ? 'verified' : 'marked as invalid'} successfully!`);
    } catch (error) {
      console.error('Error verifying petition:', error);
      alert('Error verifying petition');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Public Official Dashboard</h1>
              <p className="text-gray-600 mt-2">Review petitions, manage responses, and view analytics</p>
              {/* Last Updated Indicator */}
              <p className="text-xs text-gray-500 mt-2">
                Last updated: {new Date().toLocaleTimeString()} • Auto-refreshes every 30 seconds
              </p>
            </div>

            {/* Location Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 whitespace-nowrap">
                <LocationOn className="text-blue-600" />
                Filter by Location:
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[200px]"
              >
                <option value="all">All Locations ({allPetitions.length})</option>
                {availableLocations.map(location => {
                  const count = allPetitions.filter(p => p.location === location).length;
                  return (
                    <option key={location} value={location}>
                      {location} ({count})
                    </option>
                  );
                })}
              </select>
              {selectedLocation !== 'all' && (
                <button
                  onClick={() => handleLocationChange('all')}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>

          {/* Active Filters Info */}
          {(selectedLocation !== 'all' || selectedStatus !== 'all') && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <LocationOn className="text-blue-600" fontSize="small" />
                  <span className="text-sm text-blue-800">
                    <strong>Active Filters:</strong>
                  </span>
                  {selectedStatus !== 'all' && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      Status: {selectedStatus === 'under_review' ? 'Under Review' : selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
                    </span>
                  )}
                  {selectedLocation !== 'all' && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      Location: {selectedLocation}
                    </span>
                  )}
                  <span className="text-blue-600 font-medium">
                    ({petitionsToReview.length} {petitionsToReview.length === 1 ? 'petition' : 'petitions'})
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedLocation('all');
                    setSelectedStatus('all');
                  }}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* NEW: Petition Status Analytics Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Assessment className="text-blue-600" sx={{ fontSize: 28 }} />
              <h3 className="text-xl font-semibold text-gray-900">Petition Status Overview</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <TimelineOutlined fontSize="small" />
              <span>Real-time Analytics</span>
            </div>
          </div>

          {/* Visual Statistics Grid - NOW CLICKABLE */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Petitions Card - Clickable */}
            <button
              onClick={() => handleStatusFilter(selectedStatus === 'all' ? 'all' : 'all')}
              className={`text-left bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-l-4 border-blue-500 transition-all hover:scale-105 hover:shadow-lg cursor-pointer ${
                selectedStatus === 'all' ? 'ring-2 ring-blue-400 shadow-lg' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-blue-900">Total Petitions</h4>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Assessment className="text-white" fontSize="small" />
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-900">{totalPetitionsCount}</p>
              <p className="text-xs text-blue-700 mt-1">
                {selectedStatus === 'all' ? '✓ Currently viewing' : 'Click to view all'}
              </p>
            </button>

            {/* Active Petitions Card - Clickable */}
            <button
              onClick={() => handleStatusFilter(selectedStatus === 'active' ? 'all' : 'active')}
              className={`text-left bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-l-4 border-green-500 transition-all hover:scale-105 hover:shadow-lg cursor-pointer ${
                selectedStatus === 'active' ? 'ring-2 ring-green-400 shadow-lg' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-green-900">Active Petitions</h4>
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-white" fontSize="small" />
                </div>
              </div>
              <p className="text-3xl font-bold text-green-900">{activePetitionsCount}</p>
              <p className="text-xs text-green-700 mt-1">
                {selectedStatus === 'active' 
                  ? '✓ Currently viewing' 
                  : totalPetitionsCount > 0 
                    ? `${((activePetitionsCount / totalPetitionsCount) * 100).toFixed(1)}% of total`
                    : 'No active petitions'
                }
              </p>
            </button>

            {/* Under Review Card - Clickable */}
            <button
              onClick={() => handleStatusFilter(selectedStatus === 'under_review' ? 'all' : 'under_review')}
              className={`text-left bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border-l-4 border-yellow-500 transition-all hover:scale-105 hover:shadow-lg cursor-pointer ${
                selectedStatus === 'under_review' ? 'ring-2 ring-yellow-400 shadow-lg' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-yellow-900">Under Review</h4>
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Task className="text-white" fontSize="small" />
                </div>
              </div>
              <p className="text-3xl font-bold text-yellow-900">{reviewedPetitionsCount}</p>
              <p className="text-xs text-yellow-700 mt-1">
                {selectedStatus === 'under_review' 
                  ? '✓ Currently viewing' 
                  : totalPetitionsCount > 0 
                    ? `${((reviewedPetitionsCount / totalPetitionsCount) * 100).toFixed(1)}% of total`
                    : 'None under review'
                }
              </p>
            </button>

            {/* Closed Petitions Card - Clickable */}
            <button
              onClick={() => handleStatusFilter(selectedStatus === 'closed' ? 'all' : 'closed')}
              className={`text-left bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border-l-4 border-red-500 transition-all hover:scale-105 hover:shadow-lg cursor-pointer ${
                selectedStatus === 'closed' ? 'ring-2 ring-red-400 shadow-lg' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-red-900">Closed Petitions</h4>
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-white" fontSize="small" />
                </div>
              </div>
              <p className="text-3xl font-bold text-red-900">{closedPetitionsCount}</p>
              <p className="text-xs text-red-700 mt-1">
                {selectedStatus === 'closed' 
                  ? '✓ Currently viewing' 
                  : totalPetitionsCount > 0 
                    ? `${((closedPetitionsCount / totalPetitionsCount) * 100).toFixed(1)}% of total`
                    : 'No closed petitions'
                }
              </p>
            </button>
          </div>

          {/* Status Distribution Chart */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Status Distribution</h4>
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Pie Chart */}
              <div className="w-full md:w-1/2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Active', value: activePetitionsCount, color: '#10b981' },
                        { name: 'Under Review', value: reviewedPetitionsCount, color: '#f59e0b' },
                        { name: 'Closed', value: closedPetitionsCount, color: '#ef4444' },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Active', value: activePetitionsCount, color: '#10b981' },
                        { name: 'Under Review', value: reviewedPetitionsCount, color: '#f59e0b' },
                        { name: 'Closed', value: closedPetitionsCount, color: '#ef4444' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart */}
              <div className="w-full md:w-1/2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Active', count: activePetitionsCount, fill: '#10b981' },
                      { name: 'Under Review', count: reviewedPetitionsCount, fill: '#f59e0b' },
                      { name: 'Closed', count: closedPetitionsCount, fill: '#ef4444' },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8">
                      {[
                        { name: 'Active', count: activePetitionsCount, fill: '#10b981' },
                        { name: 'Under Review', count: reviewedPetitionsCount, fill: '#f59e0b' },
                        { name: 'Closed', count: closedPetitionsCount, fill: '#ef4444' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {totalPetitionsCount > 0 
                    ? ((activePetitionsCount / totalPetitionsCount) * 100).toFixed(1) 
                    : 0}%
                </p>
                <p className="text-xs text-gray-600 mt-1">Active Rate</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {totalPetitionsCount > 0 
                    ? ((reviewedPetitionsCount / totalPetitionsCount) * 100).toFixed(1) 
                    : 0}%
                </p>
                <p className="text-xs text-gray-600 mt-1">Review Rate</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {totalPetitionsCount > 0 
                    ? ((closedPetitionsCount / totalPetitionsCount) * 100).toFixed(1) 
                    : 0}%
                </p>
                <p className="text-xs text-gray-600 mt-1">Closure Rate</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {activePetitionsCount + reviewedPetitionsCount}
                </p>
                <p className="text-xs text-gray-600 mt-1">Needs Attention</p>
              </div>
            </div>
          </div>
        </div>

        {/* Petitions Requiring Review */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">
              {selectedStatus === 'all' && 'All Petitions'}
              {selectedStatus === 'active' && 'Active Petitions'}
              {selectedStatus === 'under_review' && 'Petitions Under Review'}
              {selectedStatus === 'closed' && 'Closed Petitions'}
            </h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  fetchAnalytics();
                  fetchPetitionsToReview();
                }}
                className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-sm hover:bg-blue-200 transition-colors"
              >
                <Refresh fontSize="small" />
                Refresh
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {petitionsToReview.length > 0 ? (
              petitionsToReview.map(petition => (
                <PetitionReviewCard 
                  key={petition._id} 
                  petition={petition}
                  onStatusUpdate={updatePetitionStatus}
                  onVerify={verifyPetition}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <CheckCircle sx={{ fontSize: 72, color: '#9CA3AF', mb: 2 }} />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedStatus === 'all' ? 'No petitions found' : `No ${selectedStatus.replace('_', ' ')} petitions`}
                </h4>
                <p className="text-gray-500">
                  {selectedLocation !== 'all' 
                    ? `No petitions match your current filters (${selectedStatus !== 'all' ? selectedStatus.replace('_', ' ') + ' status, ' : ''}${selectedLocation} location).`
                    : selectedStatus === 'all' 
                      ? 'There are no petitions in the system yet.'
                      : `There are no ${selectedStatus.replace('_', ' ')} petitions at this time.`
                  }
                </p>
                {(selectedLocation !== 'all' || selectedStatus !== 'all') && (
                  <button
                    onClick={() => {
                      setSelectedLocation('all');
                      setSelectedStatus('all');
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Petition Review Card Component with Status Indicators
const PetitionReviewCard = ({ petition, onStatusUpdate, onVerify }) => {
  const [status, setStatus] = useState('under_review');
  const [response, setResponse] = useState('');
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [showVerifyForm, setShowVerifyForm] = useState(false);
  const [verificationNote, setVerificationNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    setIsSubmitting(true);
    try {
      await onStatusUpdate(petition._id, status, response);
      setShowResponseForm(false);
      setResponse('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (verified) => {
    setIsSubmitting(true);
    try {
      await onVerify(petition._id, verified, verificationNote);
      setShowVerifyForm(false);
      setVerificationNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-semibold text-lg">{petition.title}</h4>
            {petition.verified && (
              <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                <Verified fontSize="small" />
                Verified
              </span>
            )}
            {/* Priority Indicator */}
            {petition.priority === 'high' && (
              <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                <PriorityHigh fontSize="small" />
                High Priority
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-3">{petition.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Status Badge - SIMPLIFIED */}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              petition.status === 'active' ? 'bg-green-100 text-green-800' :
              petition.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
              petition.status === 'closed' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              Status: {petition.status === 'under_review' ? 'Under Review' : petition.status.charAt(0).toUpperCase() + petition.status.slice(1)}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {petition.category}
            </span>
            <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
              <LocationOn fontSize="small" />
              {petition.location}
            </span>
            <span className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              <People fontSize="small" />
              {petition.signaturesCount} signatures
            </span>
            {/* Time indicator */}
            <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              <AccessTime fontSize="small" />
              {new Date(petition.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowResponseForm(!showResponseForm)}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Edit fontSize="small" />
          Review Petition
        </button>
        <button
          onClick={() => setShowVerifyForm(!showVerifyForm)}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {petition.verified ? (
            <>
              <CheckCircle fontSize="small" />
              Verified
            </>
          ) : (
            <>
              <Task fontSize="small" />
              Verify
            </>
          )}
        </button>
      </div>

      {/* Review Form - ONLY 2 OPTIONS */}
      {showResponseForm && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="font-semibold mb-3">Official Review</h5>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                <option value="under_review">Under Review</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Official Response</label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                placeholder="Provide an official response to this petition..."
                disabled={isSubmitting}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSubmitReview}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                onClick={() => setShowResponseForm(false)}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verify Form */}
      {showVerifyForm && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="font-semibold mb-3">Petition Verification</h5>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Verification Note (Optional)</label>
              <textarea
                value={verificationNote}
                onChange={(e) => setVerificationNote(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                placeholder="Add a note about the verification..."
                disabled={isSubmitting}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => handleVerify(true)}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 w-full sm:w-auto"
              >
                <CheckBox fontSize="small" />
                {isSubmitting ? 'Processing...' : 'Verify as Legitimate'}
              </button>
              <button
                onClick={() => handleVerify(false)}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 w-full sm:w-auto"
              >
                <Cancel fontSize="small" />
                {isSubmitting ? 'Processing...' : 'Mark as Invalid'}
              </button>
              <button
                onClick={() => setShowVerifyForm(false)}
                disabled={isSubmitting}
                className="flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 w-full sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficialDashboard;