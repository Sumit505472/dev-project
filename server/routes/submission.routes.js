import express from "express";
import {
  submitCode,
  getUserSubmissions,
} from "../controllers/submission.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, submitCode);

// fetch submissions of a user
router.get("/user/:id", authMiddleware, getUserSubmissions);

export default router;
