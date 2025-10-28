import express from "express";
import { register, login, getCurrentUser , logout, createOfficial } from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
// Protected routes - BOTH endpoints for compatibility
router.get("/profile", authMiddleware, getCurrentUser);
router.get("/me", authMiddleware, getCurrentUser);
router.post("/logout", logout);
router.post("/create-official", createOfficial); // Admin route

export default router;
