import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import DBConnection from "./config/db.js";
import corsOptions from "./config/cors.js";

// routes
import authRoutes from "./routes/auth.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import runRoutes from "./routes/run.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import draftRoutes from "./routes/draft.routes.js";

const app = express();


app.set("trust proxy", 1);
DBConnection();

// middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// health check
app.get("/", (req, res) => {
  res.send("Online Judge Server is running.");
});



// routes
app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/submission", submissionRoutes);
app.use("/api/run", runRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/drafts", draftRoutes);

export default app;
