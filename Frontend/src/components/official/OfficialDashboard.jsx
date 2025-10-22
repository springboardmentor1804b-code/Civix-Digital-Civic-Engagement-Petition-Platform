import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer 
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
  Refresh
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

  // Filter petitions when location changes
  useEffect(() => {
    filterPetitionsByLocation();
  }, [selectedLocation, allPetitions]);

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
      const response = await officialService.getPetitionsForReview({ status: 'active' });
      const petitions = response.petitions || [];
      
      // Store all petitions
      setAllPetitions(petitions);
      
      // Extract unique locations
      const locations = [...new Set(petitions.map(p => p.location))].sort();
      setAvailableLocations(locations);
      
      // Initially show all petitions
      setPetitionsToReview(petitions);
    } catch (error) {
      console.error('Error fetching petitions to review:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPetitionsByLocation = () => {
    if (selectedLocation === 'all') {
      setPetitionsToReview(allPetitions);
    } else {
      const filtered = allPetitions.filter(p => p.location === selectedLocation);
      setPetitionsToReview(filtered);
    }
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
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
        <div className="">
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

          {/* Location Filter Info */}
          {selectedLocation !== 'all' && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
              <LocationOn className="text-blue-600" fontSize="small" />
              <span className="text-sm text-blue-800">
                Showing petitions for <strong>{selectedLocation}</strong> 
                <span className="ml-2 text-blue-600">
                  ({petitionsToReview.length} {petitionsToReview.length === 1 ? 'petition' : 'petitions'})
                </span>
              </span>
            </div>
          )}
        </div>

        {/* UPDATED Overview Cards - Using Dynamic Counts */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 text-blue-600 border border-blue-200 p-6 rounded-lg shadow transform transition-transform hover:scale-105">
            <h3 className="text-lg font-semibold">Total Petitions</h3>
            <p className="text-3xl font-bold mt-2 transition-all duration-500">
              {totalPetitionsCount}
            </p>
            <div className="text-blue-600 text-sm mt-1">
              System-wide petitions
            </div>
          </div>

          <div className="bg-yellow-50 text-yellow-600 border border-yellow-200 p-6 rounded-lg shadow transform transition-transform hover:scale-105">
            <h3 className="text-lg font-semibold">Under Review</h3>
            <p className="text-3xl font-bold mt-2 transition-all duration-500">
              {reviewedPetitionsCount}
            </p>
            <div className="text-yellow-600 text-sm mt-1">
              Awaiting official response
            </div>
          </div>

          <div className="bg-green-50 text-green-600 border border-green-200 p-6 rounded-lg shadow transform transition-transform hover:scale-105">
            <h3 className="text-lg font-semibold">Active</h3>
            <p className="text-3xl font-bold mt-2 transition-all duration-500">
              {activePetitionsCount}
            </p>
            <div className="text-green-600 text-sm mt-1">
              Currently collecting signatures
            </div>
          </div>

          <div className="bg-red-50 text-red-600 border border-red-200 p-6 rounded-lg shadow transform transition-transform hover:scale-105">
            <h3 className="text-lg font-semibold">Closed</h3>
            <p className="text-3xl font-bold mt-2 transition-all duration-500">
              {closedPetitionsCount}
            </p>
            <div className="text-red-600 text-sm mt-1">
              Completed or rejected
            </div>
          </div>
        </div>

        {/* Petitions Requiring Review */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Petitions Requiring Review</h3>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {petitionsToReview.length} petition(s) pending
              </span>
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
                <h4 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h4>
                <p className="text-gray-500">No petitions requiring review at this time.</p>
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

      {/* Review Form */}
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
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
                <option value="successful">Successful</option>
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