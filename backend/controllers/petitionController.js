import Petition from "../models/Petition.js";
import User from "../models/User.js";
import path from "path";
import fs from "fs";

// --- Existing Functions (No Changes Needed) ---

export const createPetition = async (req, res) => {
  const { title, description, category, signatureGoal, location } = req.body;
  try {
    const newPetition = new Petition({
      title,
      description,
      category,
      location,
      goal: signatureGoal,
      owner: req.user.id,
      supportingFiles: [],
      comments: []
    });
    const savedPetition = await newPetition.save();
    res.status(201).json(savedPetition);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getPetitions = async (req, res) => {
  try {
    const petitions = await Petition.find({})
      .sort({ createdAt: -1 })
      .populate("owner", "name");
    res.json(petitions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const signPetition = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (petition) {
      if (petition.signatures.includes(req.user.id)) {
        return res
          .status(400)
          .json({ message: "You have already signed this petition" });
      }
      petition.signatures.push(req.user.id);
      const updatedPetition = await petition.save();
      res.json(updatedPetition);
    } else {
      res.status(404).json({ message: "Petition not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getPetitionById = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id)
      .populate("owner", "name")
      .populate("comments.user", "name");
    if (petition) {
      res.json(petition);
    } else {
      res.status(404).json({ message: "Petition not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updatePetition = async (req, res) => {
  const { title, description, category } = req.body;
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ message: "Petition not found" });
    }
    if (petition.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized" });
    }
    petition.title = title || petition.title;
    petition.description = description || petition.description;
    petition.category = category || petition.category;
    const updatedPetition = await petition.save();
    res.json(updatedPetition);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const deletePetition = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ message: "Petition not found" });
    }
    if (petition.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized" });
    }
    await petition.deleteOne();
    res.json({ message: "Petition removed" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getPetitionsForOfficial = async (req, res) => {
  try {
    const location = req.user.location;
    const petitions = await Petition.find({ location: location })
      .sort({ createdAt: -1 })
      .populate("owner", "name");
    res.json(petitions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update the status of a petition by an official
// @route   PUT /api/petitions/:id/status
// @access  Private/Official
export const updatePetitionStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ message: "Petition not found" });
    }

    // Allow "Public Official" to update across any location; otherwise enforce same-location policy.
    const isPublicOfficial =
      req.user?.role === "Public Official" || req.user?.role === "public official";

    if (!isPublicOfficial) {
      // Case-insensitive location comparison for other officials
      if (
        petition.location?.toLowerCase?.() !== req.user?.location?.toLowerCase?.()
      ) {
        return res.status(403).json({
          message: "Not authorized to update petitions in this location.",
        });
      }
    }
    petition.status = status;
    petition.officialResponse = {
      comment: `Status updated to ${status} by an official.`,
      status: status,
      officialId: req.user.id,
      date: new Date(),
    };
    const updatedPetition = await petition.save();
    res.json(updatedPetition);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get trending petitions based on recent activity and engagement
// @route   GET /api/petitions/trending
// @access  Private
export const getTrendingPetitions = async (req, res) => {
  try {
    const { limit = 20, timeWindow = '7d' } = req.query;
    
    // Calculate time window
    let timeWindowMs;
    switch (timeWindow) {
      case '1d':
        timeWindowMs = 24 * 60 * 60 * 1000; // 1 day
        break;
      case '3d':
        timeWindowMs = 3 * 24 * 60 * 60 * 1000; // 3 days
        break;
      case '7d':
        timeWindowMs = 7 * 24 * 60 * 60 * 1000; // 7 days
        break;
      case '30d':
        timeWindowMs = 30 * 24 * 60 * 60 * 1000; // 30 days
        break;
      default:
        timeWindowMs = 7 * 24 * 60 * 60 * 1000; // default 7 days
    }

    const cutoffDate = new Date(Date.now() - timeWindowMs);
    
    // First, let's check all active petitions regardless of time window
    const allActivePetitions = await Petition.find({
      status: 'Active'
    })
    .populate("owner", "name")
    .lean();

    console.log(`Total active petitions: ${allActivePetitions.length}`);
    
    // Filter for petitions with signatures and show their details
    const petitionsWithSignatures = allActivePetitions.filter(p => p.signatures && p.signatures.length > 0);
    console.log(`Active petitions with signatures: ${petitionsWithSignatures.length}`);
    
    petitionsWithSignatures.forEach(p => {
      console.log(`- "${p.title}": ${p.signatures.length} signatures, created: ${p.createdAt}`);
    });

    // Get petitions for trending (relaxed criteria for now)
    const petitions = await Petition.find({
      status: 'Active', // Only active petitions
      $expr: { $gt: [{ $size: '$signatures' }, 0] } // Only petitions with at least 1 signature
    })
    .populate("owner", "name")
    .lean();

    console.log(`Found ${petitions.length} active petitions with signatures for trending`);

    // Calculate trending score for each petition
    const petitionsWithScore = petitions.map(petition => {
      const now = new Date();
      const createdAt = new Date(petition.createdAt);
      const ageInHours = (now - createdAt) / (1000 * 60 * 60);
      const signatureCount = petition.signatures.length;
      
      // Primary factor: Signature count (weighted heavily)
      const signatureScore = signatureCount * 10; // 10 points per signature
      
      // Recency score (newer petitions get higher score, but less weight)
      const recencyScore = Math.max(0, 50 - ageInHours * 1); // Decreases by 1 point per hour
      
      // Velocity score (signatures per hour) - only if petition is recent
      const velocityScore = ageInHours > 0 && ageInHours < 168 ? (signatureCount / ageInHours) * 5 : 0;
      
      // Goal achievement bonus (percentage of goal reached)
      const goalScore = petition.goal > 0 ? (signatureCount / petition.goal) * 20 : 0;
      
      // Minimum threshold bonus (petitions with 3+ signatures get extra points)
      const thresholdBonus = signatureCount >= 3 ? 15 : 0;
      
      // Calculate final trending score
      const trendingScore = signatureScore + recencyScore + velocityScore + goalScore + thresholdBonus;
      
      console.log(`Petition "${petition.title}": ${signatureCount} signatures, ${Math.round(ageInHours)}h old, score: ${Math.round(trendingScore)}`);
      
      return {
        ...petition,
        trendingScore: Math.round(trendingScore * 100) / 100
      };
    });

    // Sort by trending score (highest first)
    const trendingPetitions = petitionsWithScore
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, parseInt(limit));

    res.json(trendingPetitions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Upload supporting files for a petition
// @route   POST /api/petitions/:id/files
// @access  Private
export const uploadSupportingFiles = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ message: "Petition not found" });
    }

    // Check if user is the owner
    if (petition.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized to upload files for this petition" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/petitions/${file.filename}`,
      uploadedAt: new Date()
    }));

    petition.supportingFiles.push(...uploadedFiles);
    await petition.save();

    res.json({ 
      message: "Files uploaded successfully", 
      files: uploadedFiles 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete a supporting file from a petition
// @route   DELETE /api/petitions/:id/files/:fileId
// @access  Private
export const deleteSupportingFile = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ message: "Petition not found" });
    }

    // Check if user is the owner
    if (petition.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized to delete files from this petition" });
    }

    const fileId = req.params.fileId;
    const fileIndex = petition.supportingFiles.findIndex(file => file._id.toString() === fileId);
    
    if (fileIndex === -1) {
      return res.status(404).json({ message: "File not found" });
    }

    const file = petition.supportingFiles[fileIndex];
    
    // Delete file from filesystem
    const filePath = path.join('uploads/petitions', file.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove file from database
    petition.supportingFiles.splice(fileIndex, 1);
    await petition.save();

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Add a comment to a petition
// @route   POST /api/petitions/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ message: "Petition not found" });
    }

    const comment = {
      user: req.user.id,
      text: text.trim(),
      createdAt: new Date()
    };

    petition.comments.push(comment);
    await petition.save();

    // Populate the user details for the new comment
    await petition.populate('comments.user', 'name');

    const newComment = petition.comments[petition.comments.length - 1];
    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete a comment from a petition
// @route   DELETE /api/petitions/:id/comments/:commentId
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ message: "Petition not found" });
    }

    const commentId = req.params.commentId;
    const commentIndex = petition.comments.findIndex(comment => comment._id.toString() === commentId);
    
    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const comment = petition.comments[commentIndex];
    
    // Check if user is the comment author or petition owner
    if (comment.user.toString() !== req.user.id && petition.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized to delete this comment" });
    }

    petition.comments.splice(commentIndex, 1);
    await petition.save();

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
