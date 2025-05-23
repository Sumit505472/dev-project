import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";

import DBConnection from "./database/db.js";
import User from "./models/user.js";
import submission from "./models/submission.js";

import generateFile from "./generatefile.js";
import executeCpp from "./executecpp.js";
import executeC from "./executec.js";
import executeJava from "./executejava.js";
import executePython from "./executepython.js";
import problem from "./models/problem.js";

const app = express();
dotenv.config();
DBConnection();

const saltRounds = 10;

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Home route
app.get("/", (req, res) => {
  res.send("Online Judge Server is running.");
});

// =================== AUTH ROUTES 

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

    res.status(200).json({
      message: "You have successfully registered",
      user: newUser,
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
    };

    res
      .status(200)
      .cookie("token", token, options)
      .json({
        message: "You have successfully logged in!",
        success: true,
        token,
      });
  } catch (error) {
    console.error("Login failed", error);
    res.status(500).send("Something went wrong");
  }
});

// =================== SUBMISSION ROUTE ===================

app.post("/submit", async (req, res) => {
  try {
    const { language, code, testcase, testOutput } = req.body;

    if (!(language && code && testcase && testOutput)) {
      return res.status(400).send("Enter all the fields");
    }

    const newSubmission = await submission.create({
      code,
      testcase,
      testOutput,
      language,
      user: req.user?._id || "unknown", // Fallback if no user context
    });

    res.status(200).json({ message: "Submission saved", submission: newSubmission });
  } catch (error) {
    console.error("Submission failed", error);
    res.status(500).send("Something went wrong");
  }
});

// =================== CODE EXECUTION ROUTE ===================

app.post("/run", async (req, res) => {
  const { language = "cpp", code } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      error: "Code is required",
    });
  }

  try {
    const filePath = generateFile(language, code);
    let output;

    switch (language) {
      case "cpp":
        output = await executeCpp(filePath);
        break;
      case "c":
        output = await executeC(filePath);
        break;
      case "java":
        output = await executeJava(filePath);
        break;
      case "python":
        output = await executePython(filePath);
        break;
      default:
        return res.status(400).json({ error: "Unsupported language" });
    }

    res.json({ filePath, output });
  } catch (err) {
    console.error("Error in running code:", err);
    res.status(500).json({
      success: false,
      error: err.error || "Something went wrong",
    });
  }
});

//problem route

app.get("/problem",async(req,res)=>{
  try{
    const problems = await problem.find({});
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
})
// =================== START SERVER ===================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
