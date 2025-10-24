import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        petition: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Petition",
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        text: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;