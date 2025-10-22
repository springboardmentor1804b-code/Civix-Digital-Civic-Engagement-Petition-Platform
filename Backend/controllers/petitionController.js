import Petition from "../models/Petition.js";
import Signature from "../models/Signature.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { logAdminAction } from "./adminLogController.js";

// Get all petitions (alias for compatibility)
export const getPetitions = async (req, res) => {
  return getAllPetitions(req, res);
};

// Get all petitions with signature counts
export const getAllPetitions = async (req, res) => {
  try {
    console.log('=== GET ALL PETITIONS ===');
    console.log('User from auth:', req.user);
    
    const userId = req.user?.id || req.user?._id;
    
    // Get all petitions with creator info
    const petitions = await Petition.find()
      .populate('creator', 'name email')
      .sort({ createdAt: -1 });

    // Get signature counts for all petitions
    const petitionIds = petitions.map(p => p._id);
    const signatureCounts = await Signature.aggregate([
      { $match: { petition: { $in: petitionIds } } },
      { $group: { _id: "$petition", count: { $sum: 1 } } }
    ]);

    // Get user's signed petitions if authenticated
    let userSignedPetitions = [];
    if (userId) {
      console.log('Checking signatures for user:', userId);
      const userSignatures = await Signature.find({ user: userId });
      userSignedPetitions = userSignatures.map(sig => sig.petition.toString());
      console.log('User signed petitions:', userSignedPetitions.length);
    }

    // Map signature counts to petitions
    const petitionsWithCounts = petitions.map(petition => {
      const signatureData = signatureCounts.find(
        sc => sc._id.toString() === petition._id.toString()
      );
      
      const signaturesCount = signatureData ? signatureData.count : 0;
      const userHasSigned = userSignedPetitions.includes(petition._id.toString());

      return {
        ...petition.toObject(),
        signaturesCount,
        userHasSigned,
        signedByCurrentUser: userHasSigned
      };
    });

    console.log(`Returning ${petitionsWithCounts.length} petitions with signature counts`);
    
    // Log sample for debugging
    if (petitionsWithCounts.length > 0) {
      console.log('Sample petition with signature data:', {
        id: petitionsWithCounts[0]._id,
        title: petitionsWithCounts[0].title,
        signaturesCount: petitionsWithCounts[0].signaturesCount,
        userHasSigned: petitionsWithCounts[0].userHasSigned
      });
    }

    res.json({
      success: true,
      petitions: petitionsWithCounts,
      total: petitionsWithCounts.length
    });

  } catch (error) {
    console.error("Error fetching petitions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching petitions",
      error: error.message
    });
  }
};

// Create petition - MISSING FUNCTION
export const createPetition = async (req, res) => {
  try {
    const { title, description, category, location, signatureGoal } = req.body;
    const userId = req.user?.id;

    console.log('Creating petition:', { title, category, location, userId });

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to create petition'
      });
    }

    if (!title || !description || !category || !location || !signatureGoal) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const petition = new Petition({
      title: title.trim(),
      description: description.trim(),
      category,
      location: location.trim(),
      signatureGoal: parseInt(signatureGoal),
      creator: userId,
      status: 'active'
    });

    await petition.save();
    await petition.populate('creator', 'name email');

    console.log('Petition created successfully:', petition._id);

    res.status(201).json({
      success: true,
      message: 'Petition created successfully',
      petition: {
        ...petition.toObject(),
        signaturesCount: 0,
        userHasSigned: false
      }
    });

  } catch (error) {
    console.error('Create petition error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating petition',
      error: error.message
    });
  }
};

