import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import connectDB from "./config/db.js";
import authRoutes from "./routes/Auth.js";
import petitionRoutes from "./routes/petitionRoutes.js";
import pollRoutes from "./routes/pollRoutes.js";
import errorHandler from "./middleware/errorMiddleware.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

dotenv.config();
const app = express();

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// Define an array of all allowed frontend URLs
const allowedOrigins = [
  process.env.CLIENT_URL, // Your local dev URL (e.g., http://localhost:5173)
  process.env.CLIENT_URL_PROD, // Your live Render frontend URL
];

// Filter out undefined values
const validOrigins = allowedOrigins.filter((origin) => origin);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if origin is in our allowed list
      if (validOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Log the origin for debugging
      console.log("CORS: Checking origin:", origin);
      console.log("CORS: Allowed origins:", validOrigins);

      // In production, be more permissive for debugging
      if (process.env.NODE_ENV === "production") {
        console.log("CORS: Allowing origin in production mode:", origin);
        return callback(null, true);
      }

      console.error("CORS Error: Origin not allowed ->", origin);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/petitions", petitionRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});
