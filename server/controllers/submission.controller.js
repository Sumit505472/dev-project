import Submission from "../models/submission.js";

import generateFile from "../services/file/generateFile.js";
import cleanupFiles from "../services/file/cleanupFiles.js";
import judgeSubmission from "../services/submission/judgeSubmission.js";

export const submitCode = async (req, res) => {
  const { code, language, problemId } = req.body;

  if (!code || !language || !problemId) {
    return res.status(400).json({
      success: false,
      error: "All fields are required",
    });
  }

  let baseCleanupInfo = null;

  try {
    const {
      sourceFilePath,
      sourceFilename,
      language: jobLanguage,
    } = generateFile(language, code, null);

    baseCleanupInfo = {
      language: jobLanguage,
      sourceFilename,
    };

    const { verdict, results } = await judgeSubmission({
      problemId,
      language: jobLanguage,
      sourceFilePath,
    });

    const submission = await Submission.create({
      user: req.user._id,
      problem: problemId,
      code,
      language,
      verdict,
      results,
      status: "COMPLETED",
    });

    return res.status(200).json({
      success: true,
      verdict: submission.verdict,
      results: submission.results,
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
  } finally {
    if (baseCleanupInfo?.sourceFilename) {
      await cleanupFiles(baseCleanupInfo);
    }
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
