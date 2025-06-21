import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_TIMEOUT_MS = 5000; // 5 seconds, adjust as needed for TLE test

const executeCpp = async (sourceFilePath, inputFilePath, outputFilePath) => {
    const dirCodes = path.dirname(sourceFilePath);
    const jobId = path.basename(sourceFilePath).split(".")[0];
    const binaryPath = path.join(dirCodes, `${jobId}.out`);

    const executionCommand = inputFilePath
        ? `"${binaryPath}" < "${inputFilePath}"`
        : `"${binaryPath}"`;

    return new Promise((resolve, reject) => {
        fs.readFile(sourceFilePath, 'utf8')
            .then(content => {
                console.log(`DEBUG: C++ Source File Content for ${sourceFilePath}:\n${content}\n--- END C++ SOURCE ---`);

                exec(
                    `g++ "${sourceFilePath}" -o "${binaryPath}"`,
                    async (compileError, stdoutCompile, stderrCompile) => {
                        if (compileError) {
                            console.error('C++ Compilation Error:', stderrCompile || stdoutCompile || compileError.message);
                            return reject({ error: "Compilation Error", details: stderrCompile || stdoutCompile || compileError.message });
                        }

                        const executionProcess = exec(
                            `${executionCommand} > "${outputFilePath}"`,
                            { timeout: DEFAULT_TIMEOUT_MS },
                            async (runError, stdoutRun, stderrRun) => {
                                // Delete the binary after execution
                                try {
                                    await fs.unlink(binaryPath);
                                    console.log(`Successfully deleted binary: ${binaryPath}`);
                                } catch (err) {
                                    if (err.code !== 'ENOENT') { console.error(`Failed to delete binary ${binaryPath}: ${err.message}`); }
                                }

                                if (runError) {
                                    // *** IMPORTANT DEBUGGING ADDITION START ***
                                    console.error('C++ Execution received an error:');
                                    console.error('  Error Message:', runError.message);
                                    console.error('  Error Code (exit code):', runError.code); // <-- This is key
                                    console.error('  Signal:', runError.signal); // <-- This is key
                                    console.error('  Killed:', runError.killed);
                                    // *** IMPORTANT DEBUGGING ADDITION END ***

                                    if (runError.killed && runError.signal === 'SIGTERM') {
                                        console.warn('C++ Execution Time Limit Exceeded (TLE)');
                                        return reject({ error: "Time Limit Exceeded", details: `Execution took longer than ${DEFAULT_TIMEOUT_MS / 1000} seconds.` });
                                    } else {
                                        // This is the general runtime error case
                                        console.error('C++ Runtime Error:', stderrRun || stdoutRun || runError.message);
                                        // Check if output file was created but empty/malformed
                                        let outputContent = '';
                                        try {
                                            outputContent = await fs.readFile(outputFilePath, 'utf8');
                                        } catch (readErr) {
                                            // output file might not exist if process crashed immediately
                                        }
                                        return reject({
                                            error: "Runtime Error",
                                            details: stderrRun || stdoutRun || runError.message,
                                            exitCode: runError.code, // Add exit code to the rejection
                                            signal: runError.signal, // Add signal to the rejection
                                            consoleOutput: outputContent // Capture any partial output
                                        });
                                    }
                                }
                                if (stderrRun) {
                                    console.warn('C++ Stderr during execution:', stderrRun);
                                    return reject({ error: "Runtime Error", details: stderrRun });
                                }

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
            })
            .catch(readErr => {
                console.error(`ERROR: Failed to read C++ source file ${sourceFilePath}:`, readErr);
                return reject({ error: "File Read Error", details: readErr.message });
            });
    });
};

export default executeCpp;