import { exec } from 'child_process';
    import path from 'path';
    import { fileURLToPath } from 'url';
    import fs from 'fs/promises';

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const executeC = async (sourceFilePath, inputFilePath, outputFilePath) => {
        const dirCodes = path.dirname(sourceFilePath); 
        const jobId = path.basename(sourceFilePath).split(".")[0];
        const binaryPath = path.join(dirCodes, `${jobId}.out`); 

        // Determine the execution command based on whether inputFilePath is provided
        const executionCommand = inputFilePath 
            ? `"${binaryPath}" < "${inputFilePath}"` // With input redirection
            : `"${binaryPath}"`;                     // Without input redirection

        return new Promise((resolve, reject) => {
            // Compile C code using gcc
            exec(
                `gcc "${sourceFilePath}" -o "${binaryPath}"`,
                async (compileError, stdoutCompile, stderrCompile) => {
                    if (compileError) {
                        console.error('C Compilation Error:', stderrCompile || stdoutCompile || compileError.message);
                        return reject({ error: "Compilation Error", details: stderrCompile || stdoutCompile || compileError.message });
                    }

                    // Execute compiled C code
                    exec(
                        `${executionCommand} > "${outputFilePath}"`, // Redirect stdout to outputFilePath
                        async (runError, stdoutRun, stderrRun) => {
                            // Delete the binary after execution
                            try {
                                await fs.unlink(binaryPath);
                                console.log(`Successfully deleted binary: ${binaryPath}`);
                            } catch (err) {
                                if (err.code !== 'ENOENT') { console.error(`Failed to delete binary ${binaryPath}: ${err.message}`); }
                            }

                            if (runError) {
                                console.error('C Runtime Error:', stderrRun || stdoutRun || runError.message);
                                return reject({ error: "Runtime Error", details: stderrRun || stdoutRun || runError.message });
                            }
                            if (stderrRun) {
                                console.warn('C Stderr during execution:', stderrRun);
                                return reject({ error: "Runtime Error", details: stderrRun });
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
    
