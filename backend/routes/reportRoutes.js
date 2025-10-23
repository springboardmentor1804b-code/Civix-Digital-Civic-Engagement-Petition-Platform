import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getDashboardStats,
  getDetailedReports,
  exportReports
} from "../controllers/reportController.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Get dashboard statistics
router.get("/stats", getDashboardStats);

// Get detailed reports with filters
router.get("/detailed", getDetailedReports);

// Export reports as CSV
router.get("/export", exportReports);

export default router;

