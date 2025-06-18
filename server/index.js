import dotenv from "dotenv";
dotenv.config(); // Ensure this is at the very top

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from "url"; 
import fs from "fs/promises"; 
import { v4 as uuid } from "uuid"; // FIX: Import uuid here

// Database connection and models
import DBConnection from "./database/db.js"; 
import User from "./models/user.js";
import Problem from "./models/problem.js";
import Testcase from "./models/testcase.js";
import Submission from "./models/submission.js";

// Code execution utilities
import generateFile from "./generatefile.js";
import cleanupFiles from "./cleanupFiles.js"; 

import executeCpp from "./execute/executecpp.js";
import executeC from "./execute/executec.js";
import executeJava from "./execute/executejava.js";
import executePython from "./execute/executepython.js";

// AI Code Review
import aiCodeReview from "./aicodeReview.js";

// Middleware
import authMiddleware from "./middleware/authmiddleware.js";
import subRoutes from "./routes/submissionroutes.js"; 

const app = express();
DBConnection();

// IMPORTANT: Define __filename, __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
    
// Salt rounds for bcrypt hashing
const saltRounds = 10;

// --- Middleware ---
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
        newUser.password = undefined; // Remove password from object before sending

        res.cookie("token", token, {
            expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day expiration
            httpOnly: true,
            secure: true, // Only send over HTTPS
            sameSite: 'None', // Required for cross-site cookies
            domain: '.codedge.online' // Ensure this matches your domain
        });

        res.status(200).json({
            message: "You have successfully registered",
            success: true,
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
        userExists.password = undefined; // Remove password from object before sending

        const options = {
            expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day expiration
            httpOnly: true,
            secure: true, // Only send over HTTPS
            sameSite: 'None', // Required for cross-site cookies
            domain: '.codedge.online' // Ensure this matches your domain
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

// --- Code Execution Route (for simple run, not judge) ---
app.post("/run", async (req, res) => {
    const { language = "cpp", code, input } = req.body;

    if (!code) {
        return res.status(400).json({
            success: false,
            error: "Code is required",
        });
    }

    let fileDetailsForCleanup = {};

    try {
        const { 
            sourceFilePath, 
            inputFilePath, 
            outputFilePath, 
            language: jobLanguage, 
            jobId, 
            sourceFilename, 
            inputFilename, 
            outputFilename 
        } = generateFile(language, code, input);
        
        fileDetailsForCleanup = { language: jobLanguage, jobId, sourceFilename, inputFilename, outputFilename };

        let output;
        switch (jobLanguage) {
            case "cpp":
                output = await executeCpp(sourceFilePath, inputFilePath, outputFilePath);
                break;
            case "c":
                output = await executeC(sourceFilePath, inputFilePath, outputFilePath);
                break;
            case "java":
                output = await executeJava(sourceFilePath, inputFilePath, outputFilePath);
                break;
            case "python":
                output = await executePython(sourceFilePath, inputFilePath, outputFilePath);
                break;
            default:
                return res.status(400).json({ success: false, error: "Unsupported language" });
        }

        return res.json({ success: true, output });

    } catch (err) {
        console.error("Error in /run route:", err); 

        let errorMessage = "An unknown error occurred during execution.";
        let statusCode = 500; 

        if (typeof err === 'object' && err !== null) {
            if (err.error) { 
                errorMessage = err.error;
                statusCode = 400; 
            } else if (err.message) {
                errorMessage = err.message;
                statusCode = 500;
            }

            if (err.stderr && typeof err.stderr === 'string' && err.stderr.trim() !== '') {
                errorMessage += `\nStderr: ${err.stderr.trim()}`;
            }
            if (err.stdout && typeof err.stdout === 'string' && err.stdout.trim() !== '') {
                errorMessage += `\nStdout: ${err.stdout.trim()}`;
            }
        } else if (typeof err === 'string') {
            errorMessage = err; 
            statusCode = 500;
        }

        return res.status(statusCode).json({ success: false, error: errorMessage });

    } finally {
        await cleanupFiles(fileDetailsForCleanup);
    }
});

// --- Problem and Testcase Routes ---
app.post("/add", async (req, res) => {
    const question = req.body;
    try {
        console.log("Received problem:", req.body);
        const newProblem = new Problem(question);
        await newProblem.save();
        res.status(200).json({
            success: true,
            message: "Problem added successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post("/testcases", async (req, res) => {
    const test_cases = req.body; 
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

app.get("/problem", async (req, res) => {
    try {
        const problems = await Problem.find({});
        res.status(200).json({
            success: true,
            problems
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
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

// --- Submission Route (for judge with test cases) ---
app.post("/submit", authMiddleware, async (req, res) => {
    const { code, language, problemId } = req.body;

    if (!code || !language || !problemId) {
        return res.status(400).json({
            success: false,
            error: "All fields are required",
        });
    }

    let fileDetailsForCleanup = {};

    try {
        const { 
            sourceFilePath, 
            language: jobLanguage, 
            jobId, 
            sourceFilename 
        } = generateFile(language, code, null); 
        
        fileDetailsForCleanup = { language: jobLanguage, jobId, sourceFilename };

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ success: false, error: "Problem not found" });
        }

        const testCases = await Testcase.find({ problemId });

        let allPassed = true;
        let results = [];

        for (const testCase of testCases) {
            const testInputId = uuid(); // uuid is used here
            const inputFilename = `${jobId}_${testInputId}.txt`; 
            const inputFilePath = path.join(path.join("/app", "inputs"), inputFilename);
            await fs.writeFile(inputFilePath, testCase.input);
            
            const outputFilename = `${jobId}_${testInputId}.out`; 
            const outputFilePath = path.join(path.join("/app", "execute", "outputs"), outputFilename);
            
            fileDetailsForCleanup.inputFilename = inputFilename; 
            fileDetailsForCleanup.outputFilename = outputFilename; 

            let actualOutput = "";
            let executionErrorDetails = null; 

            try {
                switch (jobLanguage) {
                    case "cpp":
                        actualOutput = await executeCpp(sourceFilePath, inputFilePath, outputFilePath);
                        break;
                    case "c":
                        actualOutput = await executeC(sourceFilePath, inputFilePath, outputFilePath);
                        break;
                    case "java":
                        actualOutput = await executeJava(sourceFilePath, inputFilePath, outputFilePath);
                        break;
                    case "python":
                        actualOutput = await executePython(sourceFilePath, inputFilePath, outputFilePath);
                        break;
                    default:
                        throw new Error("Unsupported language for submission testing.");
                }
            } catch (execErr) {
                allPassed = false; 
                executionErrorDetails = {
                    error: execErr.error || execErr.message || "Unknown execution error",
                    stderr: execErr.stderr || "",
                    stdout: execErr.stdout || ""
                };
                actualOutput = "Execution Error"; 
                console.error(`Execution failed for test case (Problem ID: ${problemId}, Test Case Input: ${testCase.input}):`, executionErrorDetails);
            } finally {
                try {
                    await fs.unlink(inputFilePath);
                    console.log(`Deleted test input file: ${inputFilePath}`);
                } catch (err) {
                    if (err.code !== 'ENOENT') { console.error(`Failed to delete test input file ${inputFilePath}:`, err.message); }
                }
            }

            if (executionErrorDetails) {
                results.push({
                    input: testCase.input,
                    expected: testCase.output.trim(),
                    actual: actualOutput, 
                    passed: false,
                    error: executionErrorDetails.error,
                    stderr: executionErrorDetails.stderr,
                    stdout: executionErrorDetails.stdout
                });
            } else {
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
            verdict: allPassed ? "Accepted" : "Wrong Answer", 
            results,
        });

        await newSubmission.save();

        return res.status(200).json({
            success: true,
            verdict: newSubmission.verdict,
            results: newSubmission.results,
        });

    } catch (err) {
        console.error("Submission failed at top-level catch:", err); 
        return res.status(500).json({
            success: false,
            error: "Internal server error during submission process.",
            details: err.message || JSON.stringify(err) 
        });
    } finally {
        await cleanupFiles(fileDetailsForCleanup);
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
        console.error("AI review error:", error); 
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

