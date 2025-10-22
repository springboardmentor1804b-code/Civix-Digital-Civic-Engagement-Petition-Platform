import mongoose from 'mongoose';

const adminLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    trim: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relatedPetition: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Petition',
    default: null
  },
  relatedPoll: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt
});

// Index for faster queries
adminLogSchema.index({ user_id: 1, createdAt: -1 });
adminLogSchema.index({ relatedPetition: 1 });
adminLogSchema.index({ relatedPoll: 1 });

// Virtual for timestamp (alias for createdAt)
adminLogSchema.virtual('timestamp').get(function() {
  return this.createdAt;
});

// Ensure virtuals are included in JSON
adminLogSchema.set('toJSON', { virtuals: true });
adminLogSchema.set('toObject', { virtuals: true });

const AdminLog = mongoose.model('AdminLog', adminLogSchema);

export default AdminLog;
