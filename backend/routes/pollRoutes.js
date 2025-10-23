import express from "express";
import {
  createPoll,
  getPolls,
  voteOnPoll,
  updatePoll,
  deletePoll,
  getPollById, // 1. Import the missing function
} from "../controllers/pollController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getPolls);
router.route("/create").post(protect, createPoll);
router.route("/:pollId/vote").post(protect, voteOnPoll);

// 2. Update this route to include the GET method
router
  .route("/:id")
  .get(protect, getPollById) // This line was missing
  .put(protect, updatePoll)
  .delete(protect, deletePoll);

export default router;
