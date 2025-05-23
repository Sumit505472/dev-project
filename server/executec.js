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

const executeC = (filePath) => {
  const jobId = path.basename(filePath).split(".")[0];
  const output_filename = `${jobId}.exe`;
  const outPath = path.join(outputPath, output_filename);

  return new Promise((resolve, reject) => {
    exec(`gcc "${filePath}" -o "${outPath}" && cd "${outputPath}" && .\\${output_filename}`, (error, stdout, stderr) => {
      if (error) {
        return reject({ error, stderr });
      }
      if (stderr) {
        return reject(stderr);
      }
      if (stdout) {
        return resolve(stdout);
      }
    });
  });
};

export default executeC;
