import express from "express";
import { signPetition, getSignedPetitionsByUser } from "../controllers/signatureController.js";

const router = express.Router();

router.post("/:petitionId/sign", signPetition);
router.get("/user/:userId", getSignedPetitionsByUser);

export default router;
