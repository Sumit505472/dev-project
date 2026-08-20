import Submission from "../models/submission.js";
import {
  SUBMISSION_JOB_NAME,
  submissionQueue,
} from "../queues/submissionQueue.js";

export const submitCode = async (req, res) => {
  const { code, language, problemId } = req.body;

  if (!code || !language || !problemId) {
    return res.status(400).json({
      success: false,
      error: "All fields are required",
    });
  }

  try {
    const submission = await Submission.create({
      user: req.user._id,
      problem: problemId,
      code,
      language,
      results: [],
      status: "QUEUED",
    });

    try {
      await submissionQueue.add(SUBMISSION_JOB_NAME, {
        submissionId: submission._id.toString(),
      });
    } catch (queueError) {
      try {
        submission.status = "FAILED";
        await submission.save();
      } catch (statusError) {
        console.error("Failed to persist submission failure status:", {
          submissionId: submission._id.toString(),
          error: statusError,
        });
      }
      throw queueError;
    }

    return res.status(200).json({
      success: true,
      submissionId: submission._id.toString(),
      status: submission.status,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    }

    console.error("Submission error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const getUserSubmissions = async (req, res) => {
  try {
    const { id } = req.params;

    const submissions = await Submission.find({ user: id })
      .populate("problem", "title")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      submissions,
    });
  } catch (error) {
    console.error("Error fetching user submissions:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch submissions",
    });
  }
};
