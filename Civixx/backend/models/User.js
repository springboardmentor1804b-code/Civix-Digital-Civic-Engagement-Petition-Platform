import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    location: { type: String, required: true },
    role: { type: String, required: true },
  },
  { timestamps: true, collection: "Users_auth" }
);

export default mongoose.model("User", userSchema);
