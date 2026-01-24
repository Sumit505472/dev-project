import { exec } from "child_process";
import path from "path";
import fs from "fs/promises";

const DEFAULT_TIMEOUT_MS = 5000;

const executeJava = async (sourceFilePath, inputFilePath, outputFilePath) => {
  const className = "Main";
  const dirCodes = path.dirname(sourceFilePath);

  const runCommand = inputFilePath
    ? `java -cp "${dirCodes}" ${className} < "${inputFilePath}"`
    : `java -cp "${dirCodes}" ${className}`;

  return new Promise((resolve, reject) => {
    // Compile
    exec(`javac "${sourceFilePath}"`, (compileErr, _, compileErrOut) => {
      if (compileErr) {
        return reject({
          error: "Compilation Error",
          details: compileErrOut || compileErr.message,
        });
      }

      // Execute
      exec(
        runCommand,
        { timeout: DEFAULT_TIMEOUT_MS },
        async (runErr, stdout, stderr) => {
          if (runErr) {
            if (runErr.killed) {
              return reject({ error: "Time Limit Exceeded" });
            }
            return reject({
              error: "Runtime Error",
              details: stderr || runErr.message,
            });
          }

          if (stderr) {
            return reject({
              error: "Runtime Error",
              details: stderr,
            });
          }

          // Save output
          await fs.writeFile(outputFilePath, stdout || "");
          resolve(stdout || "");
        }
      );
    });
  });
};

export default executeJava;
