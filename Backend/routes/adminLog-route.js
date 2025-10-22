import express from 'express';
import {
  createAdminLog,
  getAdminLogs,
  getLogsByUser,
  getLogsByPetition,
  getLogsByPoll,
  getRecentActions,
  deleteOldLogs
} from '../controllers/adminLogController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOfficial } from '../middleware/officialAuth.js';

const router = express.Router();

// Public routes (or routes that need basic auth)
router.get('/recent', getRecentActions); // Get recent actions for dashboard

// Protected routes - require authentication
router.use(requireAuth);

// Get all logs (with filters and pagination)
router.get('/', getAdminLogs);

// Get logs by user (petition creator)
router.get('/user/:userId', getLogsByUser);

// Get logs by petition
router.get('/petition/:petitionId', getLogsByPetition);

// Get logs by poll
router.get('/poll/:pollId', getLogsByPoll);

// Official/Admin only routes
router.post('/', requireOfficial, createAdminLog);
router.delete('/cleanup', requireOfficial, deleteOldLogs);

export default router;
