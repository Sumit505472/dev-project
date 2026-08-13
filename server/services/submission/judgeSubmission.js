import fs from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";

import Problem from "../../models/problem.js";
import Testcase from "../../models/testcase.js";

import executeCpp from "../codeExecution/executecpp.js";
import executeC from "../codeExecution/executec.js";
import executeJava from "../codeExecution/executejava.js";
import executePython from "../codeExecution/executepython.js";

import { PATHS } from "../../config/path.js";

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const executeForLanguage = async ({
  language,
  sourceFilePath,
  inputFilePath,
  outputFilePath,
}) => {
  switch (language) {
    case "cpp":
      return executeCpp(sourceFilePath, inputFilePath, outputFilePath);
    case "c":
      return executeC(sourceFilePath, inputFilePath, outputFilePath);
    case "java":
      return executeJava(sourceFilePath, inputFilePath, outputFilePath);
    case "python":
      return executePython(sourceFilePath, inputFilePath, outputFilePath);
    default:
      throw new Error("Unsupported language");
  }
};

const judgeSubmission = async ({ problemId, language, sourceFilePath }) => {
  const problem = await Problem.findById(problemId);
  if (!problem) {
    throw createHttpError(404, "Problem not found");
  }

  let testCases = problem.hidden_test_cases?.length
    ? problem.hidden_test_cases
    : [];

  if (testCases.length === 0) {
    testCases = await Testcase.find({ problemId });
  }

  if (testCases.length === 0) {
    throw createHttpError(400, "No test cases configured for this problem");
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
      actualOutput = await executeForLanguage({
        language,
        sourceFilePath,
        inputFilePath,
        outputFilePath,
      });
    } catch (err) {
      executionError = err;
      allPassed = false;
    }

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
      const passed = actualOutput.trim() === testCase.output.trim();

      if (!passed) allPassed = false;

      results.push({
        input: testCase.input,
        expected: testCase.output.trim(),
        actual: actualOutput.trim(),
        passed,
      });
    }
  }

  return {
    verdict: allPassed ? "Accepted" : "Wrong Answer",
    results,
  };
};

export default judgeSubmission;
