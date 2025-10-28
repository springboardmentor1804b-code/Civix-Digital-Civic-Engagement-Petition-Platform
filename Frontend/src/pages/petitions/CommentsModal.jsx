import React, { useState, useEffect, useRef } from 'react';
import { Close, Send, Delete, Person, ThumbUp, ThumbDown, Reply as ReplyIcon } from '@mui/icons-material';
import petitionService from '../../services/petitionService';
import { getCurrentUserId, isAuthenticated } from '../../utils/auth';

const CommentsModal = ({ petition, isOpen, onClose, onCommentAdded }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState({});
  const commentsEndRef = useRef(null);
  const textareaRef = useRef(null);
  const replyInputRef = useRef(null);
  
  const currentUserId = getCurrentUserId();
  const userIsAuthenticated = isAuthenticated();
  const isPetitionCreator = petition?.creator?._id === currentUserId;

  // Fetch comments when modal opens
  useEffect(() => {
    if (isOpen && petition) {
      fetchComments();
    }
  }, [isOpen, petition]);

  // Auto-scroll to bottom when new comments are added
  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Focus reply input when replying
  useEffect(() => {
    if (replyingTo && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [replyingTo]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await petitionService.getComments(petition._id);
      if (response.success) {
        setComments(response.comments || []);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!userIsAuthenticated) {
      setError('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (newComment.length > 500) {
      setError('Comment must be less than 500 characters');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const response = await petitionService.addComment(petition._id, newComment.trim());
      
      if (response.success) {
        setComments(prev => [response.comment, ...prev]);
        setNewComment('');
        
        // Notify parent component
        if (onCommentAdded) {
          onCommentAdded(response.commentsCount);
        }
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!userIsAuthenticated) {
      setError('Please login to like comments');
      return;
    }

    try {
      const response = await petitionService.likeComment(petition._id, commentId);
      if (response.success) {
        setComments(prev => prev.map(c => 
          c._id === commentId ? response.comment : c
        ));
      }
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  const handleDislikeComment = async (commentId) => {
    if (!userIsAuthenticated) {
      setError('Please login to dislike comments');
      return;
    }

    try {
      const response = await petitionService.dislikeComment(petition._id, commentId);
      if (response.success) {
        setComments(prev => prev.map(c => 
          c._id === commentId ? response.comment : c
        ));
      }
    } catch (err) {
      console.error('Error disliking comment:', err);
    }
  };

  const handleSubmitReply = async (commentId) => {
    if (!userIsAuthenticated) {
      setError('Please login to reply');
      return;
    }

    if (!replyText.trim()) {
      setError('Reply cannot be empty');
      return;
    }

    if (replyText.length > 500) {
      setError('Reply must be less than 500 characters');
      return;
    }

    try {
      const response = await petitionService.addReply(petition._id, commentId, replyText.trim());
      
      if (response.success) {
        setComments(prev => prev.map(c => {
          if (c._id === commentId) {
            return {
              ...c,
              replies: [...(c.replies || []), response.reply],
              replyCount: response.replyCount
            };
          }
          return c;
        }));
        
        setReplyText('');
        setReplyingTo(null);
        setExpandedReplies(prev => ({ ...prev, [commentId]: true }));
      }
    } catch (err) {
      console.error('Error adding reply:', err);
      setError(err.response?.data?.message || 'Failed to add reply');
    }
  };

  const handleLikeReply = async (commentId, replyId) => {
    if (!userIsAuthenticated) {
      setError('Please login to like replies');
      return;
    }

    try {
      const response = await petitionService.likeReply(petition._id, commentId, replyId);
      if (response.success) {
        setComments(prev => prev.map(c => {
          if (c._id === commentId) {
            return {
              ...c,
              replies: c.replies.map(r => 
                r._id === replyId ? response.reply : r
              )
            };
          }
          return c;
        }));
      }
    } catch (err) {
      console.error('Error liking reply:', err);
    }
  };

  const handleDislikeReply = async (commentId, replyId) => {
    if (!userIsAuthenticated) {
      setError('Please login to dislike replies');
      return;
    }

    try {
      const response = await petitionService.dislikeReply(petition._id, commentId, replyId);
      if (response.success) {
        setComments(prev => prev.map(c => {
          if (c._id === commentId) {
            return {
              ...c,
              replies: c.replies.map(r => 
                r._id === replyId ? response.reply : r
              )
            };
          }
          return c;
        }));
      }
    } catch (err) {
      console.error('Error disliking reply:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await petitionService.deleteComment(petition._id, commentId);
      
      if (response.success) {
        setComments(prev => prev.filter(c => c._id !== commentId));
        
        // Notify parent component
        if (onCommentAdded) {
          onCommentAdded(response.commentsCount);
        }
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment');
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) {
      return;
    }

    try {
      const response = await petitionService.deleteReply(petition._id, commentId, replyId);
      
      if (response.success) {
        setComments(prev => prev.map(c => {
          if (c._id === commentId) {
            return {
              ...c,
              replies: c.replies.filter(r => r._id !== replyId),
              replyCount: response.replyCount
            };
          }
          return c;
        }));
      }
    } catch (err) {
      console.error('Error deleting reply:', err);
      setError('Failed to delete reply');
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const getRelativeTime = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Comments</h3>
            <p className="text-sm text-gray-600 mt-1">
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Close className="text-gray-600" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(90vh - 250px)' }}>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-5xl mb-3">💬</div>
              <p className="text-gray-600 font-medium mb-1">No comments yet</p>
              <p className="text-gray-500 text-sm">Be the first to share your thoughts!</p>
            </div>
          ) : (
            <>
              {comments.map((comment) => {
                const isOwnComment = comment.user?._id === currentUserId;
                const canDelete = isOwnComment || isPetitionCreator;
                const isExpanded = expandedReplies[comment._id];

                return (
                  <div key={comment._id} className="border border-gray-200 rounded-lg p-4">
                    {/* Comment */}
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        isOwnComment ? 'bg-blue-500' : 'bg-gray-400'
                      }`}>
                        <Person className="text-white" style={{ fontSize: '20px' }} />
                      </div>

                      {/* Comment Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 text-sm truncate">
                            {comment.user?.name || 'Anonymous'}
                          </span>
                          {isOwnComment && (
                            <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                              You
                            </span>
                          )}
                          {comment.user?._id === petition.creator?._id && (
                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                              Creator
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {getRelativeTime(comment.createdAt)}
                          </span>
                        </div>
                        
                        <p className="text-gray-800 text-sm leading-relaxed break-words mb-2">
                          {comment.text}
                        </p>

                        {/* Comment Actions */}
                        <div className="flex items-center gap-4">
                          {/* Like */}
                          <button
                            onClick={() => handleLikeComment(comment._id)}
                            disabled={!userIsAuthenticated}
                            className={`flex items-center gap-1 text-sm transition-colors ${
                              comment.userHasLiked 
                                ? 'text-blue-600' 
                                : 'text-gray-500 hover:text-blue-600'
                            } disabled:cursor-not-allowed disabled:opacity-50`}
                          >
                            <ThumbUp style={{ fontSize: '16px' }} />
                            <span>{comment.likes?.length || 0}</span>
                          </button>

                          {/* Dislike */}
                          <button
                            onClick={() => handleDislikeComment(comment._id)}
                            disabled={!userIsAuthenticated}
                            className={`flex items-center gap-1 text-sm transition-colors ${
                              comment.userHasDisliked 
                                ? 'text-red-600' 
                                : 'text-gray-500 hover:text-red-600'
                            } disabled:cursor-not-allowed disabled:opacity-50`}
                          >
                            <ThumbDown style={{ fontSize: '16px' }} />
                            <span>{comment.dislikes?.length || 0}</span>
                          </button>

                          {/* Reply */}
                          <button
                            onClick={() => {
                              if (!userIsAuthenticated) {
                                setError('Please login to reply');
                                return;
                              }
                              setReplyingTo(comment._id);
                            }}
                            disabled={!userIsAuthenticated}
                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <ReplyIcon style={{ fontSize: '16px' }} />
                            <span>Reply</span>
                          </button>

                          {/* Delete */}
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
                            >
                              <Delete style={{ fontSize: '16px' }} />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>

                        {/* Reply Input */}
                        {replyingTo === comment._id && (
                          <div className="mt-3 flex gap-2">
                            <input
                              ref={replyInputRef}
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write a reply..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              maxLength="500"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSubmitReply(comment._id);
                                }
                              }}
                            />
                            <button
                              onClick={() => handleSubmitReply(comment._id)}
                              disabled={!replyText.trim()}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm transition-colors"
                            >
                              <Send style={{ fontSize: '18px' }} />
                            </button>
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3">
                            <button
                              onClick={() => toggleReplies(comment._id)}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-2"
                            >
                              {isExpanded ? '▼' : '▶'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                            </button>

                            {isExpanded && (
                              <div className="space-y-3 ml-4 pl-4 border-l-2 border-gray-200">
                                {comment.replies.map((reply) => {
                                  const isOwnReply = reply.user?._id === currentUserId;
                                  const canDeleteReply = isOwnReply || isOwnComment || isPetitionCreator;

                                  return (
                                    <div key={reply._id} className="flex items-start gap-2">
                                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                        isOwnReply ? 'bg-blue-500' : 'bg-gray-400'
                                      }`}>
                                        <Person className="text-white" style={{ fontSize: '16px' }} />
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-semibold text-gray-900 text-xs">
                                            {reply.user?.name || 'Anonymous'}
                                          </span>
                                          {isOwnReply && (
                                            <span className="px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                                              You
                                            </span>
                                          )}
                                          <span className="text-xs text-gray-500">
                                            {getRelativeTime(reply.createdAt)}
                                          </span>
                                        </div>
                                        
                                        <p className="text-gray-800 text-xs leading-relaxed break-words mb-1">
                                          {reply.text}
                                        </p>

                                        <div className="flex items-center gap-3">
                                          <button
                                            onClick={() => handleLikeReply(comment._id, reply._id)}
                                            disabled={!userIsAuthenticated}
                                            className={`flex items-center gap-1 text-xs transition-colors ${
                                              reply.userHasLiked 
                                                ? 'text-blue-600' 
                                                : 'text-gray-500 hover:text-blue-600'
                                            } disabled:cursor-not-allowed disabled:opacity-50`}
                                          >
                                            <ThumbUp style={{ fontSize: '14px' }} />
                                            <span>{reply.likes?.length || 0}</span>
                                          </button>

                                          <button
                                            onClick={() => handleDislikeReply(comment._id, reply._id)}
                                            disabled={!userIsAuthenticated}
                                            className={`flex items-center gap-1 text-xs transition-colors ${
                                              reply.userHasDisliked 
                                                ? 'text-red-600' 
                                                : 'text-gray-500 hover:text-red-600'
                                            } disabled:cursor-not-allowed disabled:opacity-50`}
                                          >
                                            <ThumbDown style={{ fontSize: '14px' }} />
                                            <span>{reply.dislikes?.length || 0}</span>
                                          </button>

                                          {canDeleteReply && (
                                            <button
                                              onClick={() => handleDeleteReply(comment._id, reply._id)}
                                              className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                                            >
                                              Delete
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={commentsEndRef} />
            </>
          )}
        </div>

        {/* Comment Input */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmitComment} className="flex gap-2">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value);
                setError('');
              }}
              placeholder={userIsAuthenticated ? "Share your thoughts..." : "Login to comment"}
              disabled={!userIsAuthenticated || submitting}
              className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
              rows="3"
              maxLength="500"
            />
            
            <button
              type="submit"
              disabled={!userIsAuthenticated || !newComment.trim() || submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 self-end"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send style={{ fontSize: '18px' }} />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </form>

          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
            <span>{newComment.length}/500 characters</span>
            {!userIsAuthenticated && (
              <span className="text-red-500">Please login to comment</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;