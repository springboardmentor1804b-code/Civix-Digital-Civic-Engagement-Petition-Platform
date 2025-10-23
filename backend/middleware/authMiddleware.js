import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  // Debug logging
  console.log("Auth Middleware - Request headers:", req.headers);
  console.log("Auth Middleware - Cookies:", req.cookies);
  console.log("Auth Middleware - NODE_ENV:", process.env.NODE_ENV);

  token = req.cookies.authToken;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Auth Middleware - Token decoded successfully:", decoded);

      req.user = await User.findById(decoded.id).select("-password");

      if (req.user) {
        console.log("Auth Middleware - User found:", req.user.email);
        return next();
      } else {
        console.log("Auth Middleware - User not found in database");
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }
    } catch (error) {
      console.error("Auth Middleware - Token verification failed:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    console.log("Auth Middleware - No token found in cookies");
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};
