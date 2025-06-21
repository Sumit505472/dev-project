import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_TIMEOUT_MS = 5000; // 5 seconds, adjust as needed

const executeC = async (sourceFilePath, inputFilePath, outputFilePath) => {
    const dirCodes = path.dirname(sourceFilePath);
    const jobId = path.basename(sourceFilePath).split(".")[0];
    const binaryPath = path.join(dirCodes, `${jobId}.out`);

    const executionCommand = inputFilePath
        ? `"${binaryPath}" < "${inputFilePath}"` // With input redirection
        : `"${binaryPath}"`; // Without input redirection

    return new Promise((resolve, reject) => {
        // Compile C code using gcc
        exec(
            `gcc "${sourceFilePath}" -o "${binaryPath}"`,
            async (compileError, stdoutCompile, stderrCompile) => {
                if (compileError) {
                    console.error('C Compilation Error:', stderrCompile || stdoutCompile || compileError.message);
                    return reject({ error: "Compilation Error", details: stderrCompile || stdoutCompile || compileError.message });
                }

                // Execute compiled C code with a timeout
                exec(
                    `${executionCommand} > "${outputFilePath}"`, // Redirect stdout to outputFilePath
                    { timeout: DEFAULT_TIMEOUT_MS }, // <-- ADDED TIMEOUT HERE
                    async (runError, stdoutRun, stderrRun) => {
                        // Delete the binary after execution
                        try {
                            await fs.unlink(binaryPath);
                            console.log(`Successfully deleted binary: ${binaryPath}`);
                        } catch (err) {
                            if (err.code !== 'ENOENT') { console.error(`Failed to delete binary ${binaryPath}: ${err.message}`); }
                        }

                        if (runError) {
                            console.error('C Execution received an error:');
                            console.error('  Error Message:', runError.message);
                            console.error('  Error Code (exit code):', runError.code);
                            console.error('  Signal:', runError.signal);
                            console.error('  Killed:', runError.killed);

                            const isTimeout = (runError.killed && runError.signal === 'SIGTERM') || // Node.js timeout
                                              (runError.code === 137 && runError.signal === 'SIGKILL'); // Common on Linux for forced kills

                            if (isTimeout) {
                                console.warn('C Execution Time Limit Exceeded (TLE)');
                                return reject({ error: "Time Limit Exceeded", details: `Execution took longer than ${DEFAULT_TIMEOUT_MS / 1000} seconds, or was terminated prematurely.` });
                            } else {
                                let errorMessage = stderrRun || stdoutRun || runError.message;
                                let errorType = "Runtime Error";

                                // --- Specific checks for C Runtime Errors ---
                                if (runError.signal === 'SIGSEGV' || runError.code === 139) { // Linux Segmentation Fault
                                    errorMessage = "Program terminated due to a segmentation fault (invalid memory access/stack overflow)";
                                    errorType = "Runtime Error (Segmentation Fault)";
                                } else if (runError.signal === 'SIGFPE' || runError.code === 136) { // Linux Floating Point Exception (includes Divide by Zero)
                                    errorMessage = "Program terminated due to a floating point exception (e.g., division by zero)";
                                    errorType = "Runtime Error (Divide by Zero / FPE)";
                                } else if (runError.signal === 'SIGABRT' || runError.code === 134) { // Linux Abort signal (e.g., from assert() or uncaught exceptions)
                                    errorMessage = "Program aborted unexpectedly";
                                    errorType = "Runtime Error (Aborted)";
                                } else if (process.platform === 'win32' && runError.code === -1073741819) { // Windows specific crash code
                                    errorMessage = "Program terminated unexpectedly (e.g., Access Violation/Segmentation Fault/Stack Overflow)";
                                    errorType = "Runtime Error (Crash)";
                                }
                                // --- End Specific checks ---

                                console.error(`C ${errorType}:`, errorMessage);
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
                            console.warn('C Stderr during execution:', stderrRun);
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

export default executeC;