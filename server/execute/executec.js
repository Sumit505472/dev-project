import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executeC = (filePath, inputFilePath) => {
  const jobId = path.basename(filePath).split(".")[0];
  const output_filename = `${jobId}`;
  const outPath = path.join(outputPath, output_filename);

  return new Promise((resolve, reject) => {
    const command = `gcc "${filePath}" -o "${outPath}" && "${outPath}" < "${inputFilePath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Execution Error for C/C++: Command failed: ${command}`);
        console.error({ error_message: error.message, stdout_data: stdout, stderr_data: stderr });
        return reject({ error: error.message, stdout: stdout, stderr: stderr });
      }
      if (stderr) {
        console.warn(`Stderr for C/C++ execution (might be warnings or runtime error): ${stderr}`);
        return reject({ error: "Runtime Error/Warning in C/C++", stdout: stdout, stderr: stderr });
      }
      if (stdout) {
        return resolve(stdout);
      }
      return resolve("");
    });
  });
};

export default executeC;