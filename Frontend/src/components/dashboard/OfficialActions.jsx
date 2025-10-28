import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../services/notificationService';
import {
  AccessTime,
  TrendingUp,
  CheckCircle,
  Cancel,
  ChatBubble,
  ArrowForward,
  Lock,
  RemoveRedEye,
  Description,
  Person,
} from '@mui/icons-material';


const OfficialActions = ({ limit = 10 }) => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecentActions();
  }, [limit]);

  const fetchRecentActions = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getRecentOfficialActions(limit);
      setActions(response.actions || []);
    } catch (error) {
      console.error('Error fetching recent actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    if (action.includes('Approved')) return <CheckCircle className="text-green-600" fontSize="small" />;
    if (action.includes('Rejected')) return <Cancel className="text-red-600" fontSize="small" />;
    if (action.includes('Responded')) return <ChatBubble className="text-blue-600" fontSize="small" />;
    if (action.includes('Forwarded')) return <ArrowForward className="text-purple-600" fontSize="small" />;
    if (action.includes('Closed')) return <Lock className="text-gray-600" fontSize="small" />;
    if (action.includes('Under Review')) return <RemoveRedEye className="text-yellow-600" fontSize="small" />;
    return <Description className="text-gray-600" fontSize="small" />;
  };

  const getActionColor = (action) => {
    if (action.includes('Approved')) return 'bg-green-50 border-green-200';
    if (action.includes('Rejected')) return 'bg-red-50 border-red-200';
    if (action.includes('Responded')) return 'bg-blue-50 border-blue-200';
    if (action.includes('Forwarded')) return 'bg-purple-50 border-purple-200';
    if (action.includes('Closed')) return 'bg-gray-50 border-gray-200';
    return 'bg-yellow-50 border-yellow-200';
  };

  // Extract status from action text
  const extractStatus = (actionText) => {
    const match = actionText.match(/status to "([^"]+)"/i);
    return match ? match[1] : null;
  };

  if (loading) {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="text-blue-600" />
          Recent Official Actions
        </h3>
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="text-blue-600" />
          Recent Official Actions
        </h3>
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <p className="text-center text-gray-500">No recent official actions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        Recent Official Actions
        {actions.length > 3 && (
          <span className="text-xs text-gray-500 font-normal ml-2">
            (Scroll to see more)
          </span>
        )}
      </h3>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {/* FIXED: Scrollable container with inline styles */}
        <div 
          className="divide-y divide-gray-100"
          style={{ 
            maxHeight: '240px',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          {actions.map((action, index) => {
            const status = extractStatus(action.action);
            
            return (
              <div
                key={action.id || index}
                className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${getActionColor(action.action)}`}
                onClick={() => {
                  if (action.relatedPetition) {
                    navigate(`/dashboard/petitions`);
                  } else if (action.relatedPoll) {
                    navigate(`/dashboard/polls`);
                  }
                }}
              >
                {/* COMPACT: Single Line Format with Timestamp on Right */}
                <div className="flex items-center justify-between gap-3">
                  {/* Left Side: Icon + Content */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* Icon */}
                    <span className="flex-shrink-0">
                      {getActionIcon(action.action)}
                    </span>

                    {/* Main Text */}
                    <div className="flex items-center gap-1.5 flex-wrap text-sm">
                      {/* Action prefix */}
                      <span className="text-gray-700 font-medium">
                        {action.action.includes('Updated') ? 'Updated petition' : 
                         action.action.includes('Verified') ? 'Verified petition' :
                         action.action.includes('Marked') ? 'Marked petition' :
                         action.action.includes('Added') ? 'Added response to' :
                         'Action on'}
                      </span>

                      {/* Petition Title */}
                      {action.petitionTitle && (
                        <span className="text-blue-600 font-bold">
                          "{action.petitionTitle}"
                        </span>
                      )}

                      {/* Poll Title */}
                      {action.pollTitle && !action.petitionTitle && (
                        <span className="text-purple-600 font-bold">
                          "{action.pollTitle}"
                        </span>
                      )}

                      {/* Status */}
                      {status && (
                        <>
                          <span className="text-gray-700">status to</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                            status === 'closed' ? 'bg-red-100 text-red-800' :
                            status === 'active' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {status === 'under_review' ? 'Under Review' : status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </>
                      )}

                      {/* By Official */}
                      {action.official && (
                        <>
                          <span className="text-gray-500">by</span>
                          <span className="flex items-center gap-1 text-blue-700 font-semibold">
                            <Person fontSize="small" />
                            {action.official}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Timestamp */}
                  <span className="text-gray-400 text-xs flex-shrink-0 flex items-center gap-1 ml-4">
                    <AccessTime fontSize="small" style={{ fontSize: 14 }} />
                    {notificationService.formatTimestamp(action.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OfficialActions;