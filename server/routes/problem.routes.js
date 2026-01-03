import express from "express";
import {
  addProblem,
  addTestCases,
  getAllProblems,
  getProblemById,
} from "../controllers/problem.controller.js";

const router = express.Router();

router.post("/add", addProblem);
router.post("/testcases", addTestCases);
router.get("/", getAllProblems);
router.get("/:id", getProblemById);

export default router;
