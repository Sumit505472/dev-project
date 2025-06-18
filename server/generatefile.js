    import {fileURLToPath} from "url";
    import fs from "fs"; // Using fs for synchronous operations like writeFileSync
    import path from "path";
    import {v4 as uuid} from "uuid";

    const __filename=fileURLToPath(import.meta.url);
    const __dirname=path.dirname(__filename);

    // Define base directories (these must match your Dockerfile mkdir -p commands)
    // Using absolute paths within the Docker container WORKDIR /app
    const dirCodes = path.join("/app", "codes"); 
    const dirInputs = path.join("/app", "inputs"); 
    const dirOutputs = path.join("/app", "execute", "outputs"); 

    // Function to generate file path and write code/input
    const generateFile = (language, code, input) => {
        const jobId = uuid(); // Unique ID for each code execution job
        
        const file_extension = {
            cpp: "cpp",
            c: "c",
            python: "py",
            java: "java",
        }[language];

        let sourceFilename;
        // All output files will use jobId.out. This is constructed in index.js for final path.
        let outputFilename = `${jobId}.out`; 

        // Determine source filename based on language
        if (language === "java") {
            sourceFilename = `Main.java`; // Java source must be Main.java
        } else {
            sourceFilename = `${jobId}.${file_extension}`; // Other languages use jobId.ext
        }
        
        // Construct full path for source file
        const sourceFilePath = path.join(dirCodes, sourceFilename); 
        fs.writeFileSync(sourceFilePath, code); // Write the provided code to the file
        
        let inputFilePath = null;
        if (input !== undefined && input !== null && input.trim() !== '') { // Only create input file if input is provided
            const inputFilename = `${jobId}.txt`; // Input files also use jobId.txt
            inputFilePath = path.join(dirInputs, inputFilename);
            fs.writeFileSync(inputFilePath, input); // Write input to file
        }

        // Return all necessary paths and IDs for execution and cleanup
        return { 
            sourceFilePath, 
            inputFilePath, 
            outputFilePath: path.join(dirOutputs, outputFilename), // Full path for output
            language, 
            jobId,
            sourceFilename, // For cleanup reference
            inputFilename: input ? `${jobId}.txt` : null, // For cleanup reference (if input was provided)
            outputFilename // For cleanup reference
        }; 
    };

    export default generateFile;
    
