import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const auth = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in Authorization header first
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Fallback to cookie if no header token
    if (!token && req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return next(); // Continue without auth for optional auth routes
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const userId = decoded.id || decoded._id;
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return next();
      }
      
      // Set both id and _id for compatibility
      req.user = {
        ...user.toObject(),
        id: user._id.toString(),
        _id: user._id
      };
      
      next();
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      next(); // Continue without auth
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    next();
  }
};

// Middleware that requires authentication
export const requireAuth = async (req, res, next) => {
  // If auth middleware didn't run or failed, try to authenticate here
  if (!req.user) {
    // Try to get token and authenticate
    let token;
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id || decoded._id;
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. User not found.'
        });
      }
      
      req.user = {
        ...user.toObject(),
        id: user._id.toString(),
        _id: user._id
      };
      
    } catch (jwtError) {
      console.error('RequireAuth: Token verification failed:', jwtError.message);
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.'
      });
    }
  }
  
  next();
};

// Alias for requireAuth (for compatibility with different naming conventions)
export const authenticate = requireAuth;

export default auth;
