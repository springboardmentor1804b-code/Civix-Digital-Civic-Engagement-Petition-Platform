import express from 'express';
import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
  getCommentCount,
  getUserComments,
  likeComment,
  dislikeComment,
  addReply,
  likeReply,
  dislikeReply,
  deleteReply
} from '../controllers/commentController.js';
import { auth, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get user's own comments
router.get('/my-comments', auth, requireAuth, getUserComments);

// Get comments for a petition (public - optional auth)
router.get('/petition/:petitionId', auth, getComments);

// Get comment count for a petition (public)
router.get('/petition/:petitionId/count', getCommentCount);

// Add comment to a petition (requires auth)
router.post('/petition/:petitionId', auth, requireAuth, addComment);

// Update a comment (requires auth)
router.put('/petition/:petitionId/:commentId', auth, requireAuth, updateComment);

// Delete a comment (requires auth)
router.delete('/petition/:petitionId/:commentId', auth, requireAuth, deleteComment);

// Like/Dislike comment
router.post('/petition/:petitionId/:commentId/like', auth, requireAuth, likeComment);
router.post('/petition/:petitionId/:commentId/dislike', auth, requireAuth, dislikeComment);

// Add reply to a comment
router.post('/petition/:petitionId/:commentId/reply', auth, requireAuth, addReply);

// Like/Dislike reply
router.post('/petition/:petitionId/:commentId/reply/:replyId/like', auth, requireAuth, likeReply);
router.post('/petition/:petitionId/:commentId/reply/:replyId/dislike', auth, requireAuth, dislikeReply);

// Delete reply
router.delete('/petition/:petitionId/:commentId/reply/:replyId', auth, requireAuth, deleteReply);

export default router;