// Sign a petition - COMPLETELY FIXED VERSION
export const signPetition = async (req, res) => {
  try {
    const petitionId = req.params.id;
    const userId = req.user?.id || req.user?._id;
    
    console.log('=== PETITION SIGNING DEBUG ===');
    console.log('Petition ID:', petitionId);
    console.log('User ID:', userId);
    console.log('User object:', req.user);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required. Please login again.'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(petitionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    // Check if petition exists
    const petition = await Petition.findById(petitionId);
    if (!petition) {
      return res.status(404).json({
        success: false,
        message: 'Petition not found'
      });
    }

    console.log('Petition found:', petition.title);

    // Check if user is the petition creator
    if (petition.creator.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot sign your own petition'
      });
    }

    // Check if user already signed this petition
    const existingSignature = await Signature.findOne({
      petition: petitionId,
      user: userId
    });

    if (existingSignature) {
      const totalSignatures = await Signature.countDocuments({ petition: petitionId });
      return res.status(400).json({
        success: false,
        message: 'You have already signed this petition',
        signatureCount: totalSignatures
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User found:', user.name);

    // Create new signature - FIXED: Proper ObjectId handling
    const signature = new Signature({
      petition: petitionId,
      user: userId
    });

    const savedSignature = await signature.save();
    console.log('Signature saved successfully:', savedSignature._id);

    // Get updated signature count
    const totalSignatures = await Signature.countDocuments({ petition: petitionId });
    console.log('Total signatures for petition:', totalSignatures);

    res.json({
      success: true,
      message: 'Petition signed successfully',
      signatureCount: totalSignatures,
      signature: {
        id: savedSignature._id,
        createdAt: savedSignature.createdAt
      }
    });

  } catch (error) {
    console.error('=== PETITION SIGNING ERROR ===');
    console.error('Error details:', error);
    
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      try {
        const totalSignatures = await Signature.countDocuments({ petition: req.params.id });
        return res.status(400).json({
          success: false,
          message: 'You have already signed this petition',
          signatureCount: totalSignatures
        });
      } catch (countError) {
        console.error('Error counting signatures:', countError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while signing petition',
      error: error.message
    });
  }
};

// Get petition by ID - Updated to use Signature collection
export const getPetitionById = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id)
      .populate('creator', 'name email role');

    if (!petition) {
      return res.status(404).json({
        success: false,
        message: 'Petition not found'
      });
    }

    // Get signature count and signatures from Signature collection
    const signatureCount = await Signature.countDocuments({ petition: req.params.id });
    const signatures = await Signature.find({ petition: req.params.id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // Check if current user has signed
    let userHasSigned = false;
    if (req.user) {
      const userSignature = await Signature.findOne({ 
        petition: req.params.id, 
        user: req.user.id 
      });
      userHasSigned = !!userSignature;
    }

    const petitionWithSignatures = {
      ...petition.toObject(),
      signaturesCount: signatureCount,
      signatures: signatures,
      userHasSigned: userHasSigned,
      signedByCurrentUser: userHasSigned
    };

    res.json({
      success: true,
      petition: petitionWithSignatures
    });
  } catch (error) {
    console.error('Get petition by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching petition",
      error: error.message 
    });
  }
};

// Update/Edit petition - FIXED FUNCTION NAME
export const editPetition = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({
        success: false,
        message: "Petition not found"
      });
    }

    if (petition.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the creator can edit this petition"
      });
    }

    // Only allow editing certain fields
    const allowedUpdates = ['title', 'description', 'category', 'location', 'signatureGoal'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    Object.assign(petition, updates);
    await petition.save();

    // Get updated petition with signature count
    const signatureCount = await Signature.countDocuments({ petition: petition._id });

    res.json({ 
      success: true,
      message: "Petition updated successfully", 
      petition: {
        ...petition.toObject(),
        signaturesCount: signatureCount
      }
    });
  } catch (err) {
    console.error("Error editing petition:", err);
    res.status(500).json({ 
      success: false,
      message: "Error editing petition", 
      error: err.message 
    });
  }
};

