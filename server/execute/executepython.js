import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executePython = (filePath, inputFilePath) => {
  return new Promise((resolve, reject) => {
    const command = `python3 "${filePath}" < "${inputFilePath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Execution Error for Python: Command failed: ${command}`);
        console.error({ error_message: error.message, stdout_data: stdout, stderr_data: stderr });
        return reject({ error: error.message, stdout: stdout, stderr: stderr });
      }
      if (stderr) {
        console.warn(`Stderr for Python execution (could be error or warning): ${stderr}`);
        return reject({ error: "Runtime Error/Warning in Python", stdout: stdout, stderr: stderr });
      }
      if (stdout) {
        return resolve(stdout);
      }
      return resolve("");
    });
  });
};

export default executePython;