import Comment from '../models/Comment.js';
import Petition from '../models/Petition.js';
import mongoose from 'mongoose';

// Get all comments for a petition
export const getComments = async (req, res) => {
  try {
    const { petitionId } = req.params;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(petitionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid petition ID'
      });
    }

    const petition = await Petition.findById(petitionId);
    if (!petition) {
      return res.status(404).json({
        success: false,
        message: 'Petition not found'
      });
    }

    const comments = await Comment.find({ petition: petitionId })
      .populate('user', 'name email profilePicture')
      .populate('replies.user', 'name email profilePicture')
      .sort({ createdAt: -1 });

    // Add user interaction flags
    const commentsWithUserData = comments.map(comment => {
      const commentObj = comment.toObject();
      
      if (userId) {
        commentObj.userHasLiked = comment.likes.some(id => id.toString() === userId);
        commentObj.userHasDisliked = comment.dislikes.some(id => id.toString() === userId);
        
        // Add user interaction for replies
        commentObj.replies = commentObj.replies.map(reply => ({
          ...reply,
          userHasLiked: reply.likes.some(id => id.toString() === userId),
          userHasDisliked: reply.dislikes.some(id => id.toString() === userId)
        }));
      }
      
      return commentObj;
    });

    res.json({
      success: true,
      comments: commentsWithUserData,
      count: comments.length
    });

  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comments',
      error: error.message
    });
  }
};

// Add a comment to a petition
export const addComment = async (req, res) => {
  try {
    const { petitionId } = req.params;
    const { text } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(petitionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid petition ID'
      });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    if (text.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Comment must be less than 500 characters'
      });
    }

    const petition = await Petition.findById(petitionId);
    if (!petition) {
      return res.status(404).json({
        success: false,
        message: 'Petition not found'
      });
    }

    const comment = new Comment({
      petition: petitionId,
      user: userId,
      text: text.trim(),
      likes: [],
      dislikes: [],
      replies: []
    });

    await comment.save();
    await comment.populate('user', 'name email profilePicture');

    const commentsCount = await Comment.countDocuments({ petition: petitionId });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: {
        ...comment.toObject(),
        userHasLiked: false,
        userHasDisliked: false
      },
      commentsCount
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

// Like a comment
export const likeComment = async (req, res) => {
  try {
    const { petitionId, commentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const comment = await Comment.findOne({
      _id: commentId,
      petition: petitionId
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const userIdStr = userId.toString();
    const hasLiked = comment.likes.some(id => id.toString() === userIdStr);
    const hasDisliked = comment.dislikes.some(id => id.toString() === userIdStr);

    // Remove dislike if present
    if (hasDisliked) {
      comment.dislikes = comment.dislikes.filter(id => id.toString() !== userIdStr);
    }

    // Toggle like
    if (hasLiked) {
      comment.likes = comment.likes.filter(id => id.toString() !== userIdStr);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    await comment.populate('user', 'name email profilePicture');

    res.json({
      success: true,
      comment: {
        ...comment.toObject(),
        userHasLiked: !hasLiked,
        userHasDisliked: false
      },
      likeCount: comment.likes.length,
      dislikeCount: comment.dislikes.length
    });

  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error liking comment',
      error: error.message
    });
  }
};

// Dislike a comment
export const dislikeComment = async (req, res) => {
  try {
    const { petitionId, commentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const comment = await Comment.findOne({
      _id: commentId,
      petition: petitionId
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const userIdStr = userId.toString();
    const hasLiked = comment.likes.some(id => id.toString() === userIdStr);
    const hasDisliked = comment.dislikes.some(id => id.toString() === userIdStr);

    // Remove like if present
    if (hasLiked) {
      comment.likes = comment.likes.filter(id => id.toString() !== userIdStr);
    }

    // Toggle dislike
    if (hasDisliked) {
      comment.dislikes = comment.dislikes.filter(id => id.toString() !== userIdStr);
    } else {
      comment.dislikes.push(userId);
    }

    await comment.save();
    await comment.populate('user', 'name email profilePicture');

    res.json({
      success: true,
      comment: {
        ...comment.toObject(),
        userHasLiked: false,
        userHasDisliked: !hasDisliked
      },
      likeCount: comment.likes.length,
      dislikeCount: comment.dislikes.length
    });

  } catch (error) {
    console.error('Dislike comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error disliking comment',
      error: error.message
    });
  }
};

// Add reply to a comment
export const addReply = async (req, res) => {
  try {
    const { petitionId, commentId } = req.params;
    const { text } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply text is required'
      });
    }

    if (text.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Reply must be less than 500 characters'
      });
    }

    const comment = await Comment.findOne({
      _id: commentId,
      petition: petitionId
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const reply = {
      user: userId,
      text: text.trim(),
      likes: [],
      dislikes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    comment.replies.push(reply);
    await comment.save();
    await comment.populate('user', 'name email profilePicture');
    await comment.populate('replies.user', 'name email profilePicture');

    const addedReply = comment.replies[comment.replies.length - 1];

    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      reply: {
        ...addedReply.toObject(),
        userHasLiked: false,
        userHasDisliked: false
      },
      replyCount: comment.replies.length
    });

  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding reply',
      error: error.message
    });
  }
};

