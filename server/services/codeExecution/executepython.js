import { exec } from "child_process";
import fs from "fs/promises";

const DEFAULT_TIMEOUT_MS = 5000;

const executePython = (sourceFilePath, inputFilePath, outputFilePath) => {
  const cmd = inputFilePath
    ? `python "${sourceFilePath}" < "${inputFilePath}"`
    : `python "${sourceFilePath}"`;

  return new Promise((resolve, reject) => {
    exec(cmd, { timeout: DEFAULT_TIMEOUT_MS }, async (err, stdout, stderr) => {
      if (err) {
        if (err.killed) {
          return reject({ error: "Time Limit Exceeded" });
        }
        return reject({
          error: "Runtime Error",
          details: stderr || err.message,
        });
      }

      await fs.writeFile(outputFilePath, stdout || "");
      resolve(stdout || "");
    });
  });
};

export default executePython;