// Delete petition - Also delete associated signatures
export const deletePetition = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({
        success: false,
        message: "Petition not found"
      });
    }

    if (petition.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the creator can delete this petition"
      });
    }

    // Delete the petition
    await petition.deleteOne();
    
    // Delete all associated signatures from Signature collection
    await Signature.deleteMany({ petition: req.params.id });
    console.log('Deleted petition and associated signatures');

    res.json({ 
      success: true,
      message: "Petition deleted successfully" 
    });
  } catch (err) {
    console.error("Error deleting petition:", err);
    res.status(500).json({ 
      success: false,
      message: "Error deleting petition", 
      error: err.message 
    });
  }
};

// Get analytics for public officials - FIXED WITH ERROR HANDLING
export const getOfficialAnalytics = async (req, res) => {
  try {
    console.log('Fetching official analytics...');

    // Basic overview counts
    const totalPetitions = await Petition.countDocuments();
    const activePetitions = await Petition.countDocuments({ status: 'active' });
    const reviewedPetitions = await Petition.countDocuments({ status: 'under_review' });
    const closedPetitions = await Petition.countDocuments({ status: 'closed' });

    console.log('Overview counts:', { totalPetitions, activePetitions, reviewedPetitions, closedPetitions });

    // Petitions by category with error handling
    let petitionsByCategory = [];
    try {
      petitionsByCategory = await Petition.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
    } catch (err) {
      console.error('Error in petitionsByCategory aggregation:', err);
      petitionsByCategory = [];
    }

    // Petitions by location (top 10) with error handling
    let petitionsByLocation = [];
    try {
      petitionsByLocation = await Petition.aggregate([
        { $group: { _id: '$location', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
    } catch (err) {
      console.error('Error in petitionsByLocation aggregation:', err);
      petitionsByLocation = [];
    }

    // Date range for trending data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Trending petitions with error handling
    let trendingPetitions = [];
    try {
      trendingPetitions = await Petition.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $lookup: {
            from: 'signatures',
            localField: '_id',
            foreignField: 'petition',
            as: 'signatures'
          }
        },
        {
          $addFields: {
            signatureCount: { $size: '$signatures' }
          }
        },
        {
          $sort: { signatureCount: -1 }
        },
        {
          $limit: 10
        },
        {
          $lookup: {
            from: 'users',
            localField: 'creator',
            foreignField: '_id',
            as: 'creator'
          }
        },
        {
          $unwind: {
            path: '$creator',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            title: 1,
            category: 1,
            location: 1,
            signatureCount: 1,
            'creator.name': 1,
            createdAt: 1
          }
        }
      ]);
    } catch (err) {
      console.error('Error in trendingPetitions aggregation:', err);
      trendingPetitions = [];
    }

    // Signature trends with error handling
    let signatureTrends = [];
    try {
      // Check if Signature model exists
      const signatureExists = await mongoose.connection.db.listCollections({ name: 'signatures' }).hasNext();
      
      if (signatureExists) {
        signatureTrends = await Signature.aggregate([
          {
            $match: {
              createdAt: { $gte: thirtyDaysAgo }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]);
      } else {
        console.log('Signatures collection does not exist');
        signatureTrends = [];
      }
    } catch (err) {
      console.error('Error in signatureTrends aggregation:', err);
      signatureTrends = [];
    }

    console.log('Analytics data prepared successfully');

    res.json({
      success: true,
      analytics: {
        overview: {
          totalPetitions,
          activePetitions,
          reviewedPetitions,
          closedPetitions
        },
        petitionsByCategory,
        petitionsByLocation,
        trendingPetitions,
        signatureTrends
      }
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching analytics",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update petition status (Public Officials only)
export const updatePetitionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, officialResponse, timeline } = req.body;
    const officialId = req.user.id;

    console.log('Updating petition status:', { id, status, officialResponse, officialId });

    // Validate official role
    if (req.user.role !== 'public-official') {
      return res.status(403).json({
        success: false,
        message: "Only public officials can update petition status"
      });
    }

    const petition = await Petition.findById(id);
    if (!petition) {
      return res.status(404).json({
        success: false,
        message: "Petition not found"
      });
    }

    // Update petition fields
    petition.status = status;
    if (officialResponse) petition.officialResponse = officialResponse;
    petition.reviewedBy = officialId;
    petition.reviewedAt = new Date();
    
    if (timeline) {
      if (!petition.timeline) petition.timeline = [];
      petition.timeline.push({
        status,
        date: new Date(),
        note: timeline,
        official: officialId
      });
    }

    await petition.save();

    // Log the admin action
    await logAdminAction(
      `Updated petition status to "${status}"`,
      petition.creator,
      petition._id,
      null,
      { 
        petitionTitle: petition.title,
        previousStatus: petition.status,
        newStatus: status,
        officialId,
        officialResponse: officialResponse || null
      }
    );

    console.log('Petition status updated successfully');

    res.json({
      success: true,
      message: "Petition status updated successfully",
      petition
    });
  } catch (error) {
    console.error("Update petition status error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error updating petition status",
      error: error.message 
    });
  }
};

// Verify petition (Public Officials only)
export const verifyPetition = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified, verificationNote } = req.body;
    const officialId = req.user.id;

    console.log('Verifying petition:', { id, verified, verificationNote, officialId });

    // Validate official role
    if (req.user.role !== 'public-official') {
      return res.status(403).json({
        success: false,
        message: "Only public officials can verify petitions"
      });
    }

    const petition = await Petition.findById(id);
    if (!petition) {
      return res.status(404).json({
        success: false,
        message: "Petition not found"
      });
    }

    petition.verified = verified;
    petition.verificationNote = verificationNote;
    petition.verifiedBy = officialId;
    petition.verifiedAt = new Date();

    await petition.save();

    // Log the admin action
    await logAdminAction(
      verified ? 'Verified petition' : 'Unverified petition',
      petition.creator,
      petition._id,
      null,
      { 
        petitionTitle: petition.title,
        verified,
        verificationNote,
        officialId
      }
    );

    console.log('Petition verification completed');

    res.json({
      success: true,
      message: `Petition ${verified ? 'verified' : 'marked as unverified'}`,
      petition
    });
  } catch (error) {
    console.error("Verify petition error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error verifying petition",
      error: error.message 
    });
  }
};

