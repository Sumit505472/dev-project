    import fs from "fs/promises"; 
    import path from "path";
    import { fileURLToPath } from "url";
    import { exec } from "child_process";

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const outputPath = path.join("/app", "execute", "outputs"); 
    (async () => {
        try {
            await fs.access(outputPath); 
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.mkdir(outputPath, { recursive: true });
                console.log(`Created output directory: ${outputPath}`);
            } else {
                console.error(`Error accessing or creating output directory ${outputPath}:`, error);
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
    const executePython = (filePath, inputFilePath, outputFilePath) => { // ADDED outputFilePath parameter
        return new Promise((resolve, reject) => {
            // Determine the execution command based on whether inputFilePath is provided
            const executionCommand = inputFilePath 
                ? `python3 "${filePath}" < "${inputFilePath}"` // With input redirection
                : `python3 "${filePath}"`;                     // Without input redirection

            exec(
                `${executionCommand} > "${outputFilePath}"`, // Redirect stdout to outputFilePath
                async (runError, stdoutRun, stderrRun) => {
                    if (runError) {
                        console.error('Python Runtime Error:', stderrRun || stdoutRun || runError.message);
                        return reject({ error: "Runtime Error", details: stderrRun || stdoutRun || runError.message });
                    }
                    if (stderrRun) {
                        console.warn('Python Stderr during execution:', stderrRun);
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
        });
    };

    export default executePython;
    
