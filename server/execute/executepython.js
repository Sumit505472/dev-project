import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises'; // Use fs/promises for async file operations

// Get __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define directories for code (relative to this file)
const dirCodes = path.join(__dirname, '..', 'codes');
// No specific output directory needed for Python as it's interpreted

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

const executePython = async (filePath, inputFilePath) => {
    // Ensure the directory where code is written exists
    await ensureDirExists(path.dirname(filePath));

    return new Promise((resolve, reject) => {
        // Execute Python code
        // Python doesn't compile to an executable, so we run the script directly.
        exec(
            `python3 ${filePath} < ${inputFilePath}`, // Use python3 as is common on Linux
            async (error, stdout, stderr) => {
                // Clean up source file and input file after execution attempt
                await fs.unlink(filePath)
                    .then(() => console.log(`Successfully deleted: ${filePath}`))
                    .catch(err => console.error(`Failed to delete file ${filePath}:`, err));
                await fs.unlink(inputFilePath)
                    .then(() => console.log(`Successfully deleted: ${inputFilePath}`))
                    .catch(err => console.error(`Failed to delete file ${inputFilePath}:`, err));

                if (error) {
                    console.error('Python Runtime Error:', stderr || stdout || error.message);
                    return reject({ error: "Runtime Error", details: stderr || stdout || error.message });
                }
                if (stderr) {
                    console.warn('Python Stderr during execution:', stderr);
                    // For judge, anything in stderr is usually an error.
                    return reject({ error: "Runtime Error", details: stderr });
                }
                resolve(stdout);
            }
        );
    });
};

export default executePython;
