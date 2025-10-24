import express from "express";
import {
  createPetition,
  getPetitions,
  signPetition,
  getPetitionById,
  updatePetition,
  deletePetition,
  getPetitionsForOfficial,
  updatePetitionStatus,
  getTrendingPetitions, 
} from "../controllers/petitionController.js";
import { createComment, getComments } from "../controllers/commentController.js"; 
import { protect } from "../middleware/authMiddleware.js";
import { isOfficial } from "../middleware/roleMiddleware.js";
import upload from '../middleware/uploadMiddleware.js'; // 💡 NEW: Import the file upload middleware

const router = express.Router();

// --- Petition List & Creation Routes ---
router.route("/trending").get(getTrendingPetitions); 
router.route("/").get(protect, getPetitions);
router.route("/official").get(protect, isOfficial, getPetitionsForOfficial);

// 💡 MODIFIED ROUTE: Apply 'upload.array' middleware to handle file uploads
// 'enclosures' is the expected form field name (max 5 files)
router.route("/create").post(
    protect, 
    upload.array('enclosures', 5), 
    createPetition
);

// --- Comment Routes ---
router.route("/:id/comments")
    .post(protect, createComment) 
    .get(getComments);           

// --- Petition Management Routes ---
router.route("/:id/status").put(protect, isOfficial, updatePetitionStatus);

router
  .route("/:id")
  .get(protect, getPetitionById)
  .put(protect, updatePetition)
  .delete(protect, deletePetition);

router.route("/:id/sign").post(protect, signPetition);

export default router;