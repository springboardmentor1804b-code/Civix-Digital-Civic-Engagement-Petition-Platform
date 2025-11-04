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
  upVote: [{ type: String }], // Array to store votes (e.g., user IDs who voted)
  downVote: [{ type: String }], // Array to store downvotes
  reply: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    upVote: [{ type: String }], // Votes for the reply
    downVote: [{ type: String }], // Downvotes for the reply
    date: {
      type: Date,
      default: Date.now,
    },
  }],
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