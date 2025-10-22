import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const requireOfficial = async (req, res, next) => {
  try {
    // First check if user is authenticated
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. User not found."
      });
    }

    // Check if user has official role
    const officialRoles = ['public_official', 'admin', 'moderator'];
    
    if (!officialRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Official role required."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Official auth error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token."
    });
  }
};

// Alias for compatibility
export const verifyOfficial = requireOfficial;

// Keep default export for backward compatibility
export default requireOfficial;