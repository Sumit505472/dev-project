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

const executeJava = (filePath,inputFilePath) => {
  return new Promise((resolve, reject) => {
    const code = fs.readFileSync(filePath, "utf-8"); // ✅ read Java code from file

    const jobId = `job-${Date.now()}`;
    const jobDir = path.join(outputPath, jobId);
    fs.mkdirSync(jobDir, { recursive: true });

    const mainFilePath = path.join(jobDir, 'Main.java');
    fs.writeFileSync(mainFilePath, code);

    const command = `javac -d "${jobDir}" "${mainFilePath}" && java -cp "${jobDir}" Main ${inputFilePath}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Execution Error:", error.message);
        return reject({ success: false, error: error.message });
      }
      if (stderr) {
        console.error("Stderr:", stderr);
        return reject({ success: false, error: stderr });
      }
      return resolve(stdout);
    });
  });
};

export default executeJava;
