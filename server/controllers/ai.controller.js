import aiCodeReview from "../services/ai/aiCodeReview.js";

export const reviewCode = async (req, res) => {
  const { code } = req.body;

  if (!code || typeof code !== "string" || code.trim() === "") {
    return res.status(400).json({
      success: false,
      error: "Valid code is required",
    });
  }

  try {
    const review = await aiCodeReview(code);

    res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    console.error("AI review error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
