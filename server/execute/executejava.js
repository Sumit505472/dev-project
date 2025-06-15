import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises'; // Use fs/promises for async file operations

// Get __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define directories for code (relative to this file)
const dirCodes = path.join(__dirname, '..', 'codes');
// Note: dirOutputs is not directly defined here, as Java compilation creates output in its own jobDir.

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

const executeJava = async (filePath, inputFilePath) => {
    const jobId = path.basename(filePath).split('.')[0];
    const className = path.basename(filePath, '.java'); 
    const jobDir = path.dirname(filePath); // The unique directory created for this Java job

    // Ensure job directory exists for compilation output (e.g., .class files)
    await ensureDirExists(jobDir); // Ensure the temporary directory for Java exists

    return new Promise((resolve, reject) => {
        // Compile Java code
        // Output of compilation (like .class files) goes into jobDir
        exec(
            `javac ${filePath} -d ${jobDir}`,
            async (compileError, stdoutCompile, stderrCompile) => {
                // IMPORTANT: Do NOT unlink filePath here as it's the source code used for compilation.
                // The cleanup of the whole jobDir (including source) is done after execution or on error.

                if (compileError) {
                    console.error('Java Compilation Error:', stderrCompile || stdoutCompile || compileError.message);
                    // Clean up the job directory on compilation error
                    await fs.rm(jobDir, { recursive: true, force: true }).catch(err => console.error("Failed to clean up jobDir after compile error:", err));
                    return reject({ error: "Compilation Error", details: stderrCompile || stdoutCompile || compileError.message });
                }

                // Execute compiled Java code
                exec(
                    `java -cp ${jobDir} ${className} < ${inputFilePath}`,
                    async (runError, stdoutRun, stderrRun) => {
                        // Clean up the temporary job directory for Java after execution (success or failure)
                        await fs.rm(jobDir, { recursive: true, force: true })
                            .then(() => console.log(`Cleaned up Java job dir: ${jobDir}`))
                            .catch(err => console.error(`Failed to clean up Java job dir ${jobDir}:`, err));

                        if (runError) {
                            console.error('Java Runtime Error:', stderrRun || stdoutRun || runError.message);
                            return reject({ error: "Runtime Error", details: stderrRun || stdoutRun || runError.message });
                        }
                        if (stderrRun) {
                            console.warn('Java Stderr during execution:', stderrRun);
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

export default executeJava;
