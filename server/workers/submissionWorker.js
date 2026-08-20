import { Worker } from "bullmq";
import dotenv from "dotenv";
import mongoose from "mongoose";

import DBConnection from "../config/db.js";
import { createRedisConnection } from "../config/redis.js";
import { SUBMISSION_QUEUE_NAME } from "../queues/submissionQueue.js";
import Submission from "../models/submission.js";
import generateFile from "../services/file/generateFile.js";
import cleanupFiles from "../services/file/cleanupFiles.js";
import judgeSubmission from "../services/submission/judgeSubmission.js";

dotenv.config();

let worker = null;

const processSubmissionJob = async (job) => {
  console.log("Received submission job:", {
    id: job.id,
    name: job.name,
    data: job.data,
  });

  const { submissionId } = job.data || {};
  if (!submissionId) {
    throw new Error("submissionId is required");
  }

  const submission = await Submission.findById(submissionId);
  if (!submission) {
    throw new Error(`Submission not found: ${submissionId}`);
  }

  submission.status = "RUNNING";
  await submission.save();

  let cleanupInfo = null;
  try {
    const {
      sourceFilePath,
      sourceFilename,
      language: jobLanguage,
    } = generateFile(submission.language, submission.code, null);

    cleanupInfo = {
      language: jobLanguage,
      sourceFilename,
    };

    const result = await judgeSubmission({
      problemId: submission.problem,
      language: jobLanguage,
      sourceFilePath,
    });

    submission.status = "COMPLETED";
    submission.verdict = result.verdict;
    submission.results = result.results;
    await submission.save();

    console.log("Submission judged by worker:", {
      submissionId: submission._id.toString(),
      problemId: submission.problem.toString(),
      language: jobLanguage,
      verdict: result.verdict,
      resultsCount: result.results.length,
    });

    return result;
  } catch (error) {
    try {
      submission.status = "FAILED";
      await submission.save();
    } catch (statusError) {
      console.error("Failed to persist submission failure status:", {
        submissionId,
        error: statusError,
      });
    }
    console.error("Submission worker processing error:", {
      submissionId,
      error,
    });
    throw error;
  } finally {
    if (cleanupInfo) {
      await cleanupFiles(cleanupInfo);
    }
  }
};

const startWorker = async () => {
  await DBConnection();

  worker = new Worker(
    SUBMISSION_QUEUE_NAME,
    processSubmissionJob,
    {
      connection: createRedisConnection(),
    }
  );

  worker.on("completed", (job, result) => {
    console.log("Submission job completed:", {
      id: job.id,
      name: job.name,
      result,
    });
  });

  worker.on("failed", (job, error) => {
    console.error("Submission job failed:", {
      id: job?.id,
      name: job?.name,
      error: error.message,
    });
  });

  worker.on("error", (error) => {
    console.error("Submission worker error:", error);
  });

  console.log(`Submission worker listening on queue: ${SUBMISSION_QUEUE_NAME}`);
};

const shutdown = async (signal) => {
  console.log(`Submission worker shutting down after ${signal}`);
  if (worker) {
    await worker.close();
  }
  await mongoose.disconnect();
  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startWorker().catch((error) => {
  console.error("Failed to start submission worker:", error);
  process.exit(1);
});
