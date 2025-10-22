import mongoose from "mongoose";

const SignatureSchema = new mongoose.Schema({
  petition: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Petition", 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
}, { 
  timestamps: true 
});

// Create compound index to prevent duplicate signatures - CORRECT FIELD NAMES
SignatureSchema.index({ petition: 1, user: 1 }, { unique: true });

export default mongoose.model("Signature", SignatureSchema);
