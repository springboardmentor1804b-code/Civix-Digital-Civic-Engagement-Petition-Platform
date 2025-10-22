import Petition from "../models/Petition.js";
import Signature from "../models/Signature.js";
import User from "../models/User.js";

// Sign a petition
export const signPetition = async (req, res) => {
  try {
    const { petitionId } = req.params;
    const userId = req.body.userId || req.query.userId;

    console.log('Signature Controller - Petition ID:', petitionId, 'User ID:', userId);

    // Check if petition exists
    const petition = await Petition.findById(petitionId);
    if (!petition) {
      return res.status(404).json({ 
        success: false, 
        message: "Petition not found" 
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Check if user already signed this petition
    const existing = await Signature.findOne({ petition: petitionId, user: userId });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: "You have already signed this petition" 
      });
    }

    // Create new signature using your schema structure
    const signature = new Signature({ 
      petition: petitionId, 
      user: userId 
    });
    
    await signature.save();
    console.log('New signature created:', signature._id);

    // Get total signature count for this petition
    const totalSignatures = await Signature.countDocuments({ petition: petitionId });

    res.json({ 
      success: true,
      message: "Petition signed successfully",
      signatureCount: totalSignatures
    });
  } catch (err) {
    console.error("Error in signature controller:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error signing petition",
      error: err.message 
    });
  }
};

// Get signed petitions by user
export const getSignedPetitionsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all signatures by this user
    const signatures = await Signature.find({ user: userId })
      .populate({
        path: 'petition',
        populate: {
          path: 'creator',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    // Extract petition data and add signature info
    const signedPetitions = signatures.map(sig => ({
      ...sig.petition.toObject(),
      signedAt: sig.createdAt
    }));

    res.json({
      success: true,
      petitions: signedPetitions,
      count: signedPetitions.length
    });
  } catch (err) {
    console.error("Error fetching signed petitions:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching signed petitions",
      error: err.message 
    });
  }
};
