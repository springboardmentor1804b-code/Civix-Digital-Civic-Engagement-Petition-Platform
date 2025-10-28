import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getUserSettings,
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAvatar,
} from "../controllers/settingsController.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get user settings
router.get("/", getUserSettings);

// Update profile
router.put("/profile", updateProfile);

// Change password
router.put("/password", changePassword);

// Avatar management
router.post("/avatar", uploadAvatar);
router.delete("/avatar", deleteAvatar);

export default router;