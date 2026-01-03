 import fs from 'fs/promises';
    import path from 'path';

    // Base directories for files (must match generatefile.js and Dockerfile)
    const dirCodes = path.join("/app", "codes");
    const dirInputs = path.join("/app", "inputs");
    const dirOutputs = path.join("/app", "execute", "outputs");

    const cleanupFiles = async ({ language, jobId, sourceFilename, inputFilename, outputFilename }) => {
        try {
            // Cleanup source code file
            let sourceFileToDelete = path.join(dirCodes, sourceFilename);
            try {
                await fs.unlink(sourceFileToDelete);
                console.log(`Successfully deleted source: ${sourceFileToDelete}`);
            } catch (err) {
                if (err.code !== 'ENOENT') { console.error(`Failed to delete source ${sourceFileToDelete}: ${err.message}`); }
            }

            // Cleanup input file (if it was created)
            if (inputFilename) {
                let inputFileToDelete = path.join(dirInputs, inputFilename);
                try {
                    await fs.unlink(inputFileToDelete);
                    console.log(`Successfully deleted input: ${inputFileToDelete}`);
                } catch (err) {
                    if (err.code !== 'ENOENT') { console.error(`Failed to delete input ${inputFileToDelete}: ${err.message}`); }
                }
            }

            // Cleanup output file (if it was created)
            if (outputFilename) { // outputFilename will be jobId.out
                 let outputFileToDelete = path.join(dirOutputs, outputFilename);
                 try {
                     await fs.unlink(outputFileToDelete);
                     console.log(`Successfully deleted output: ${outputFileToDelete}`);
                 } catch (err) {
                     if (err.code !== 'ENOENT') { console.error(`Failed to delete output ${outputFileToDelete}: ${err.message}`); }
                 }
            }

            // For Java, also delete the .class file (Main.class) which is in dirCodes
            if (language === 'java') {
                const classFileToDelete = path.join(dirCodes, 'Main.class'); 
                try {
                    await fs.unlink(classFileToDelete);
                    console.log(`Successfully deleted Java class file: ${classFileToDelete}`);
                } catch (err) {
                    if (err.code !== 'ENOENT') { console.error(`Failed to delete Java class file ${classFileToDelete}: ${err.message}`); }
                }
            }
            // For C/C++, also delete the compiled executable (a.out for non-UUID naming or jobId.out)
            // This part of cleanupFiles might not be needed if executeCpp handles it.
            // Let's assume executeCpp cleans its own binary for robustness.
            // If you want to keep it here, ensure it targets the correct path (dirCodes or dirOutputs)
            // and the correct filename (e.g., `${jobId}.out`)
            if (language === 'cpp' || language === 'c') {
                const executableFileToDelete = path.join(dirOutputs, `${jobId}.out`); 
                try {
                    await fs.unlink(executableFileToDelete);
                    console.log(`Successfully deleted executable: ${executableFileToDelete}`);
                } catch (err) {
                    if (err.code !== 'ENOENT') { console.error(`Failed to delete executable ${executableFileToDelete}: ${err.message}`); }
                }
            }

        } catch (error) {
            console.error('Error during cleanupFiles:', error);
        }
    };

    export default cleanupFiles;
    
