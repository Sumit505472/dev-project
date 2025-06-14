import dotenv from "dotenv";
dotenv.config(); // Ensure this is at the very top

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cookies from "cookies";
import cors from "cors";
import path from 'path'; // Import path module
import { fileURLToPath } from "url"; // Import fileURLToPath for ES Modules
import fs from "fs/promises"; // Import fs with promises for async operations


import DBConnection from "./database/db.js";
import User from "./models/user.js";

// Ensure these imports correctly point to your helper files
import generateFile from "./generatefile.js";
import executeCpp from "./execute/executecpp.js";
import executeC from "./execute/executec.js";
import executeJava from "./execute/executejava.js";
import executePython from "./execute/executepython.js";
import Problem from "./models/problem.js";
import generateInputFile from "./generateInputFile.js";
import {v4 as uuid} from "uuid"; // uuid is used in generateFile/InputFile, ensure it's available
import Testcase from "./models/testcase.js";
import Submission from "./models/submission.js";
import aiCodeReview from "./aicodeReview.js";
import authMiddleware from "./middleware/authmiddleware.js"
import subRoutes from "./routes/submissionroutes.js"

const app = express();
DBConnection();

// IMPORTANT: Define __filename, __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Define the base output path here once
const outputPath = path.join(__dirname, "execute", "outputs"); 


const saltRounds = 10;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://codedge.online',
        'https://www.codedge.online',
        'https://dev-project-mu.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(subRoutes);

// Home route
app.get("/", (req, res) => {
    res.send("Online Judge Server is running.");
});

// --- User Authentication Routes ---
app.post("/register", async (req, res) => {
    try {
        const { fullname, email, password } = req.body;
        if (!(fullname && email && password)) {
            return res.status(400).send("Please fill all the required fields");
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).send("User already exists with this email");
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await User.create({
            fullname,
            email,
            password: hashedPassword,
        });

        const token = jwt.sign({ id: newUser._id, email }, process.env.SECRET_KEY, {
            expiresIn: "1d",
        });

        newUser.token = token;
        newUser.password = undefined;

        res.cookie("token", token, {
            expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            domain: '.codedge.online'
        });

        res.status(200).json({
            message: "You have successfully registered",
        });
    } catch (error) {
        console.error("Registration failed", error);
        res.status(500).send("Something went wrong");
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!(email && password)) {
            return res.status(400).send("Please fill all the required fields");
        }

        const userExists = await User.findOne({ email });
        if (!userExists) {
            return res
                .status(404)
                .send("User not found with this email, enter correct email");
        }

        const enteredPassword = await bcrypt.compare(
            password,
            userExists.password
        );
        if (!enteredPassword) {
            return res.status(400).send("Incorrect password");
        }

        const token = jwt.sign({ id: userExists._id }, process.env.SECRET_KEY, {
            expiresIn: "1d",
        });

        userExists.token = token;
        userExists.password = undefined;

        const options = {
            expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            domain: '.codedge.online'
        };
        res.status(200).cookie("token", token, options).json({
            message: "You have successfully logged in!",
            success: true,
            token,
        });

    } catch (error) {
        console.error("Login failed", error);
        res.status(500).send("Something went wrong");
    }
});

app.get('/me', async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: 'Not logged in' });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user });
    } catch (err) {
        console.error("Error in /me:", err.message);
        res.status(401).json({ message: "Invalid or expired token" });
    }
});

