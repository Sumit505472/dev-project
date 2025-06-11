import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cookies from "cookies";
import cors from "cors";

import DBConnection from "./database/db.js";
import User from "./models/user.js";


import generateFile from "./generatefile.js";
import executeCpp from "./execute/executecpp.js";
import executeC from "./execute/executec.js";
import executeJava from "./execute/executejava.js";
import executePython from "./execute/executepython.js";
import Problem from "./models/problem.js";  
import generateInputFile from "./generateInputFile.js";
import {v4 as uuid} from "uuid";  
import Testcase from "./models/testcase.js";
import Submission from "./models/submission.js";
import aiCodeReview from "./aicodeReview.js";
import authMiddleware from "./middleware/authmiddleware.js"
 import subRoutes from "./routes/submissionroutes.js"


const app = express();
dotenv.config();
DBConnection();

const saltRounds = 10;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://codedge.online', 
    'https://www.codedge.online' 
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










app.post("/run", async (req, res) => {
  const { language = "cpp", code,input} = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      error: "Code is required",
    });
  }

  try {
    const filePath = generateFile(language, code);
    const inputFilePath = generateInputFile( input);  
    let output;

    switch (language) {
      case "cpp":
        output = await executeCpp(filePath,inputFilePath);
        break;
      case "c":
        output = await executeC(filePath,inputFilePath);
        break;
      case "java":
        output = await executeJava(filePath,inputFilePath);
        break;
      case "python":
        output = await executePython(filePath,inputFilePath);
        break;
      default:
        return res.status(400).json({ error: "Unsupported language" });
    }

    res.json({ filePath, output,input });
  } catch (err) {
    console.error("Error in running code:", err);
    res.status(500).json({
      success: false,
      error: err.error || "Something went wrong",
    });
  }
});

//



//problem route add problen

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

//add testcases in database
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

//read all problem from database
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




app.post("/submit", authMiddleware, async (req, res) => {
  const { code, language, problemId } = req.body;

  if (!code || !language || !problemId) {
    return res.status(400).json({
      success: false,
      error: "All fields are required",
    });
  }

  try {
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

    const codeFilePath = generateFile(language, code);

    for (const testCase of testCases) {
      const inputFilePath = generateInputFile(testCase.input);
      let actualOutput = "";

      try {
        switch (language) {
          case "cpp":
            actualOutput = await executeCpp(codeFilePath, inputFilePath);
            break;
          case "c":
            actualOutput = await executeC(codeFilePath, inputFilePath);
            break;
          case "java":
            actualOutput = await executeJava(codeFilePath, inputFilePath);
            break;
          case "python":
            actualOutput = await executePython(codeFilePath, inputFilePath);
            break;
          default:
            return res.status(400).json({ error: "Unsupported language" });
        }
      } catch (execErr) {
        return res.status(500).json({ error: "Code execution failed", details: execErr.message });
      }

      const passed = actualOutput.trim() === testCase.output.trim();
      results.push({
        input: testCase.input,
        expected: testCase.output.trim(),
        actual: actualOutput.trim(),
        passed,
      });

      if (!passed) allPassed = false;
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
    console.error("Submission failed:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

//here we will add ai review server side code
app.post("/ai-review", async (req, res) => {
  const { code } = req.body;

  if (!code || typeof code !== "string" || code.trim() === "") {
    return res.status(400).json({
      success: false,
      error: "Valid code is required",
    });
  }

  try {
    const review = await  aiCodeReview(code);
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