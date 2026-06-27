import fs from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";

import Problem from "../models/problem.js";
import Testcase from "../models/testcase.js";
import Submission from "../models/submission.js";

import generateFile from "../services/file/generateFile.js";
import cleanupFiles from "../services/file/cleanupFiles.js";

import executeCpp from "../services/codeExecution/executecpp.js";
import executeC from "../services/codeExecution/executec.js";
import executeJava from "../services/codeExecution/executejava.js";
import executePython from "../services/codeExecution/executepython.js";

import { PATHS } from "../config/path.js";

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

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        error: "Problem not found",
      });
    }

    let testCases = problem.hidden_test_cases?.length
      ? problem.hidden_test_cases
      : [];

    if (testCases.length === 0) {
      testCases = await Testcase.find({ problemId });
    }

    if (testCases.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No test cases configured for this problem",
      });
    }

    let allPassed = true;
    const results = [];

    for (const testCase of testCases) {
      const testInputId = uuid();

      const inputFilename = `${testInputId}.txt`;
      const outputFilename = `${testInputId}.out`;

      const inputFilePath = path.join(PATHS.inputs, inputFilename);
      const outputFilePath = path.join(PATHS.outputs, outputFilename);

      await fs.writeFile(inputFilePath, testCase.input);

      let actualOutput = "";
      let executionError = null;

      try {
        switch (jobLanguage) {
          case "cpp":
            actualOutput = await executeCpp(
              sourceFilePath,
              inputFilePath,
              outputFilePath
            );
            break;
          case "c":
            actualOutput = await executeC(
              sourceFilePath,
              inputFilePath,
              outputFilePath
            );
            break;
          case "java":
            actualOutput = await executeJava(
              sourceFilePath,
              inputFilePath,
              outputFilePath
            );
            break;
          case "python":
            actualOutput = await executePython(
              sourceFilePath,
              inputFilePath,
              outputFilePath
            );
            break;
          default:
            throw new Error("Unsupported language");
        }
      } catch (err) {
        executionError = err;
        allPassed = false;
      }

      // cleanup testcase files immediately
      await fs.unlink(inputFilePath).catch(() => {});
      await fs.unlink(outputFilePath).catch(() => {});

      if (executionError) {
        results.push({
          input: testCase.input,
          expected: testCase.output.trim(),
          actual: "Execution Error",
          passed: false,
        });
      } else {
        const passed =
          actualOutput.trim() === testCase.output.trim();

        if (!passed) allPassed = false;

        results.push({
          input: testCase.input,
          expected: testCase.output.trim(),
          actual: actualOutput.trim(),
          passed,
        });
      }
    }

    const submission = await Submission.create({
      user: req.user._id,
      problem: problemId,
      code,
      language,
      verdict: allPassed ? "Accepted" : "Wrong Answer",
      results,
    });

    return res.status(200).json({
      success: true,
      verdict: submission.verdict,
      results: submission.results,
    });
  } catch (error) {
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