// --- Code Execution Route ---
app.post("/run", async (req, res) => {
    const { language = "cpp", code, input } = req.body;

    if (!code) {
        return res.status(400).json({
            success: false,
            error: "Code is required",
        });
    }

    let filePath = null;
    let inputFilePath = null;
    let jobDirForJava = null; // To keep track of temporary directories for Java cleanup

    try {
        // generateFile will create a unique directory within dirCodes for Java,
        // and its path will be in filePath.
        filePath = generateFile(language, code);
        inputFilePath = generateInputFile(input);

        // For Java, extract the job directory path from filePath for later cleanup
        if (language === 'java') {
            jobDirForJava = path.dirname(filePath);
        }

        let output;
        switch (language) {
            case "cpp":
                output = await executeCpp(filePath, inputFilePath, outputPath); // PASS outputPath
                break;
            case "c":
                output = await executeC(filePath, inputFilePath, outputPath); // PASS outputPath
                break;
            case "java":
                // executeJava itself handles cleanup of its specific jobDir
                output = await executeJava(filePath, inputFilePath);
                break;
            case "python":
                output = await executePython(filePath, inputFilePath);
                break;
            default:
                return res.status(400).json({ error: "Unsupported language" });
        }

        // Send success response
        res.json({ output });

    } catch (err) {
        // Enhanced error handling for user feedback
        console.error("Error in running code:", err); // Log the full error object for debugging

        let errorMessage = "An unknown error occurred during execution.";
        let statusCode = 500; // Default to internal server error

        if (typeof err === 'object' && err !== null) {
            // Check for specific error messages from child_process.exec or our execute functions
            if (err.error) { // This captures the 'error' field from our rejected Promises
                errorMessage = err.error;
                statusCode = 400; // Assume user code error or compilation error initially

                // Refine for server configuration issues
                if (typeof err.error === 'string' && (err.error.includes('command not found') || err.error.includes('No such file or directory'))) {
                    errorMessage = "Server configuration error: Compiler/Interpreter not found or path issue. Please contact administrator.";
                    statusCode = 500; // This is a server-side problem, not user code
                }
            } else if (err.message) {
                // General JS errors or exec errors not specifically caught by our helper,
                // but might still indicate an issue related to the command execution.
                errorMessage = err.message;
                statusCode = 500;
            }

            // Append stderr for more detail if available and it's a string
            if (err.stderr && typeof err.stderr === 'string' && err.stderr.trim() !== '') {
                errorMessage += `\nStderr: ${err.stderr.trim()}`;
            }
             // Append stdout if it contains useful compilation output (e.g. for Java)
            if (err.stdout && typeof err.stdout === 'string' && err.stdout.trim() !== '') {
                errorMessage += `\nStdout: ${err.stdout.trim()}`;
            }

        } else if (typeof err === 'string') {
            errorMessage = err; // If the error is just a string
            statusCode = 500;
        }

        // Send the error response to the frontend
        res.status(statusCode).json({ success: false, error: errorMessage });

    } finally {
        // Clean up temporary code and input files (critical for disk space and security)
        const filesToDelete = [inputFilePath]; // inputFilePath is always cleaned

        // For C/C++/Python, delete the source file
        if (filePath && (language === 'cpp' || language === 'c' || language === 'python')) {
            filesToDelete.push(filePath);
        }

        // For C/C++, also delete the compiled executable
        if (filePath && (language === 'cpp' || language === 'c')) {
            const jobId = path.basename(filePath).split(".")[0];
            const output_filename = `${jobId}.out`; // Linux executable name
            const outPath = path.join(outputPath, output_filename); // Uses the globally defined outputPath
            filesToDelete.push(outPath);
        }

        // Clean up all collected files
        for (const file of filesToDelete) {
            if (file) { // Ensure file path is not null/undefined
                fs.unlink(file)
                    .then(() => console.log(`Successfully deleted: ${file}`))
                    .catch(unlinkErr => console.error(`Failed to delete file ${file}:`, unlinkErr));
            }
        }

        // Java's jobDir cleanup is handled within executeJava itself, but if you want
        // to be absolutely sure in case of early errors before executeJava is called:
        // (This part might be redundant if executeJava's internal cleanup is robust)
        if (jobDirForJava && language === 'java') {
            fs.rm(jobDirForJava, { recursive: true, force: true })
                .then(() => console.log(`Successfully deleted Java job dir: ${jobDirForJava}`))
                .catch(err => console.error("Failed to clean up Java job dir from /run finally:", err));
        }
    }
});

// --- Problem and Testcase Routes ---
app.post("/add",async(req,res)=>{
    const question=req.body;
    try{
        console.log("Received problem:", req.body);
        const newProblem = new Problem(question);
        await newProblem.save();
        res.status(200).json({
            success:true,
            message:"Problem added successfully"
        });
    }catch(error){
        res.status(500).json({
            success:false,
            error:error.message
        })
    }
});

