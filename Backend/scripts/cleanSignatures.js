import mongoose from 'mongoose';
import Signature from '../models/Signature.js';
import dotenv from 'dotenv';

dotenv.config();

const cleanSignatures = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Remove any signatures with null petition or user
    const deleteResult = await Signature.deleteMany({
      $or: [
        { petition: null },
        { user: null },
        { petition: { $exists: false } },
        { user: { $exists: false } }
      ]
    });
    
    console.log(`Deleted ${deleteResult.deletedCount} invalid signatures`);

    // Create the proper index
    await Signature.collection.createIndex({ petition: 1, user: 1 }, { unique: true });
    console.log('Created proper compound index');

    console.log('Cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
};

cleanSignatures();