import mongoose from "mongoose";

const petitionSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  category: { 
    type: String, 
    required: true,
    enum: [
      'Environment', 
      'Infrastructure', 
      'Education', 
      'Transportation',
      'Public Safety', 
      'Healthcare', 
      'Housing',
      'Economic Development',
      'Social Services',
      'Government Transparency',
      'Other'
    ]
  },
  location: { 
    type: String, 
    required: true,
    trim: true
  },
  signatureGoal: { 
    type: Number, 
    required: true,
    min: 10,
    max: 100000
  },
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: { 
    type: String, 
    enum: [
      'active',           // Open for signatures
      'under_review',     // Being reviewed by officials
      'in_progress',      // Action is being taken
      'closed',           // Closed without action
      'successful',       // Goal achieved/implemented
      'rejected',         // Officially rejected
      'expired'           // Time limit exceeded
    ], 
    default: 'active' 
  },
  
  // OFFICIAL FIELDS
  verified: { 
    type: Boolean, 
    default: false 
  },
  verifiedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  verifiedAt: { 
    type: Date 
  },
  verificationNote: { 
    type: String,
    trim: true
  },
  
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  reviewedAt: { 
    type: Date 
  },
  officialResponse: { 
    type: String,
    trim: true
  },
  
  // Status timeline
  timeline: [{ 
    status: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      trim: true
    },
    official: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Additional official fields
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  department: {
    type: String,
    trim: true
  },
  estimatedCompletionDate: {
    type: Date
  },
  actualCompletionDate: {
    type: Date
  },
  budgetAllocated: {
    type: Number,
    min: 0
  },
  
  // Metadata
  tags: [String],
  internalNotes: [{
    note: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Geographic data
  coordinates: {
    lat: Number,
    lng: Number
  },
  
  // Engagement metrics
  views: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

// Indexes for efficient queries
petitionSchema.index({ status: 1, createdAt: -1 });
petitionSchema.index({ category: 1, status: 1 });
petitionSchema.index({ location: 1, status: 1 });
petitionSchema.index({ creator: 1, createdAt: -1 });
petitionSchema.index({ verified: 1 });
petitionSchema.index({ reviewedBy: 1 });
petitionSchema.index({ priority: 1, status: 1 });

// Virtual for checking if petition is trending
petitionSchema.virtual('isTrending').get(function() {
  const daysSinceCreated = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
  return daysSinceCreated <= 7; // Trending if created within last 7 days
});

export default mongoose.model("Petition", petitionSchema);
