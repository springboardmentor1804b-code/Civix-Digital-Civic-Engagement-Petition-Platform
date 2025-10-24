import express from "express";
import {
  getDashboardStats,
  getOfficialDashboardStats,
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

export default router;
