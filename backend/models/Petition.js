const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define a sub-schema for comments
const CommentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const PetitionSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  signatureGoal: {
    type: Number,
    required: true,
  },
  signatures: [{
    type: Schema.Types.ObjectId,
    ref: 'user',
  }],
  // Add comments array using the sub-schema
  comments: [CommentSchema],
  location: {
    type: String
  },
  status: {
    type: String,
    default: 'Active',
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('petition', PetitionSchema);