import mongoose from "mongoose";

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true
  }],
  votes: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    option: { type: Number, required: true } // index of the option voted for
  }],
  location: {
    type: String,
    required: true
  },
  lat: Number,
  lng: Number,
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ["active", "closed", "draft"],
    default: "active"
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Poll", pollSchema);