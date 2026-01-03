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

export const submitCode = async (req, res) => {
  const { code, language, problemId } = req.body;

  if (!code || !language || !problemId) {
    return res.status(400).json({
      success: false,
      error: "All fields are required",
    });
  }

  let fileDetailsForCleanup = {};

  try {
    const {
      sourceFilePath,
      language: jobLanguage,
      jobId,
      sourceFilename,
    } = generateFile(language, code, null);

    fileDetailsForCleanup = { jobId, sourceFilename, language: jobLanguage };

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        error: "Problem not found",
      });
    }

    const testCases = await Testcase.find({ problemId });

    let allPassed = true;
    const results = [];

    for (const testCase of testCases) {
      const testInputId = uuid();
      const inputFilename = `${jobId}_${testInputId}.txt`;
      const inputFilePath = path.join("/app", "inputs", inputFilename);

      await fs.writeFile(inputFilePath, testCase.input);

      const outputFilename = `${jobId}_${testInputId}.out`;
      const outputFilePath = path.join(
        "/app",
        "execute",
        "outputs",
        outputFilename
      );

      fileDetailsForCleanup.inputFilename = inputFilename;
      fileDetailsForCleanup.outputFilename = outputFilename;

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
      } finally {
        await fs.unlink(inputFilePath).catch(() => {});
      }

      if (executionError) {
        results.push({
          input: testCase.input,
          expected: testCase.output.trim(),
          actual: "Execution Error",
          passed: false,
          error: executionError.message,
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
    await cleanupFiles(fileDetailsForCleanup);
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

