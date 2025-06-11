import express from 'express';
import Submission from '../models/submission.js'; // adjust if needed

const router = express.Router();

// GET /submissions/user/:userId — fetch all submissions by a user
router.get('/submissions/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const submissions = await Submission.find({ user: userId })
      .populate('problem') // populate the problem field to get title
      .sort({ submittedAt: -1 });

    res.status(200).json({ success: true, submissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

export default router;
