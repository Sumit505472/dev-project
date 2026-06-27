import express from "express";
import { getDraft, saveDraft } from "../controllers/draft.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/save", authMiddleware, saveDraft);
router.get("/:problemId/:language", authMiddleware, getDraft);

export default router;
