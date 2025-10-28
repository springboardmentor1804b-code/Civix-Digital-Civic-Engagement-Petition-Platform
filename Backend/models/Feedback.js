import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: [10, "Message must be at least 10 characters"],
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      enum: ["bug", "feature", "question", "complaint", "suggestion", "other"],
      default: "other",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewing", "resolved", "closed"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    response: {
      message: String,
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      respondedAt: Date,
    },
    attachments: [
      {
        filename: String,
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    metadata: {
      browser: String,
      os: String,
      deviceType: String,
      userAgent: String,
      ipAddress: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
feedbackSchema.index({ user: 1, createdAt: -1 });
feedbackSchema.index({ status: 1, priority: -1 });
feedbackSchema.index({ category: 1 });

export default mongoose.model("Feedback", feedbackSchema);