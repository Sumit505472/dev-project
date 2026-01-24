import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import { PATHS } from "../../config/path.js";

// ensure required directories exist
[PATHS.codes, PATHS.inputs, PATHS.outputs].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const generateFile = (language, code, input) => {
  const jobId = uuid();

  const extMap = {
    cpp: "cpp",
    c: "c",
    python: "py",
    java: "java",
  };

  const sourceFilename =
    language === "java" ? "Main.java" : `${jobId}.${extMap[language]}`;

  const sourceFilePath = path.join(PATHS.codes, sourceFilename);
  fs.writeFileSync(sourceFilePath, code);

  let inputFilename = null;
  let inputFilePath = null;

  if (typeof input === "string" && input.trim() !== "") {
    inputFilename = `${jobId}.txt`;
    inputFilePath = path.join(PATHS.inputs, inputFilename);
    fs.writeFileSync(inputFilePath, input);
  }

  const outputFilename = `${jobId}.out`;
  const outputFilePath = path.join(PATHS.outputs, outputFilename);

  return {
    jobId,
    language,
    sourceFilename,
    sourceFilePath,
    inputFilename,
    inputFilePath,
    outputFilename,
    outputFilePath,
  };
};

export default generateFile;
