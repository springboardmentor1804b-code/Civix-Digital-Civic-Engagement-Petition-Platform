import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import VerifiedIcon from '@mui/icons-material/Verified';
import LockIcon from '@mui/icons-material/Lock';
import DescriptionIcon from '@mui/icons-material/Description';
import ArticleIcon from '@mui/icons-material/Article';
import notificationService from '../../services/notificationService';

const NotificationModal = () => {
  const [openNotif, setOpenNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (openNotif) {
      fetchNotifications(1, true);
    }
  }, [openNotif]);

  const fetchNotifications = async (pageNum = 1, isInitial = false) => {
    try {
      setError(null);
      
      if (isInitial) {
        setLoading(true);
        setPage(1);
        setNotifications([]);
      } else {
        setLoadingMore(true);
      }

      const response = await notificationService.getUserNotifications(pageNum, 15);
      
      if (response.success) {
        const newNotifications = response.notifications || [];
        
        if (isInitial) {
          setNotifications(newNotifications);
        } else {
          setNotifications(prev => [...prev, ...newNotifications]);
        }
        
        setUnreadCount(response.unreadCount || 0);
        setHasMore(response.pagination?.page < response.pagination?.pages);
      } else {
        setError(response.error || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
      setError(error.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || loadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    
    if (scrollTop + clientHeight >= scrollHeight * 0.8) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage, false);
    }
  }, [page, loadingMore, hasMore]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const closeNotif = () => {
    setOpenNotif(false);
    setError(null);
    setTimeout(() => {
      setNotifications([]);
      setPage(1);
      setHasMore(true);
    }, 300);
  };

  const handleRefresh = () => {
    fetchNotifications(1, true);
  };

  const getNotificationIcon = (title) => {
    const iconStyle = { fontSize: 20 };
    
    if (title.includes('Approved')) return <CheckCircleIcon sx={{ ...iconStyle, color: '#10b981' }} />;
    if (title.includes('Rejected')) return <CancelIcon sx={{ ...iconStyle, color: '#ef4444' }} />;
    if (title.includes('Response')) return <ChatBubbleIcon sx={{ ...iconStyle, color: '#3b82f6' }} />;
    if (title.includes('Under Review')) return <RemoveRedEyeIcon sx={{ ...iconStyle, color: '#f59e0b' }} />;
    if (title.includes('Verified') && !title.includes('Unverified')) return <VerifiedIcon sx={{ ...iconStyle, color: '#10b981' }} />;
    if (title.includes('Unverified')) return <CancelIcon sx={{ ...iconStyle, color: '#ef4444' }} />;
    if (title.includes('Closed')) return <LockIcon sx={{ ...iconStyle, color: '#6b7280' }} />;
    return <DescriptionIcon sx={{ ...iconStyle, color: '#6b7280' }} />;
  };

  const handleNotificationClick = (notification) => {
    closeNotif();
    if (notification.relatedPetition) {
      navigate('/dashboard/petitions');
    } else if (notification.relatedPoll) {
      navigate('/dashboard/polls');
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={() => setOpenNotif(true)}>
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {openNotif && (
        <>
          <Box
            sx={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 1300,
            }}
            onClick={closeNotif}
          />

          <Box
            sx={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
              width: { xs: '90vw', sm: 540 },
              maxHeight: '80vh',
              bgcolor: '#ffffff',
              borderRadius: 3,
              boxShadow: 24,
              zIndex: 1301,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 3,
                py: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #048affff 100%)',
                color: '#fff',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationsIcon />
                <Typography variant="h6" fontWeight={600}>
                  Notifications
                </Typography>
                {unreadCount > 0 && (
                  <Box
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.3)',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    {unreadCount} new
                  </Box>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  onClick={handleRefresh} 
                  sx={{ 
                    color: '#fff',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                  title="Refresh"
                >
                  <RefreshIcon />
                </IconButton>
                <IconButton 
                  onClick={closeNotif} 
                  sx={{ 
                    color: '#fff',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>

            <Divider />

            {/* Notifications List */}
            <Box
              ref={scrollContainerRef}
              sx={{
                flex: 1,
                overflow: 'auto',
                px: 2,
                py: 2,
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  bgcolor: '#f1f1f1',
                },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: '#888',
                  borderRadius: '3px',
                  '&:hover': {
                    bgcolor: '#555',
                  },
                },
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                </Box>
              ) : error ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                    {error}
                  </Typography>
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </Box>
              ) : notifications.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <TrendingUpIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                  <Typography color="text.secondary" variant="body2">
                    No notifications yet
                  </Typography>
                  <Typography color="text.secondary" variant="caption" sx={{ mt: 1, display: 'block' }}>
                    Official actions will appear here
                  </Typography>
                </Box>
              ) : (
                <>
                  {notifications.map((n, index) => {
                    const petitionTitle = n.relatedPetition?.title;
                    const pollTitle = n.relatedPoll?.title;
                    
                    // ✅ NEW: Extract official response and verification note
                    const officialResponse = n.officialResponse || n.response;
                    const verificationNote = n.verificationNote;
                    
                    return (
                      <Box
                        key={n.id || index}
                        sx={{
                          mb: 1.5,
                          p: 2,
                          borderRadius: 2,
                          bgcolor: n.read ? '#fafafa' : '#eff6ff',
                          border: n.read ? '1px solid #e5e7eb' : '1px solid #bfdbfe',
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: n.read ? '#f5f5f5' : '#dbeafe',
                            transform: 'translateX(4px)',
                            boxShadow: 1,
                          },
                        }}
                        onClick={() => handleNotificationClick(n)}
                      >
                        {/* Header with Icon and Title */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          {getNotificationIcon(n.title)}
                          <Typography
                            variant="body2"
                            fontWeight={n.read ? 500 : 700}
                            color={n.read ? 'text.primary' : '#1e40af'}
                            sx={{ flex: 1 }}
                          >
                            {n.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                            {notificationService.formatTimestamp(n.timestamp)}
                          </Typography>
                        </Box>
                        
                        {/* Petition/Poll Title Badge */}
                        {(petitionTitle || pollTitle) && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                px: 1,
                                py: 0.25,
                                bgcolor: petitionTitle ? 'rgba(59, 130, 246, 0.1)' : 'rgba(147, 51, 234, 0.1)',
                                borderRadius: 1,
                              }}
                            >
                              <ArticleIcon sx={{ fontSize: 12, color: petitionTitle ? '#2563eb' : '#9333ea' }} />
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  color: petitionTitle ? '#2563eb' : '#9333ea',
                                }}
                              >
                                {petitionTitle || pollTitle}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                        
                        {/* Official Info */}
                        {n.officialName && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <BusinessIcon sx={{ fontSize: 12, color: '#6b7280' }} />
                            <Typography
                              variant="caption"
                              sx={{ fontSize: '0.65rem', color: '#6b7280' }}
                            >
                              {n.officialDetails || `${n.officialName} - ${n.officialPosition || 'Official'}`}
                            </Typography>
                          </Box>
                        )}

                        {/* ✅ NEW: Official Response Section */}
                        {officialResponse && officialResponse.trim() && (
                          <Box
                            sx={{
                              mt: 1,
                              p: 1.5,
                              bgcolor: '#f0f9ff',
                              borderLeft: '3px solid #3b82f6',
                              borderRadius: 1,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <ChatBubbleIcon sx={{ fontSize: 14, color: '#3b82f6' }} />
                              <Typography
                                variant="caption"
                                sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#1e40af' }}
                              >
                                Official Response:
                              </Typography>
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                fontSize: '0.75rem',
                                color: '#374151',
                                lineHeight: 1.5,
                                fontStyle: 'italic'
                              }}
                            >
                              "{officialResponse}"
                            </Typography>
                          </Box>
                        )}

                        {/* ✅ NEW: Verification Note Section */}
                        {verificationNote && verificationNote.trim() && (
                          <Box
                            sx={{
                              mt: 1,
                              p: 1.5,
                              bgcolor: n.title.includes('Unverified') ? '#fef2f2' : '#f0fdf4',
                              borderLeft: n.title.includes('Unverified') ? '3px solid #ef4444' : '3px solid #10b981',
                              borderRadius: 1,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              {n.title.includes('Unverified') ? (
                                <CancelIcon sx={{ fontSize: 14, color: '#ef4444' }} />
                              ) : (
                                <VerifiedIcon sx={{ fontSize: 14, color: '#10b981' }} />
                              )}
                              <Typography
                                variant="caption"
                                sx={{ 
                                  fontSize: '0.7rem', 
                                  fontWeight: 600, 
                                  color: n.title.includes('Unverified') ? '#991b1b' : '#065f46'
                                }}
                              >
                                Verification Note:
                              </Typography>
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                fontSize: '0.75rem',
                                color: n.title.includes('Unverified') ? '#7f1d1d' : '#064e3b',
                                lineHeight: 1.5,
                                fontStyle: 'italic'
                              }}
                            >
                              "{verificationNote}"
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    );
                  })}

                  {loadingMore && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    </Box>
                  )}

                  {!hasMore && notifications.length > 0 && (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        You've reached the end
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Box>

            {/* Footer */}
            {notifications.length > 0 && (
              <>
                <Divider />
                <Box
                  sx={{
                    px: 3,
                    py: 1.5,
                    bgcolor: '#fafafa',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {notifications.length} loaded
                  </Typography>
                  {hasMore && (
                    <Typography variant="caption" color="primary" sx={{ fontSize: '0.7rem' }}>
                      Scroll for more
                    </Typography>
                  )}
                </Box>
              </>
            )}
          </Box>
        </>
      )}
    </>
  );
};

export default NotificationModal;
