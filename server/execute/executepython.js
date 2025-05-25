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

const executePython = (filePath,inputFilePath) => {
  return new Promise((resolve, reject) => {
    exec(`python "${filePath}" < "${inputFilePath}"`, (error, stdout, stderr) => {
      if (error) {
        return reject({ error, stderr });
      }
      if (stderr) {
        // Some python programs output warnings on stderr but still succeed
        // So you can optionally resolve or reject here depending on your use-case
      }
      if (stdout) {
        return resolve(stdout);
      }
    });
  });
};

export default executePython;
