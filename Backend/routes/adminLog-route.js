import express from 'express';
import {
  createAdminLog,
  getAdminLogs,
  getLogsByUser,
  getLogsByPetition,
  getLogsByPoll,
  getRecentOfficialActions,
  getAllOfficialActions,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteOldLogs
} from '../controllers/adminLogController.js';
import { auth, requireAuth } from '../middleware/auth.js';
import { requireOfficial } from '../middleware/officialAuth.js';

const router = express.Router();

// Public routes
router.get('/official-actions/recent', getRecentOfficialActions);
router.get('/official-actions/all', getAllOfficialActions);

// Protected routes - require authentication
router.use(auth);

// User notifications routes
router.get('/notifications', requireAuth, getUserNotifications);
router.put('/notifications/:id/read', requireAuth, markNotificationAsRead);
router.put('/notifications/mark-all-read', requireAuth, markAllNotificationsAsRead);

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
