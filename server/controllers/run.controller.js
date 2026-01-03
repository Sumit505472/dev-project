import generateFile from "../services/file/generateFile.js";
import cleanupFiles from "../services/file/cleanupFiles.js";

import executeCpp from "../services/codeExecution/executecpp.js";
import executeC from "../services/codeExecution/executec.js";
import executeJava from "../services/codeExecution/executejava.js";
import executePython from "../services/codeExecution/executepython.js";

export const runCode = async (req, res) => {
  const { language = "cpp", code, input } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      error: "Code is required",
    });
  }

  let fileDetailsForCleanup = {};

  try {
    const {
      sourceFilePath,
      inputFilePath,
      outputFilePath,
      language: jobLanguage,
      jobId,
      sourceFilename,
      inputFilename,
      outputFilename,
    } = generateFile(language, code, input);

    fileDetailsForCleanup = {
      language: jobLanguage,
      jobId,
      sourceFilename,
      inputFilename,
      outputFilename,
    };

    let output;
    switch (jobLanguage) {
      case "cpp":
        output = await executeCpp(
          sourceFilePath,
          inputFilePath,
          outputFilePath
        );
        break;
      case "c":
        output = await executeC(
          sourceFilePath,
          inputFilePath,
          outputFilePath
        );
        break;
      case "java":
        output = await executeJava(
          sourceFilePath,
          inputFilePath,
          outputFilePath
        );
        break;
      case "python":
        output = await executePython(
          sourceFilePath,
          inputFilePath,
          outputFilePath
        );
        break;
      default:
        return res
          .status(400)
          .json({ success: false, error: "Unsupported language" });
    }

    return res.json({ success: true, output });
  } catch (err) {
    console.error("Error in running code:", err);

    let errorMessage = "An unknown error occurred during execution.";
    let statusCode = 500;

    if (typeof err === "object" && err !== null) {
      if (err.error) {
        errorMessage = err.error;
        statusCode = 400;
      } else if (err.message) {
        errorMessage = err.message;
      }

      if (err.stderr?.trim()) {
        errorMessage += `\nStderr: ${err.stderr.trim()}`;
      }
      if (err.stdout?.trim()) {
        errorMessage += `\nStdout: ${err.stdout.trim()}`;
      }
    }

    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
    });
  } finally {
    await cleanupFiles(fileDetailsForCleanup);
  }
};
