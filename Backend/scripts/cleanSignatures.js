import mongoose from 'mongoose';
import Signature from '../models/Signature.js';
import dotenv from 'dotenv';

dotenv.config();

const cleanSignatures = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Remove any signatures with null petition or user
    await Signature.deleteMany({
      $or: [
        { petition: null },
        { user: null },
        { petition: { $exists: false } },
        { user: { $exists: false } }
      ]
    });

    // Create the proper index
    await Signature.collection.createIndex({ petition: 1, user: 1 }, { unique: true });

    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
};

cleanSignatures();