// Add official response
export const addOfficialResponse = async (req, res) => {
  try {
    const { petitionId } = req.params;
    const { message, type, isPublic } = req.body;
    const officialId = req.user.id;

    console.log('Adding official response:', { petitionId, message, type, isPublic, officialId });

    // Validate official role
    if (req.user.role !== 'public-official') {
      return res.status(403).json({
        success: false,
        message: "Only public officials can add responses"
      });
    }

    const petition = await Petition.findById(petitionId);
    if (!petition) {
      return res.status(404).json({
        success: false,
        message: "Petition not found"
      });
    }

    // Initialize internalNotes if it doesn't exist
    if (!petition.internalNotes) {
      petition.internalNotes = [];
    }

    // Add response to petition's internal notes
    petition.internalNotes.push({
      note: message,
      author: officialId,
      createdAt: new Date()
    });

    // If public response, update the officialResponse field
    if (isPublic !== false) {
      petition.officialResponse = message;
      petition.reviewedBy = officialId;
      petition.reviewedAt = new Date();
    }

    await petition.save();

    console.log('Official response added successfully');

    res.json({
      success: true,
      message: "Official response added successfully",
      petition
    });
  } catch (error) {
    console.error("Add official response error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error adding official response",
      error: error.message 
    });
  }
};

