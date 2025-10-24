import mongoose from "mongoose";

const petitionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ["Active", "Under Review", "Closed"],
      default: "Active",
    },
    goal: { type: Number, required: true, default: 100 },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    signatures: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        signedAt: {
          type: Date,
          default: Date.now,
        },
        _id: false, 
      },
    ],
    // 💡 NEW FIELD: Array to store file paths/URLs for images and documents
    enclosures: [
        {
            type: String 
        }
    ]
  },
  { timestamps: true }
);

const Petition = mongoose.model("Petition", petitionSchema);
export default Petition;