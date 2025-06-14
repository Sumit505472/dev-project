import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises'; // Use fs/promises for async file operations

// Get __dirname for ES Modules for this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define directories relative to this file for source code, but outputs are passed in
const dirCodes = path.join(__dirname, '..', 'codes');
// Note: dirOutputs is no longer directly defined here, it's passed in.

// Function to ensure a directory exists (reusable helper)
const ensureDirExists = async (dir) => {
    try {
        await fs.access(dir); // Check if directory exists
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.mkdir(dir, { recursive: true }); // Create if it doesn't exist
            console.log(`Created directory: ${dir}`);
        } else {
            throw error; // Re-throw other errors
        }
    }
};

// Modified function to accept outputPath
const executeCpp = async (filePath, inputPath, outputPath) => { // ADDED: outputPath parameter
    const jobId = path.basename(filePath).split('.')[0];
    const outPath = path.join(outputPath, `${jobId}.out`); // Use the passed outputPath

    // Ensure outputs directory exists before compilation
    await ensureDirExists(outputPath); // Ensure the passed outputPath exists

    return new Promise((resolve, reject) => {
        // Compile the C++ code
        exec(
            `g++ ${filePath} -o ${outPath}`,
            async (compileError, stdoutCompile, stderrCompile) => {
                // Clean up source file after compilation attempt
                await fs.unlink(filePath)
                    .then(() => console.log(`Successfully deleted: ${filePath}`))
                    .catch(err => console.error(`Failed to delete file ${filePath}:`, err));

                if (compileError) {
                    console.error('C++ Compilation Error:', stderrCompile || stdoutCompile || compileError.message);
                    return reject({ error: "Compilation Error", details: stderrCompile || stdoutCompile || compileError.message });
                }

                // Execute the compiled C++ code
                exec(
                    `${outPath} < ${inputPath}`,
                    async (runError, stdoutRun, stderrRun) => {
                        // Clean up input and output files after execution attempt
                        await fs.unlink(inputPath)
                            .then(() => console.log(`Successfully deleted: ${inputPath}`))
                            .catch(err => console.error(`Failed to delete file ${inputPath}:`, err));
                        await fs.unlink(outPath)
                            .then(() => console.log(`Successfully deleted: ${outPath}`))
                            .catch(err => console.error(`Failed to delete file ${outPath}:`, err));

                        if (runError) {
                            console.error('C++ Runtime Error:', stderrRun || stdoutRun || runError.message);
                            return reject({ error: "Runtime Error", details: stderrRun || stdoutRun || runError.message });
                        }
                        if (stderrRun) {
                            console.warn('C++ Stderr during execution:', stderrRun);
                            // For judge, usually, anything in stderr is an error.
                            return reject({ error: "Runtime Error", details: stderrRun });
                        }
                        resolve(stdoutRun);
                    }
                );
            }
        );
    });
};

export default executeCpp;
