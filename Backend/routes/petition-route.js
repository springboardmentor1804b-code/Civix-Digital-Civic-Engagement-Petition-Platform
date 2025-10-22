import express from "express";
import {
  createPetition,
  getAllPetitions,
  getPetitions,
  getPetitionById,
  updatePetition,
  deletePetition,
  signPetition,
  getPetitionSignatures,
  getOfficialAnalytics,
  updatePetitionStatus,
  verifyPetition,
  addOfficialResponse,
  getPetitionsForReview,
  getOfficialResponses
} from "../controllers/petitionController.js";
import { auth, requireAuth } from "../middleware/auth.js";

const router = express.Router();

// IMPORTANT: Specific routes MUST come BEFORE parameterized routes
// Official routes (must be first)
router.get("/analytics", auth, getOfficialAnalytics);
router.get("/review/list", auth, requireAuth, getPetitionsForReview);

// Public routes (with optional auth)
router.get("/", auth, getAllPetitions);

// Protected routes (require auth) - FIXED: Added auth middleware before requireAuth
router.post("/", auth, requireAuth, createPetition);
router.post("/:id/sign", auth, requireAuth, signPetition); // FIXED: Added auth middleware

// Individual petition routes (must come after /analytics and other specific routes)
router.get("/:id", auth, getPetitionById);
router.get("/:id/signatures", auth, getPetitionSignatures);
router.put("/:id", auth, requireAuth, updatePetition);
router.delete("/:id", auth, requireAuth, deletePetition);

// Official routes (require auth and official role)
router.get("/:petitionId/responses", auth, getOfficialResponses);
router.put("/:id/status", auth, requireAuth, updatePetitionStatus);
router.put("/:id/verify", auth, requireAuth, verifyPetition);
router.post("/:petitionId/response", auth, requireAuth, addOfficialResponse);

export default router;
