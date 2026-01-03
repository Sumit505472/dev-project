import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const isProduction = process.env.NODE_ENV === "production";

export const register = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    if (!(fullname && email && password)) {
      return res.status(400).send("Please fill all the required fields");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).send("User already exists with this email");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullname,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: newUser._id, email },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

   res.cookie("token", token, {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "None" : "Lax",
  domain: isProduction ? ".codedge.online" : undefined,
  maxAge: 24 * 60 * 60 * 1000,
});

    res.status(200).json({
      success: true,
      message: "You have successfully registered",
    });
  } catch (error) {
    console.error("Registration failed", error);
    res.status(500).send("Something went wrong");
  }
};

export const login = async (req, res) => {
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

    const isPasswordCorrect = await bcrypt.compare(
      password,
      userExists.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).send("Incorrect password");
    }

    const token = jwt.sign(
      { id: userExists._id },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "None" : "Lax",
  domain: isProduction ? ".codedge.online" : undefined,
  maxAge: 24 * 60 * 60 * 1000,
});

    res.status(200).json({
      success: true,
      message: "You have successfully logged in!",
      token,
    });
  } catch (error) {
    console.error("Login failed", error);
    res.status(500).send("Something went wrong");
  }
};

export const me = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not logged in" });
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
};
export const logout = (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      domain: isProduction ? ".codedge.online" : undefined,
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

