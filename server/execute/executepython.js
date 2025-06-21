import fs from "fs/promises"; // Use fs.promises for async operations
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process"; // Keeping 'exec' as per your existing code

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define a default timeout for all code executions in milliseconds.
// This is crucial for handling infinite loops or very long-running code.
const DEFAULT_TIMEOUT_MS = 5000; // Example: 5 seconds. Adjust as per your judge's requirements.

// Path for the outputs directory.
// *** IMPORTANT: This needs to be a valid, writable path on your LOCALHOST Windows machine. ***
// If generatefile.js and cleanupFiles.js use relative paths like 'tmp/execute/outputs',
// then this outputPath should match that structure if this module is creating it,
// or it should be passed in from index.js if generatefile.js handles all directory creation.
// For consistency, it's best if generatefile.js creates and passes ALL paths.
// However, this initial directory check is good practice if this module might be responsible for it.
const outputPathDir = path.join(__dirname, "..", "tmp", "execute", "outputs"); // Adjust this to match your generatefile.js BASE_DIRS for outputs

// Self-executing async function to ensure the output directory exists on module load.
(async () => {
    try {
        await fs.access(outputPathDir);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.mkdir(outputPathDir, { recursive: true });
            console.log(`DEBUG: Created output directory: ${outputPathDir}`);
        } else {
            console.error(`ERROR: Accessing or creating output directory ${outputPathDir}:`, error);
        }
    }
})();

/**
 * Executes Python code.
 * @param {string} filePath - Path to the Python source file.
 * @param {string} inputFilePath - Path to the input file (can be null for no input).
 * @param {string} outputFilePath - Path to the output file to redirect stdout.
 * @returns {Promise<string>} - A promise that resolves with stdout or rejects with an error object.
 */
const executePython = (filePath, inputFilePath, outputFilePath) => {
    return new Promise((resolve, reject) => {
        // Construct the command to run Python.
        // It redirects standard input from inputFilePath and standard output to outputFilePath.
        // --- CORRECTED: Use 'python' instead of 'python3', and correct template literal syntax.
        // --- CORRECTED: Removed redundant redirection in exec() call below.
        const commandToExecute = inputFilePath
            ? `python "${filePath}" < "${inputFilePath}" > "${outputFilePath}"`
            : `python "${filePath}" > "${outputFilePath}"`;

        console.log(`DEBUG: Python Execution Command: ${commandToExecute}`); // Log the command for debugging

        exec(
            commandToExecute, // Use the correctly defined command string
            { timeout: DEFAULT_TIMEOUT_MS }, // <-- CRUCIAL: Added timeout for TLE handling
            async (error, stdout, stderr) => {
                if (error) {
                    console.error('ERROR: Python Execution received an error:');
                    console.error('  Error Message:', error.message);
                    console.error('  Error Code (exit code):', error.code);
                    console.error('  Signal:', error.signal);
                    console.error('  Killed:', error.killed); // True if process was killed by timeout

                    // Determine if the error is a Time Limit Exceeded (TLE)
                    const isTimeout = (error.killed && error.signal === 'SIGTERM') ||
                                     (error.code === 137 && error.signal === 'SIGKILL'); // Common exit code for killed processes

                    if (isTimeout) {
                        console.warn('WARNING: Python Execution Time Limit Exceeded (TLE)');
                        return reject({ error: "Time Limit Exceeded", details: `Execution took longer than ${DEFAULT_TIMEOUT_MS / 1000} seconds.` });
                    } else if (stderr) {
                        // If there's stderr output, and it's not a timeout, treat as runtime error
                        console.error('ERROR: Python Runtime Error (Stderr during execution):', stderr);
                        return reject({ error: "Runtime Error", details: stderr });
                    } else {
                        // General execution error (e.g., Python executable not found, permissions)
                        console.error('ERROR: Python General Execution Error (no stderr):', error.message);
                        return reject({ error: "Runtime Error", details: error.message });
                    }
                }

                // If execution succeeded (no 'error' object), but there's content in stderr,
                // it might indicate a runtime warning or non-fatal error from the script.
                // For competitive programming, usually any stderr means an issue.
                if (stderr) {
                    console.warn('WARNING: Python Stderr during execution (process exited cleanly but stderr present):', stderr);
                    return reject({ error: "Runtime Error (Stderr Output)", details: stderr });
                }

                // If no execution error and no stderr, read output from the file
                try {
                    const output = await fs.readFile(outputFilePath, 'utf8');
                    console.log(`DEBUG: Python Output from ${outputFilePath}:\n${output}\n--- END PYTHON OUTPUT ---`); // Log the actual output
                    resolve(output.trim()); // Trim whitespace from the output
                } catch (readError) {
                    console.error('ERROR: Failed to read Python output file:', readError);
                    reject({ error: "Output Read Error", details: readError.message });
                }
            }
        );
    });
};

export default executePython;