import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '7d'
  });
};

// Register user
export const register = async (req, res) => {
  try {
    const { name, email, password, location, role, department, position } = req.body;

    if (!name || !email || !password || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const userData = {
      name,
      email,
      password,
      location,
      role: role || 'citizen'
    };

    if (role === 'public-official') {
      userData.department = department;
      userData.position = position;
      userData.verified = true; // AUTO-VERIFY PUBLIC OFFICIALS
    }

    const user = new User(userData);
    await user.save();

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      department: user.department,
      position: user.position,
      verified: user.verified
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// Login user - REMOVE VERIFICATION CHECK
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // REMOVED VERIFICATION CHECK - ALL USERS CAN LOGIN
    // if (user.role === 'public-official' && !user.verified) {
    //   return res.status(403).json({ 
    //     success: false,
    //     message: 'Your account is pending verification.' 
    //   });
    // }

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      department: user.department,
      position: user.position,
      verified: user.verified
    };

    res.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0)
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        department: user.department,
        position: user.position,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { name, location } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (name) user.name = name;
    if (location) user.location = location;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile', 
      error: error.message 
    });
  }
};

// Create official
export const createOfficial = async (req, res) => {
  try {
    const { name, email, password, location, department, position } = req.body;
    
    const official = new User({
      name,
      email,
      password,
      location,
      role: 'public-official',
      department,
      position,
      verified: true
    });

    await official.save();
    
    res.json({ 
      success: true, 
      message: "Public Official account created successfully"
    });
  } catch (error) {
    console.error('Create official error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error creating official account",
      error: error.message
    });
  }
};
