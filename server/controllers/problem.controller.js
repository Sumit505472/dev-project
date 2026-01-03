import Problem from "../models/problem.js";
import Testcase from "../models/testcase.js";

export const addProblem = async (req, res) => {
  try {
    const question = req.body;
    const newProblem = new Problem(question);
    await newProblem.save();

    res.status(200).json({
      success: true,
      message: "Problem added successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const addTestCases = async (req, res) => {
  try {
    await Testcase.insertMany(req.body);

    res.status(200).json({
      success: true,
      message: "All test cases saved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find({});
    res.status(200).json({
      success: true,
      problems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }
    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
