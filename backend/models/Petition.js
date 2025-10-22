const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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