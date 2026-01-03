import express from "express";
import { runCode } from "../controllers/run.controller.js";

const router = express.Router();

router.post("/", runCode);

export default router;
