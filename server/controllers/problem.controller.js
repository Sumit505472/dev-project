import Problem from "../models/problem.js";
import Testcase from "../models/testcase.js";

const slugify = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeTags = (tags) => {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  }

  return [];
};

const normalizeExamples = (examples = []) =>
  examples.map((example) => ({
    input: String(example.input || "").trim(),
    output: String(example.output || "").trim(),
    explanation: String(example.explanation || "").trim(),
  }));

const parseHiddenTestCasesText = (value = "") => {
  const errors = {};
  const text = String(value || "").trim();

  if (!text) {
    return { testCases: [], errors: { hidden_test_cases_text: "At least one hidden test case is required" } };
  }

  const blocks = text
    .split(/^\s*===CASE===\s*$/gim)
    .map((block) => block.trim())
    .filter(Boolean);

  const testCases = blocks.map((block, index) => {
    const inputMatch = block.match(/Input:\s*([\s\S]*?)(?=\n\s*Output:\s*|$)/i);
    const outputMatch = block.match(/Output:\s*([\s\S]*)$/i);
    const input = inputMatch?.[1]?.trim() || "";
    const output = outputMatch?.[1]?.trim() || "";

    if (!/^\s*Input:/im.test(block)) {
      errors[`hidden_test_cases.${index}.input`] = `Case ${index + 1} is missing an Input: label`;
    } else if (!input) {
      errors[`hidden_test_cases.${index}.input`] = `Case ${index + 1} input is required`;
    }

    if (!/^\s*Output:/im.test(block)) {
      errors[`hidden_test_cases.${index}.output`] = `Case ${index + 1} is missing an Output: label`;
    } else if (!output) {
      errors[`hidden_test_cases.${index}.output`] = `Case ${index + 1} output is required`;
    }

    return { input, output };
  });

  if (testCases.length === 0) {
    errors.hidden_test_cases_text = "At least one hidden test case is required";
  }

  return { testCases, errors };
};

const normalizeHiddenTestCases = (testCases = []) =>
  testCases.map((testCase) => ({
    input: String(testCase.input || "").trim(),
    output: String(testCase.output || "").trim(),
  }));

const validateProblemPayload = (body) => {
  const errors = {};

  const requiredFields = [
    "title",
    "difficulty",
    "description",
    "input_format",
    "output_format",
    "constraints",
  ];

  requiredFields.forEach((field) => {
    if (!String(body[field] || "").trim()) {
      errors[field] = "This field is required";
    }
  });

  if (!["Easy", "Medium", "Hard"].includes(body.difficulty)) {
    errors.difficulty = "Difficulty must be Easy, Medium, or Hard";
  }

  const examples = normalizeExamples(body.examples);
  const parsedHiddenTestCases = typeof body.hidden_test_cases_text === "string"
    ? parseHiddenTestCasesText(body.hidden_test_cases_text)
    : null;
  const hiddenTestCases = parsedHiddenTestCases
    ? parsedHiddenTestCases.testCases
    : normalizeHiddenTestCases(body.hidden_test_cases);

  if (parsedHiddenTestCases) {
    Object.assign(errors, parsedHiddenTestCases.errors);
  }

  if (examples.length === 0) {
    errors.examples = "At least one example is required";
  }

  examples.forEach((example, index) => {
    if (!example.input) errors[`examples.${index}.input`] = "Example input is required";
    if (!example.output) errors[`examples.${index}.output`] = "Example output is required";
  });

  if (hiddenTestCases.length === 0) {
    errors.hidden_test_cases = "At least one hidden test case is required";
  }

  hiddenTestCases.forEach((testCase, index) => {
    if (!testCase.input) errors[`hidden_test_cases.${index}.input`] = "Hidden test case input is required";
    if (!testCase.output) errors[`hidden_test_cases.${index}.output`] = "Hidden test case output is required";
  });

  const timeLimit = Number(body.time_limit || 1);
  const memoryLimit = Number(body.memory_limit || 256);

  if (!Number.isFinite(timeLimit) || timeLimit < 1) {
    errors.time_limit = "Time limit must be at least 1 second";
  }

  if (!Number.isFinite(memoryLimit) || memoryLimit < 1) {
    errors.memory_limit = "Memory limit must be at least 1 MB";
  }

  return {
    errors,
    normalized: {
      title: String(body.title || "").trim(),
      slug: slugify(body.slug || body.title || ""),
      difficulty: body.difficulty,
      description: String(body.description || "").trim(),
      input_format: String(body.input_format || "").trim(),
      output_format: String(body.output_format || "").trim(),
      constraints: String(body.constraints || "").trim(),
      tags: normalizeTags(body.tags),
      examples,
      hidden_test_cases: hiddenTestCases,
      time_limit: timeLimit,
      memory_limit: memoryLimit,
    },
  };
};

const sendValidationErrors = (res, errors) =>
  res.status(400).json({
    success: false,
    message: "Validation failed",
    errors,
  });

export const addProblem = async (req, res) => {
  try {
    const { errors, normalized } = validateProblemPayload(req.body);

    if (Object.keys(errors).length > 0) {
      return sendValidationErrors(res, errors);
    }

    const existingProblem = await Problem.findOne({ slug: normalized.slug });
    if (existingProblem) {
      return sendValidationErrors(res, { slug: "Slug already exists" });
    }

    const problem = await Problem.create(normalized);

    return res.status(201).json({
      success: true,
      message: "Problem added successfully",
      problem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const updateProblem = async (req, res) => {
  try {
    const { errors, normalized } = validateProblemPayload(req.body);

    if (Object.keys(errors).length > 0) {
      return sendValidationErrors(res, errors);
    }

    const existingProblem = await Problem.findOne({
      slug: normalized.slug,
      _id: { $ne: req.params.id },
    });

    if (existingProblem) {
      return sendValidationErrors(res, { slug: "Slug already exists" });
    }

    const problem = await Problem.findByIdAndUpdate(req.params.id, normalized, {
      new: true,
      runValidators: true,
    });

    if (!problem) {
      return res.status(404).json({ success: false, error: "Problem not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Problem updated successfully",
      problem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);

    if (!problem) {
      return res.status(404).json({ success: false, error: "Problem not found" });
    }

    await Testcase.deleteMany({ problemId: req.params.id });

    return res.status(200).json({
      success: true,
      message: "Problem deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
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
    const { search = "", difficulty = "" } = req.query;
    const query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (["Easy", "Medium", "Hard"].includes(difficulty)) {
      query.difficulty = difficulty;
    }

    const problems = await Problem.find(query).sort({ createdAt: -1 });

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
      return res.status(404).json({ success: false, error: "Problem not found" });
    }
    res.status(200).json({ success: true, problem });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};
