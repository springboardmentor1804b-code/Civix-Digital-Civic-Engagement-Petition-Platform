import express from "express";
import {
  getDashboardStats,
  getOfficialDashboardStats,
  getEngagementTrends,
  getEngagementTrendsFallback,
} from "../controllers/dashboardController.js"; // 1. Import new function
import { protect } from "../middleware/authMiddleware.js";
import { isOfficial } from "../middleware/roleMiddleware.js"; // 2. Import role middleware

const router = express.Router();

// Debug endpoint to test authentication
router.get("/debug", (req, res) => {
  res.json({
    message: "Dashboard debug endpoint",
    cookies: req.cookies,
    headers: req.headers,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Route for regular citizens
router.route("/stats").get(protect, getDashboardStats);

// 3. Add the new, secure route for officials
router
  .route("/official-stats")
  .get(protect, isOfficial, getOfficialDashboardStats);

// Route for engagement trends (works for both citizens and officials)
router
  .route("/engagement-trends")
  .get(protect, getEngagementTrends);

// Debug route to test if the endpoint is accessible
router.get("/engagement-trends-debug", (req, res) => {
  res.json({
    message: "Engagement trends endpoint is accessible",
    timestamp: new Date().toISOString(),
    user: req.user ? req.user.id : "No user"
  });
});

// Simple test route without authentication
router.get("/test", (req, res) => {
  res.json({
    message: "Dashboard routes are working",
    timestamp: new Date().toISOString()
  });
});

// Fallback engagement trends route (no auth required for testing)
router.get("/engagement-trends-fallback", getEngagementTrendsFallback);

export default router;
