import { exec } from "child_process";
import path from "path";
import fs from "fs/promises";

const DEFAULT_TIMEOUT_MS = 5000;

const executeC = (sourceFilePath, inputFilePath, outputFilePath) => {
  const dir = path.dirname(sourceFilePath);
  const jobId = path.basename(sourceFilePath).split(".")[0];
  const binaryPath = path.join(dir, `${jobId}.out`);

  const runCommand = inputFilePath
    ? `"${binaryPath}" < "${inputFilePath}"`
    : `"${binaryPath}"`;

  return new Promise((resolve, reject) => {
    exec(`gcc "${sourceFilePath}" -o "${binaryPath}"`, (compileErr, _, compileErrOut) => {
      if (compileErr) {
        return reject({
          error: "Compilation Error",
          details: compileErrOut || compileErr.message,
        });
      }

      exec(runCommand, { timeout: DEFAULT_TIMEOUT_MS }, async (err, stdout, stderr) => {
        await fs.unlink(binaryPath).catch(() => {});

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
  });
};

export default executeC;
