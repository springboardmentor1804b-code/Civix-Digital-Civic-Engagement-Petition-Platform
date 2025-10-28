import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import petitionService from "../../services/petitionService";
import { getCurrentUserId, isAuthenticated } from "../../utils/auth";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CommentIcon from '@mui/icons-material/Comment';
import CommentsModal from './CommentsModal';

const PetitionCard = ({ petition, onSigned, viewMode = "List View" }) => {
  const navigate = useNavigate();
  const [signed, setSigned] = useState(false);
  const [signaturesCount, setSignaturesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checkingSignature, setCheckingSignature] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [localCommentCount, setLocalCommentCount] = useState(0);
  
  const currentUserId = getCurrentUserId();
  const userIsAuthenticated = isAuthenticated();
  const isCreator = petition.creator?._id === currentUserId;
  
  // ✅ NEW: Check if petition is closed
  const isClosed = ['closed', 'Closed', 'successful', 'Successful', 'rejected', 'Rejected', 'expired', 'Expired'].includes(petition.status);

  // Initialize comment count
  useEffect(() => {
    setLocalCommentCount(petition.commentsCount || petition.comments?.length || 0);
  }, [petition]);

  // Check if mobile screen
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Force grid view on mobile
  const isGridView = isMobile ? true : viewMode === "Grid View";

  // Check if user has signed this petition on component mount
  useEffect(() => {
    const checkUserSignature = async () => {
      try {
        setCheckingSignature(true);
        
        // Set initial values from petition prop
        setSigned(petition.userHasSigned || petition.signedByCurrentUser || false);
        setSignaturesCount(petition.signaturesCount || 0);
        
        // If we have a user ID, fetch fresh petition data to confirm signature status
        if (currentUserId && userIsAuthenticated) {
          try {
            const freshPetition = await petitionService.getPetitionById(petition._id);
            if (freshPetition.success) {
              const petitionData = freshPetition.petition;
              setSigned(petitionData.userHasSigned || petitionData.signedByCurrentUser || false);
              setSignaturesCount(petitionData.signaturesCount || 0);
            }
          } catch (error) {
            console.log('Error fetching fresh petition data, using prop data');
          }
        }
      } catch (error) {
        console.error('Error checking signature status:', error);
        setSigned(petition.userHasSigned || petition.signedByCurrentUser || false);
        setSignaturesCount(petition.signaturesCount || 0);
      } finally {
        setCheckingSignature(false);
      }
    };

    checkUserSignature();
  }, [petition._id, petition.userHasSigned, petition.signedByCurrentUser, petition.signaturesCount, currentUserId, userIsAuthenticated]);

  const handleSign = async () => {
    if (!userIsAuthenticated || !currentUserId) {
      navigate('/login');
      return;
    }

    if (signed) {
      return;
    }

    if (isCreator) {
      return;
    }

    // ✅ NEW: Prevent signing closed petitions
    if (isClosed) {
      return;
    }

    try {
      setLoading(true);
      const result = await petitionService.signPetition(petition._id);
      
      if (result.success) {
        setSigned(true);
        const newCount = result.signatureCount || signaturesCount + 1;
        setSignaturesCount(newCount);
        
        if (onSigned) {
          onSigned(petition._id, {
            signed: true,
            signaturesCount: newCount
          });
        }
      }
    } catch (err) {
      console.error("Error signing petition:", err);
      
      if (err.response?.status === 400) {
        setSigned(true);
        
        if (err.response?.data?.signatureCount) {
          setSignaturesCount(err.response.data.signatureCount);
        }
      } else if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await petitionService.deletePetition(petition._id);
      onSigned?.(`delete_${petition._id}`);
    } catch (err) {
      console.error("Error deleting petition:", err);
    }
  };

  const handleEdit = () => {
    navigate(`/dashboard/petitions/create`, {
      state: { petition }
    });
  };

  const handleViewComments = (e) => {
    e.stopPropagation();
    setShowCommentsModal(true);
  };

  const handleCommentAdded = (newCount) => {
    setLocalCommentCount(newCount);
    // Update parent if needed
    if (onSigned) {
      onSigned(petition._id, {
        signed,
        signaturesCount,
        commentsCount: newCount
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "active": return "bg-green-100 text-green-800";
      case "Under Review": return "bg-blue-100 text-blue-800";
      case "under_review": return "bg-blue-100 text-blue-800";
      case "Closed": return "bg-purple-100 text-purple-800";
      case "closed": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTimeColor = (time) => {
    if (!time) return "text-gray-600";
    if (time.includes("minute")) return "text-green-600";
    if (time.includes("hour")) return "text-blue-600";
    if (time.includes("day")) return "text-purple-600";
    return "text-gray-600";
  };

  // Calculate progress percentage
  const signatureGoal = petition.signatureGoal || 100;
  const progressPercentage = Math.min((signaturesCount / signatureGoal) * 100, 100);

  if (checkingSignature) {
    return (
      <div className={`bg-white rounded-lg shadow-md border border-gray-200 animate-pulse ${
        isGridView ? 'p-4 h-full flex flex-col' : 'p-6 mb-4'
      }`}>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-16 bg-gray-200 rounded mb-4"></div>
        <div className="h-3 bg-gray-200 rounded mb-4"></div>
        <div className="flex justify-between">
          <div className="h-8 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow ${
        isGridView ? 'p-4 h-full flex flex-col' : 'p-6 mb-4'
      }`}>
      
      {/* Header */}
      <div className={`flex justify-between items-start ${isGridView ? 'mb-3' : 'mb-3'}`}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(petition.status)}`}>
            {petition.status === 'active' ? 'Active' : petition.status}
          </span>
          
          {/* ✅ NEW: Show "Closed" badge for closed petitions */
          isClosed && (
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 border border-gray-300">
              Signing Closed
            </span>
          )}
          
          {/* Edit/Delete buttons for creator */}
          {isCreator && userIsAuthenticated && (
            <div className="flex gap-1">
              <button
                onClick={handleEdit}
                className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
        
        <span className={`text-xs ${getTimeColor(petition.time)} flex-shrink-0`}>
          {petition.time || 'Recently'}
        </span>
      </div>

      {/* Title */}
      <h3 className={`font-semibold text-gray-900 ${
        isGridView ? 'text-base mb-2' : 'text-lg mb-2'
      }`} style={isGridView ? {
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 2,
        lineHeight: '1.4em',
        maxHeight: '2.8em'
      } : {}}>
        {petition.title}
      </h3>

      {/* Description */}
      <p className={`text-gray-600 text-sm leading-relaxed ${
        isGridView ? 'mb-3' : 'mb-4'
      }`} style={isGridView ? {
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 3,
        lineHeight: '1.4em',
        maxHeight: '4.2em'
      } : {}}>
        {petition.description}
      </p>

      {/* Progress Section */}
      <div className={`${isGridView ? 'mb-4 flex-1' : 'mb-4'}`}>
        <div className={`flex justify-between text-sm text-gray-600 ${isGridView ? 'mb-1' : 'mb-1'}`}>
          <span><strong>{signaturesCount}</strong> Signatures</span>
          <span>Goal: <strong>{signatureGoal}</strong></span>
        </div>
        
        {/* Progress Bar */}
        <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${
          isGridView ? 'h-2' : 'h-3'
        }`}>
          <div
            className={`rounded-full transition-all duration-700 ease-in-out ${
              progressPercentage >= 100 ? 'bg-green-500' :
              progressPercentage >= 80 ? 'bg-blue-500' :
              progressPercentage >= 50 ? 'bg-yellow-500' : 'bg-gray-400'
            } ${isGridView ? 'h-2' : 'h-3'}`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
        
        <div className={`flex justify-between text-xs text-gray-500 ${isGridView ? 'mt-1' : 'mt-1'}`}>
          <span>{Math.round(progressPercentage)}% complete</span>
          <span>{Math.max(0, signatureGoal - signaturesCount)} signatures needed</span>
        </div>
      </div>

      {/* Footer */}
      <div className={isGridView ? 'mt-auto' : ''}>
        {isGridView ? (
          // Grid View Footer - Optimized for mobile
          <div className="space-y-3">
            {/* Mobile Grid: Stacked layout for better readability */}
            <div className="space-y-2">
              {/* Category and Creator */}
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                  {petition.category}
                </span>
                <span className="text-xs text-gray-500 truncate max-w-24">
                  by {petition.creator?.name || 'Anonymous'}
                </span>
              </div>
              
              {/* Location and Comments */}
              <div className="flex items-center justify-between gap-2">
                {/* Location */}
                <div className="flex items-center flex-1 min-w-0">
                  <LocationOnIcon className="text-blue-600 mr-1 flex-shrink-0" style={{ fontSize: '14px' }} />
                  <span className="text-xs text-blue-900 truncate">
                    {petition.location || 'Not specified'}
                  </span>
                </div>
                
                {/* Comments Button */}
                <button
                  onClick={handleViewComments}
                  className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors flex-shrink-0"
                  title="View comments"
                >
                  <CommentIcon className="text-gray-600" style={{ fontSize: '14px' }} />
                  <span className="text-xs font-medium text-gray-700">
                    {localCommentCount}
                  </span>
                </button>
              </div>
            </div>

            {/* Sign Button for Grid View - ✅ UPDATED */}
            <button
              onClick={handleSign}
              disabled={signed || loading || isCreator || !userIsAuthenticated || isClosed}
              className={`w-full px-3 py-2 text-white rounded-md text-sm font-medium transition-all duration-200 ${
                !userIsAuthenticated
                  ? "bg-gray-400 cursor-not-allowed"
                  : isCreator
                  ? "bg-gray-400 cursor-not-allowed"
                  : isClosed
                  ? "bg-gray-500 cursor-not-allowed"
                  : signed 
                  ? "bg-green-500 cursor-default" 
                  : loading
                  ? "bg-gray-400 cursor-wait"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-95"
              }`}
              title={isClosed ? "This petition is closed and no longer accepting signatures" : ""}
            >
              {!userIsAuthenticated ? (
                "Login to Sign"
              ) : isCreator ? (
                "Your Petition"
              ) : isClosed ? (
                "Petition Closed"
              ) : loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing...
                </div>
              ) : signed ? (
                "✓ Signed"
              ) : (
                "Sign Petition"
              )}
            </button>
          </div>
        ) : (
          // List View Footer - Desktop only - ✅ UPDATED
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                {petition.category}
              </span>
              <span className="ml-2 text-xs font-semibold text-gray-500 truncate flex-shrink-0">
                by {petition.creator?.name || 'Anonymous'}
              </span>
              
              {/* Location Card */}
              <div className="flex items-center">
                <div className="p-1">
                  <LocationOnIcon className="text-blue-600" style={{ fontSize: '18px' }} />
                </div>
                <div className="">
                  <p className="text-xs font-semibold text-blue-900 truncate" title={petition.location}>
                    {petition.location || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Comments Button - Desktop */}
              <button
                onClick={handleViewComments}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
                title="View comments"
              >
                <CommentIcon className="text-gray-600" style={{ fontSize: '18px' }} />
                <span className="text-sm font-medium text-gray-700">
                  {localCommentCount} {localCommentCount === 1 ? 'Comment' : 'Comments'}
                </span>
              </button>
            </div>

            {/* Sign button - ✅ UPDATED */}
            <button
              onClick={handleSign}
              disabled={signed || loading || isCreator || !userIsAuthenticated || isClosed}
              className={`px-4 py-2 rounded-md text-white font-medium transition-all duration-200 ${
                !userIsAuthenticated
                  ? "bg-gray-400 cursor-not-allowed"
                  : isCreator
                  ? "bg-gray-400 cursor-not-allowed"
                  : isClosed
                  ? "bg-gray-500 cursor-not-allowed"
                  : signed 
                  ? "bg-green-500 cursor-default" 
                  : loading
                  ? "bg-gray-400 cursor-wait"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-95"
              }`}
              title={isClosed ? "This petition is closed and no longer accepting signatures" : ""}
            >
              {!userIsAuthenticated ? (
                "Login to Sign"
              ) : isCreator ? (
                "Your Petition"
              ) : isClosed ? (
                "Petition Closed"
              ) : loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing...
                </div>
              ) : signed ? (
                "✓ Signed"
              ) : (
                "Sign Petition"
              )}
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Comments Modal */}
    <CommentsModal
      petition={petition}
      isOpen={showCommentsModal}
      onClose={() => setShowCommentsModal(false)}
      onCommentAdded={handleCommentAdded}
    />
    </>
  );
};

export default PetitionCard;
