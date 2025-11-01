const mongoose = require("mongoose");

const PollsSchema = new mongoose.Schema({
  title: String,
  description: String,
  options: [
    {
      text: {
        type: String,
        required: true
      },
      votes: {
        type: [String],
        default: []
      }
    }
  ],
  category: String,
  location: String,
  allowMultiple: { type: Boolean, default: false },
  created_user_id: String,
<<<<<<< HEAD
=======
  created_on:  { type: Date, default: Date.now },
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
  isClosed: {type: Boolean , default: false}
});

const polls = mongoose.model("poll", PollsSchema);

module.exports = polls;