app.post("/testcases", async (req, res) => {
    const test_cases = req.body; // should be an array
    try {
        console.log("Received test cases:", test_cases);
        await Testcase.insertMany(test_cases);
        res.status(200).json({
            success: true,
            message: "All test cases saved successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

app.get("/problem",async(req,res)=>{
    try{
        const problems = await Problem.find({});
        res.status(200).json({
            success:true,
            problems
        })
    }catch(error){
        res.status(500).json({
            success:false,
            error:error.message
        })
    }
});

app.get('/problem/:id', async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) return res.status(404).json({ error: 'Problem not found' });
        res.json(problem);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// --- Submission Route ---
app.post("/submit", authMiddleware, async (req, res) => {
    const { code, language, problemId } = req.body;

    if (!code || !language || !problemId) {
        return res.status(400).json({
            success: false,
            error: "All fields are required",
        });
    }

    let codeFilePath = null;
    let jobDirForJava = null; // For Java-specific directory cleanup

    try {
        codeFilePath = generateFile(language, code); // This also handles Java's unique jobDir
        if (language === 'java') {
            jobDirForJava = path.dirname(codeFilePath);
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({
                success: false,
                error: "Problem not found",
            });
        }

        const testCases = await Testcase.find({ problemId });

        let allPassed = true;
        let results = [];

        for (const testCase of testCases) {
            const inputFilePath = generateInputFile(testCase.input);
            let actualOutput = "";
            let executionErrorDetails = null; // To store error from execution for current test case

            try {
                switch (language) {
                    case "cpp":
                        actualOutput = await executeCpp(codeFilePath, inputFilePath, outputPath); // PASS outputPath
                        break;
                    case "c":
                        actualOutput = await executeC(codeFilePath, inputFilePath, outputPath); // PASS outputPath
                        break;
                    case "java":
                        actualOutput = await executeJava(codeFilePath, inputFilePath);
                        break;
                    case "python":
                        actualOutput = await executePython(codeFilePath, inputFilePath);
                        break;
                    default:
                        // This should ideally be caught by the outer /run route, but as a fallback
                        throw new Error("Unsupported language for submission testing.");
                }
            } catch (execErr) {
                // If code execution fails for a specific test case, record the error and mark as failed.
                allPassed = false; // Mark submission as failed
                executionErrorDetails = {
                    error: execErr.error || execErr.message || "Unknown execution error",
                    stderr: execErr.stderr || "",
                    stdout: execErr.stdout || ""
                };
                actualOutput = "Execution Error"; // Placeholder for actual output if it failed
                console.error(`Execution failed for test case (Problem ID: ${problemId}, Test Case Input: ${testCase.input}):`, executionErrorDetails);
                // Do NOT return here, continue processing other test cases if possible,
                // or just mark this one as failed.
            } finally {
                // Clean up input file after each test case
                if (inputFilePath) {
                    fs.unlink(inputFilePath)
                        .then(() => console.log(`Deleted input file: ${inputFilePath}`))
                        .catch(unlinkErr => console.error(`Failed to delete input file ${inputFilePath}:`, unlinkErr));
                }
            }

            // If an execution error occurred for this test case, store that as the result
            if (executionErrorDetails) {
                 results.push({
                    input: testCase.input,
                    expected: testCase.output.trim(),
                    actual: actualOutput, // Will be "Execution Error"
                    passed: false,
                    error: executionErrorDetails.error,
                    stderr: executionErrorDetails.stderr,
                    stdout: executionErrorDetails.stdout
                });
            } else {
                // Only trim outputs if no execution error occurred, as actualOutput might be "Execution Error"
                const passed = actualOutput.trim() === testCase.output.trim();
                if (!passed) allPassed = false;
                results.push({
                    input: testCase.input,
                    expected: testCase.output.trim(),
                    actual: actualOutput.trim(),
                    passed,
                });
            }
        }

        const newSubmission = new Submission({
            user: req.user._id,
            problem: problemId,
            code,
            language,
            verdict: allPassed ? "Accepted" : "Wrong Answer", // If any test case failed, it's Wrong Answer
            results,
        });

        await newSubmission.save();

        return res.status(200).json({
            success: true,
            verdict: newSubmission.verdict,
            results: newSubmission.results,
        });

    } catch (err) {
        console.error("Submission failed at top-level catch:", err); // Log the full error
        // Generic error for the entire submission process if something unexpected happens
        return res.status(500).json({
            success: false,
            error: "Internal server error during submission process.",
            details: err.message || JSON.stringify(err) // Provide more detail for debugging
        });
    } finally {
        // Clean up the main submitted code file for cpp/c/python
        if (codeFilePath && (language === 'cpp' || language === 'c' || language === 'python')) {
            fs.unlink(codeFilePath)
                .then(() => console.log(`Deleted code file: ${codeFilePath}`))
                .catch(unlinkErr => console.error(`Failed to delete code file ${codeFilePath}:`, unlinkErr));
        }
        // For C/C++, also delete the compiled executable from the correct outputs path
        if (codeFilePath && (language === 'cpp' || language === 'c')) {
            const jobId = path.basename(codeFilePath).split(".")[0];
            const output_filename = `${jobId}.out`;
            const outPath = path.join(outputPath, output_filename); // Uses the globally defined outputPath
            fs.unlink(outPath)
                .then(() => console.log(`Deleted executable: ${outPath}`))
                .catch(unlinkErr => console.error(`Failed to delete executable ${outPath}:`, unlinkErr));
        }
        // Java's jobDir cleanup is handled within executeJava itself,
        // but this ensures any early failures still attempt cleanup.
        if (jobDirForJava && language === 'java') {
            fs.rm(jobDirForJava, { recursive: true, force: true })
                .then(() => console.log(`Deleted Java job dir: ${jobDirForJava}`))
                .catch(err => console.error("Failed to clean up Java job dir from /submit finally:", err));
        }
    }
});


// --- AI Code Review Route ---
app.post("/ai-review", async (req, res) => {
    const { code } = req.body;

    if (!code || typeof code !== "string" || code.trim() === "") {
        return res.status(400).json({
            success: false,
            error: "Valid code is required",
        });
    }

    try {
        const review = await aiCodeReview(code);
        console.log(review)
        return res.status(200).json({
            success: true,
            review: review,
        });
    } catch (error) {
        console.error("AI review error:", error); // log for debugging
        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
});


// =================== START SERVER ===================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
