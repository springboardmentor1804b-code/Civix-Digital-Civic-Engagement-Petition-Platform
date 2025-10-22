import express from "express";
import { auth } from "../middleware/auth.js";
import {
  createPoll,
  getPolls,
  getPollById,
  votePoll,
  deletePoll,
  editPoll
} from "../controllers/pollController.js";
import { getVotedPolls } from "../controllers/pollController.js";



const router = express.Router();

router.get("/voted/:userId", getVotedPolls);
// Get all polls (public)
router.get("/", getPolls);

// Get poll by ID (public)
router.get("/:id", getPollById);

// Create a poll (authenticated)
router.post("/", auth, createPoll);

// Vote on a poll (authenticated)
router.post("/:id/vote", auth, votePoll);

// Delete a poll (only creator, authenticated)
router.delete("/:id", auth, deletePoll);

// Edit a poll (only creator, authenticated)
router.put("/:pollId", auth, editPoll);

export default router;