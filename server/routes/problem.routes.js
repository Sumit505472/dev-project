import express from "express";
import {
  addProblem,
  addTestCases,
  deleteProblem,
  getAllProblems,
  getProblemById,
  updateProblem,
} from "../controllers/problem.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";

const router = express.Router();

router.post("/add", authMiddleware, adminMiddleware, addProblem);
router.post("/testcases", authMiddleware, adminMiddleware, addTestCases);
router.get("/", getAllProblems);
router.get("/:id", getProblemById);
router.put("/:id", authMiddleware, adminMiddleware, updateProblem);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProblem);

export default router;
