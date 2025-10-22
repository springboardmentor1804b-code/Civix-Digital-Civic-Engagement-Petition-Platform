// Backend: Create OfficialResponse model
import mongoose from 'mongoose';

const officialResponseSchema = new mongoose.Schema({
  petition: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Petition',
    required: true
  },
  official: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: [
      'general_response',
      'status_update', 
      'verification_approved',
      'verification_rejected',
      'information_request',
      'progress_update',
      'final_decision'
    ],
    default: 'general_response'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  attachments: [{
    filename: String,
    url: String,
    type: String
  }],
  metadata: {
    department: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    tags: [String],
    referenceId: String
  }
}, { 
  timestamps: true 
});

// Index for efficient queries
officialResponseSchema.index({ petition: 1, createdAt: -1 });
officialResponseSchema.index({ official: 1, createdAt: -1 });
officialResponseSchema.index({ type: 1 });
officialResponseSchema.index({ isPublic: 1 });

export default mongoose.model('OfficialResponse', officialResponseSchema);

// Controller for official responses
export const addOfficialResponse = async (req, res) => {
  try {
    const { petitionId } = req.params;
    const { message, type, isPublic } = req.body;
    const officialId = req.user.id;

    if (req.user.role !== 'official') {
      return res.status(403).json({ 
        message: "Only officials can add responses" 
      });
    }

    const response = new OfficialResponse({
      petition: petitionId,
      official: officialId,
      message,
      type,
      isPublic
    });

    await response.save();
    await response.populate('official', 'name department');

    res.json({
      success: true,
      message: "Official response added successfully",
      response
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding official response" });
  }
};