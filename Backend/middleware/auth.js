import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Change from lowercase to uppercase

export const auth = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in Authorization header first
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log('Token found in Authorization header');
    }
    
    // Fallback to cookie if no header token
    if (!token && req.cookies.token) {
      token = req.cookies.token;
      console.log('Token found in cookies');
    }
    
    console.log('Auth middleware - Token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.log('No auth token provided');
      return next(); // Continue without auth for optional auth routes
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully:', decoded);
      
      // FIXED: Use correct field name and handle both _id and id
      const userId = decoded.id || decoded._id;
      const user = await User.findById(userId).select('-password');
      if (!user) {
        console.log('User not found for token');
        return next();
      }
      
      // IMPORTANT: Set both id and _id for compatibility
      req.user = {
        ...user.toObject(),
        id: user._id.toString(),
        _id: user._id
      };
      
      console.log('User authenticated:', user.name, 'ID:', req.user.id);
      next();
    } catch (jwtError) {
      console.log('JWT verification failed:', jwtError.message);
      next(); // Continue without auth
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    next();
  }
};

// Middleware that requires authentication - FIXED
export const requireAuth = async (req, res, next) => {
  // If auth middleware didn't run or failed, try to authenticate here
  if (!req.user) {
    console.log('RequireAuth: No user found, attempting authentication...');
    
    // Try to get token and authenticate
    let token;
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      console.log('RequireAuth: No token found');
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
        console.log('RequireAuth: User not found');
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
      
      console.log('RequireAuth: User authenticated:', user.name);
    } catch (jwtError) {
      console.log('RequireAuth: Token verification failed:', jwtError.message);
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.'
      });
    }
  }
  
  console.log('RequireAuth: User authorized:', req.user.id);
  next();
};

// Alias for requireAuth (for compatibility with different naming conventions)
export const authenticate = requireAuth;

export default auth;
