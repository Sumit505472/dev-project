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

  let fileDetailsForCleanup = null;

  try {
    const {
      sourceFilePath,
      inputFilePath,
      outputFilePath,
      language: jobLanguage,
      sourceFilename,
      inputFilename,
      outputFilename,
    } = generateFile(language, code, input);

    fileDetailsForCleanup = {
      language: jobLanguage,
      sourceFilename,
      inputFilename,
      outputFilename,
    };

    let output;
    switch (jobLanguage) {
      case "cpp":
        output = await executeCpp(sourceFilePath, inputFilePath, outputFilePath);
        break;
      case "c":
        output = await executeC(sourceFilePath, inputFilePath, outputFilePath);
        break;
      case "java":
        output = await executeJava(sourceFilePath, inputFilePath, outputFilePath);
        break;
      case "python":
        output = await executePython(sourceFilePath, inputFilePath, outputFilePath);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: "Unsupported language",
        });
    }

    return res.json({ success: true, output });
  } catch (err) {
    console.error("Error in running code:", err);

    let errorMessage = "Execution failed.";

    if (err?.error) errorMessage = err.error;
    else if (err?.details) errorMessage = err.details;
    else if (err?.message) errorMessage = err.message;

    // IMPORTANT: return 200 so frontend treats it as judge result
    return res.json({
      success: false,
      error: errorMessage,
    });
  } finally {
    if (fileDetailsForCleanup?.sourceFilename) {
      await cleanupFiles(fileDetailsForCleanup);
    }
  }
};
