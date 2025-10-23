import express from "express";
import {
  createPetition,
  getPetitions,
  signPetition,
  getPetitionById,
  updatePetition,
  deletePetition,
  getPetitionsForOfficial, // 1. Import new controller functions
  updatePetitionStatus,
} from "../controllers/petitionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isOfficial } from "../middleware/roleMiddleware.js"; // 2. Import the new role middleware

const router = express.Router();

// Route for all users to get petitions
router.route("/").get(protect, getPetitions);

// 3. New route for officials to get petitions from their location
router.route("/official").get(protect, isOfficial, getPetitionsForOfficial);

router.route("/create").post(protect, createPetition);

// 4. New route for officials to update a petition's status
router.route("/:id/status").put(protect, isOfficial, updatePetitionStatus);

router
  .route("/:id")
  .get(protect, getPetitionById)
  .put(protect, updatePetition)
  .delete(protect, deletePetition);

router.route("/:id/sign").post(protect, signPetition);

export default router;
