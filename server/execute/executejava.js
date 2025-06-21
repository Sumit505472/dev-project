import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_TIMEOUT_MS = 5000; // 5 seconds, adjust as needed

const executeJava = async (sourceFilePath, inputFilePath, outputFilePath) => {
    const className = 'Main';
    const dirCodes = path.dirname(sourceFilePath);

    // Determine the execution command for Java based on whether inputFilePath is provided
    const javaExecutionPart = inputFilePath
        ? `java -cp "${dirCodes}" ${className} < "${inputFilePath}"` // With input redirection
        : `java -cp "${dirCodes}" ${className}`;                     // Without input redirection

    return new Promise((resolve, reject) => {
        // Compile Java code
        exec(
            `javac "${sourceFilePath}" -d "${dirCodes}"`,
            async (compileError, stdoutCompile, stderrCompile) => {
                if (compileError) {
                    console.error('Java Compilation Error:', stderrCompile || stdoutCompile || compileError.message);
                    // Ensure Java job directory is cleaned up on compilation error
                    fs.rm(dirCodes, { recursive: true, force: true }).catch(err => console.error("Failed to clean up Java job dir after compile error:", err));
                    return reject({ error: "Compilation Error", details: stderrCompile || stdoutCompile || compileError.message });
                }

                // Execute compiled Java code with a timeout
                exec(
                    `${javaExecutionPart} > "${outputFilePath}"`, // Redirect stdout to outputFilePath
                    { timeout: DEFAULT_TIMEOUT_MS }, // ADDED TIMEOUT HERE
                    async (runError, stdoutRun, stderrRun) => {
                        // Clean up the temporary directory after execution (success or failure)
                        fs.rm(dirCodes, { recursive: true, force: true })
                            .then(() => console.log(`Cleaned up Java job dir: ${dirCodes}`))
                            .catch(err => console.error(`Failed to clean up Java job dir ${dirCodes}:`, err));

                        if (runError) {
                            console.error('Java Execution received an error:');
                            console.error('   Error Message:', runError.message);
                            console.error('   Error Code (exit code):', runError.code);
                            console.error('   Signal:', runError.signal);
                            console.error('   Killed:', runError.killed);

                            const isTimeout = (runError.killed && runError.signal === 'SIGTERM') || // Node.js timeout
                                             (runError.code === 137 && runError.signal === 'SIGKILL'); // Common on Linux for forced kills

                            if (isTimeout) {
                                console.warn('Java Execution Time Limit Exceeded (TLE)');
                                return reject({ error: "Time Limit Exceeded", details: `Execution took longer than ${DEFAULT_TIMEOUT_MS / 1000} seconds, or was terminated prematurely.` });
                            } else {
                                let errorMessage = stderrRun || stdoutRun || runError.message;
                                let errorType = "Runtime Error";

                                // Generic runtime error for Java
                                console.error(`Java ${errorType}:`, errorMessage);
                                return reject({
                                    error: errorType,
                                    details: errorMessage,
                                    exitCode: runError.code,
                                    signal: runError.signal,
                                    rawErrorMessage: runError.message
                                });
                            }
                        }
                        if (stderrRun) {
                            console.warn('Java Stderr during execution:', stderrRun);
                            return reject({ error: "Runtime Error (Stderr Output)", details: stderrRun });
                        }

                        // Read output from the file
                        try {
                            const output = await fs.readFile(outputFilePath, 'utf8');
                            resolve(output);
                        } catch (readError) {
                            console.error('Failed to read output file:', readError);
                            reject({ error: "Output Read Error", details: readError.message });
                        }
                    }
                );
            }
        );
    });
};

export default executeJava;