// Get petitions for official review
export const getPetitionsForReview = async (req, res) => {
  try {
    const { status = 'active', category, location, limit = 50 } = req.query;

    console.log('Fetching petitions for review:', { status, category, location, limit });

    const filter = { status };
    
    if (category && category !== 'all') filter.category = category;
    if (location && location !== 'all') filter.location = { $regex: location, $options: 'i' };

    const petitions = await Petition.find(filter)
      .populate("creator", "name email role")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Add signature counts for each petition
    const petitionsWithCounts = await Promise.all(
      petitions.map(async (petition) => {
        const signatureCount = await Signature.countDocuments({ petition: petition._id });
        
        return {
          ...petition.toObject(),
          signaturesCount: signatureCount
        };
      })
    );

    console.log(`Found ${petitionsWithCounts.length} petitions for review`);

    res.json({
      success: true,
      petitions: petitionsWithCounts,
      count: petitionsWithCounts.length
    });
  } catch (error) {
    console.error("Get petitions for review error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching petitions for review",
      error: error.message 
    });
  }
};

// Get official responses for a petition
export const getOfficialResponses = async (req, res) => {
  try {
    const { petitionId } = req.params;

    console.log('Fetching official responses for petition:', petitionId);

    const petition = await Petition.findById(petitionId)
      .populate('reviewedBy', 'name email role')
      .populate('verifiedBy', 'name email role')
      .populate('internalNotes.author', 'name email role');

    if (!petition) {
      return res.status(404).json({
        success: false,
        message: "Petition not found"
      });
    }

    const responses = {
      officialResponse: petition.officialResponse,
      reviewedBy: petition.reviewedBy,
      reviewedAt: petition.reviewedAt,
      verified: petition.verified,
      verifiedBy: petition.verifiedBy,
      verifiedAt: petition.verifiedAt,
      verificationNote: petition.verificationNote,
      timeline: petition.timeline || [],
      internalNotes: petition.internalNotes || []
    };

    res.json({
      success: true,
      responses,
      petition: {
        _id: petition._id,
        title: petition.title,
        status: petition.status
      }
    });
  } catch (error) {
    console.error("Get official responses error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching official responses",
      error: error.message 
    });
  }
};

// Get petition signatures
export const getPetitionSignatures = async (req, res) => {
  try {
    const petitionId = req.params.id;
    
    console.log('Fetching signatures for petition:', petitionId);

    // Validate petition exists
    const petition = await Petition.findById(petitionId);
    if (!petition) {
      return res.status(404).json({
        success: false,
        message: 'Petition not found'
      });
    }

    // Get signatures with user details
    const signatures = await Signature.find({ petition: petitionId })
      .populate('user', 'name email location')
      .sort({ createdAt: -1 });

    const signatureCount = signatures.length;

    console.log(`Found ${signatureCount} signatures for petition: ${petition.title}`);

    res.json({
      success: true,
      signatures,
      count: signatureCount,
      petition: {
        _id: petition._id,
        title: petition.title,
        signatureGoal: petition.signatureGoal
      }
    });

  } catch (error) {
    console.error('Get petition signatures error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching petition signatures',
      error: error.message
    });
  }
};

// Update petition - Add this if it's missing
export const updatePetition = async (req, res) => {
  try {
    const petitionId = req.params.id;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const petition = await Petition.findById(petitionId);
    if (!petition) {
      return res.status(404).json({
        success: false,
        message: "Petition not found"
      });
    }

    // Check if user is the creator
    if (petition.creator.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the petition creator can edit this petition"
      });
    }

    // Only allow editing certain fields
    const allowedUpdates = ['title', 'description', 'category', 'location', 'signatureGoal'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    Object.assign(petition, updates);
    await petition.save();

    // Get updated petition with signature count
    const signatureCount = await Signature.countDocuments({ petition: petition._id });

    console.log('Petition updated successfully:', petition._id);

    res.json({ 
      success: true,
      message: "Petition updated successfully", 
      petition: {
        ...petition.toObject(),
        signaturesCount: signatureCount
      }
    });
  } catch (error) {
    console.error("Error updating petition:", error);
    res.status(500).json({ 
      success: false,
      message: "Error updating petition", 
      error: error.message 
    });
  }
};