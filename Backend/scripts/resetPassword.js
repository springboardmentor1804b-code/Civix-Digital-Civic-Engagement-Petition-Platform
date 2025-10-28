import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function resetPassword(email, newPassword) {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.error('User not found');
      process.exit(1);
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update directly bypassing middleware
    await User.findByIdAndUpdate(
      user._id,
      { $set: { password: hashedPassword } },
      { new: true }
    );

    // Verify the password works
    const updatedUser = await User.findOne({ email }).select('+password');
    const isMatch = await bcrypt.compare(newPassword, updatedUser.password);
    if (!isMatch) {
      console.error('Password verification failed');
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Get email and password from command line
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node resetPassword.js <email> <password>');
  process.exit(1);
}

resetPassword(email, password);