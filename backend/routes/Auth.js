import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// ============================
// Register
// ============================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, location, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      location,
      role,
    });
    await newUser.save();

    const token = generateToken(newUser._id);

    // Use "authToken" cookie
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: isProduction, // Only secure in production (HTTPS)
      sameSite: isProduction ? "none" : "strict", // Allow cross-site in production
      maxAge: 60 * 60 * 1000,
      domain: isProduction ? undefined : undefined, // Let browser handle domain
    });

    res.status(201).json({
      msg: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        location: newUser.location,
        role: newUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================
// Login
// ============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

    const token = generateToken(user._id);

    // Use "authToken" cookie
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: isProduction, // Only secure in production (HTTPS)
      sameSite: isProduction ? "none" : "strict", // Allow cross-site in production
      maxAge: 60 * 60 * 1000,
      domain: isProduction ? undefined : undefined, // Let browser handle domain
    });

    res.json({
      msg: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================
// Logout
// ============================
router.post("/logout", (req, res) => {
  res.clearCookie("authToken");
  res.json({ msg: "Logged out successfully" });
});

// ============================
// Protected Route (Test JWT)
// ============================
const authMiddleware = (req, res, next) => {
  const token = req.cookies.authToken;
  if (!token)
    return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