// Like a reply
export const likeReply = async (req, res) => {
  try {
    const { petitionId, commentId, replyId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const comment = await Comment.findOne({
      _id: commentId,
      petition: petitionId
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    const userIdStr = userId.toString();
    const hasLiked = reply.likes.some(id => id.toString() === userIdStr);
    const hasDisliked = reply.dislikes.some(id => id.toString() === userIdStr);

    // Remove dislike if present
    if (hasDisliked) {
      reply.dislikes = reply.dislikes.filter(id => id.toString() !== userIdStr);
    }

    // Toggle like
    if (hasLiked) {
      reply.likes = reply.likes.filter(id => id.toString() !== userIdStr);
    } else {
      reply.likes.push(userId);
    }

    await comment.save();

    res.json({
      success: true,
      reply: {
        ...reply.toObject(),
        userHasLiked: !hasLiked,
        userHasDisliked: false
      },
      likeCount: reply.likes.length,
      dislikeCount: reply.dislikes.length
    });

  } catch (error) {
    console.error('Like reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Error liking reply',
      error: error.message
    });
  }
};

// Dislike a reply
export const dislikeReply = async (req, res) => {
  try {
    const { petitionId, commentId, replyId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const comment = await Comment.findOne({
      _id: commentId,
      petition: petitionId
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    const userIdStr = userId.toString();
    const hasLiked = reply.likes.some(id => id.toString() === userIdStr);
    const hasDisliked = reply.dislikes.some(id => id.toString() === userIdStr);

    // Remove like if present
    if (hasLiked) {
      reply.likes = reply.likes.filter(id => id.toString() !== userIdStr);
    }

    // Toggle dislike
    if (hasDisliked) {
      reply.dislikes = reply.dislikes.filter(id => id.toString() !== userIdStr);
    } else {
      reply.dislikes.push(userId);
    }

    await comment.save();

    res.json({
      success: true,
      reply: {
        ...reply.toObject(),
        userHasLiked: false,
        userHasDisliked: !hasDisliked
      },
      likeCount: reply.likes.length,
      dislikeCount: reply.dislikes.length
    });

  } catch (error) {
    console.error('Dislike reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Error disliking reply',
      error: error.message
    });
  }
};

// Delete a reply
export const deleteReply = async (req, res) => {
  try {
    const { petitionId, commentId, replyId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const comment = await Comment.findOne({
      _id: commentId,
      petition: petitionId
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    // Get petition to check if user is the creator
    const petition = await Petition.findById(petitionId);
    const isPetitionCreator = petition && petition.creator.toString() === userId;
    const isReplyAuthor = reply.user.toString() === userId;
    const isCommentAuthor = comment.user.toString() === userId;

    // Allow deletion if user is reply author, comment author, or petition creator
    if (!isReplyAuthor && !isCommentAuthor && !isPetitionCreator) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own replies'
      });
    }

    reply.deleteOne();
    await comment.save();

    res.json({
      success: true,
      message: 'Reply deleted successfully',
      replyCount: comment.replies.length
    });

  } catch (error) {
    console.error('Delete reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting reply',
      error: error.message
    });
  }
};

// Update a comment
export const updateComment = async (req, res) => {
  try {
    const { petitionId, commentId } = req.params;
    const { text } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    if (text.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Comment must be less than 500 characters'
      });
    }

    const comment = await Comment.findOne({
      _id: commentId,
      petition: petitionId
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (comment.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own comments'
      });
    }

    comment.text = text.trim();
    comment.isEdited = true;
    comment.editedAt = new Date();
    
    await comment.save();
    await comment.populate('user', 'name email profilePicture');

    res.json({
      success: true,
      message: 'Comment updated successfully',
      comment
    });

  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating comment',
      error: error.message
    });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { petitionId, commentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const comment = await Comment.findOne({
      _id: commentId,
      petition: petitionId
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const petition = await Petition.findById(petitionId);
    const isPetitionCreator = petition && petition.creator.toString() === userId;
    const isCommentAuthor = comment.user.toString() === userId;

    if (!isCommentAuthor && !isPetitionCreator) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments or comments on your petitions'
      });
    }

    await comment.deleteOne();

    const commentsCount = await Comment.countDocuments({ petition: petitionId });

    res.json({
      success: true,
      message: 'Comment deleted successfully',
      commentsCount
    });

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
      error: error.message
    });
  }
};

// Get comment count for a petition
export const getCommentCount = async (req, res) => {
  try {
    const { petitionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(petitionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid petition ID'
      });
    }

    const count = await Comment.countDocuments({ petition: petitionId });

    res.json({
      success: true,
      count
    });

  } catch (error) {
    console.error('Get comment count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comment count',
      error: error.message
    });
  }
};

// Get user's comments
export const getUserComments = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const comments = await Comment.find({ user: userId })
      .populate('petition', 'title status')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      comments,
      count: comments.length
    });

  } catch (error) {
    console.error('Get user comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user comments',
      error: error.message
    });
  }
};