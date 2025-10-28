import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as feedbackController from '../controllers/feedbackController.js';

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }
};

// Add a test route to verify the router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Feedback routes are working!' });
});

// User routes
router.post('/', requireAuth, feedbackController.submitFeedback);
router.get('/my', requireAuth, feedbackController.getUserFeedback);
router.delete('/:id', requireAuth, feedbackController.deleteFeedback);

// Admin routes - require both authentication AND admin role
router.get('/all', requireAuth, isAdmin, feedbackController.getAllFeedback);
router.post('/:id/respond', requireAuth, isAdmin, feedbackController.respondToFeedback);
router.put('/:id/status', requireAuth, isAdmin, feedbackController.updateFeedbackStatus);

export default router;