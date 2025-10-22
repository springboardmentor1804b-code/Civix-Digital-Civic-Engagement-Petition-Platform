import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// Import routes
import authRoutes from "./routes/auth-route.js";
import userRoutes from "./routes/user-route.js";
import petitionRoutes from "./routes/petition-route.js";
import signatureRoutes from "./routes/signature-route.js";
import pollRoutes from "./routes/poll-route.js";
import adminLogRoutes from "./routes/adminLog-route.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Cookie parser before routes
app.use(cookieParser());
app.use(express.json());

// CORS setup with whitelist (supports comma-separated origins)
const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map(o => o.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow non-browser requests (no origin) and whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log("Cookies:", req.cookies);
  console.log(
    "Headers:",
    req.headers.authorization ? "Has auth header" : "No auth header"
  );
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/petitions", petitionRoutes);
app.use("/api/signatures", signatureRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/admin-logs", adminLogRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

export default app;