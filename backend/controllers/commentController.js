import Comment from "../models/Comment.js";
import Petition from "../models/Petition.js";

// @desc    Create a new comment on a petition
// @route   POST /api/petitions/:id/comments
// @access  Private
export const createComment = async (req, res) => {
    const { text } = req.body;
    const petitionId = req.params.id;
    const userId = req.user.id;

    if (!text || text.trim() === '') {
        return res.status(400).json({ message: "Comment text is required." });
    }

    try {
        const petitionExists = await Petition.findById(petitionId);

        if (!petitionExists) {
            return res.status(404).json({ message: "Petition not found." });
        }

        const comment = new Comment({
            petition: petitionId,
            user: userId,
            text,
        });

        const createdComment = await comment.save();
        
        // Populate user details (name and role for badge) before sending back
        await createdComment.populate('user', 'name role'); 

        res.status(201).json(createdComment);

    } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({ message: "Server Error during comment creation." });
    }
};


// @desc    Get all comments for a specific petition
// @route   GET /api/petitions/:id/comments
// @access  Public
export const getComments = async (req, res) => {
    const petitionId = req.params.id;

    try {
        const comments = await Comment.find({ petition: petitionId })
            .sort({ createdAt: -1 }) // Newest comments first
            .populate('user', 'name role'); // Populate user details for display

        res.json(comments);

    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: "Server Error fetching comments." });
    }
};