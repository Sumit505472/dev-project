import mongoose from "mongoose";
import Draft from "../models/draft.js";

const allowedLanguages = new Set(["cpp", "c", "python"]);

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const saveDraft = async (req, res) => {
  try {
    const { problemId, language, code } = req.body;

    if (!problemId || !language || typeof code !== "string") {
      return res.status(400).json({
        success: false,
        error: "problemId, language, and code are required",
      });
    }

    if (!isValidObjectId(problemId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid problemId",
      });
    }

    if (!allowedLanguages.has(language)) {
      return res.status(400).json({
        success: false,
        error: "Unsupported language",
      });
    }

    const draft = await Draft.findOneAndUpdate(
      {
        userId: req.user._id,
        problemId,
        language,
      },
      {
        $set: {
          code,
          updatedAt: new Date(),
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Draft saved",
      draft,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: "Duplicate draft conflict. Please retry.",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Failed to save draft",
    });
  }
};

export const getDraft = async (req, res) => {
  try {
    const { problemId, language } = req.params;

    if (!isValidObjectId(problemId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid problemId",
      });
    }

    if (!allowedLanguages.has(language)) {
      return res.status(400).json({
        success: false,
        error: "Unsupported language",
      });
    }

    const draft = await Draft.findOne({
      userId: req.user._id,
      problemId,
      language,
    }).select("code updatedAt language problemId");

    return res.status(200).json({
      success: true,
      code: draft?.code || "",
      draft: draft || null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to load draft",
    });
  }
};
