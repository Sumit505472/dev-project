    import { exec } from 'child_process';
    import path from 'path';
    import { fileURLToPath } from 'url';
    import fs from 'fs/promises'; 

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const executeJava = async (sourceFilePath, inputFilePath, outputFilePath) => { // ADDED outputFilePath parameter
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

                    // Execute compiled Java code
                    exec(
                        `${javaExecutionPart} > "${outputFilePath}"`, // Redirect stdout to outputFilePath
                        async (runError, stdoutRun, stderrRun) => {
                            // Clean up the temporary directory after execution (success or failure)
                            fs.rm(dirCodes, { recursive: true, force: true })
                                .then(() => console.log(`Cleaned up Java job dir: ${dirCodes}`))
                                .catch(err => console.error(`Failed to clean up Java job dir ${dirCodes}:`, err));

                            if (runError) {
                                console.error('Java Runtime Error:', stderrRun || stdoutRun || runError.message);
                                return reject({ error: "Runtime Error", details: stderrRun || stdoutRun || runError.message });
                            }
                            if (stderrRun) {
                                console.warn('Java Stderr during execution:', stderrRun);
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

    export default executeJava;
    
