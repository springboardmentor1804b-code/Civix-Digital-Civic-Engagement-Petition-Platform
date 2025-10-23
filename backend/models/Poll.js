import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 },
});

const pollSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    description: { type: String },
    options: [optionSchema],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    location: { type: String, required: true },
    votedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Poll = mongoose.model("Poll", pollSchema);
export default Poll;
