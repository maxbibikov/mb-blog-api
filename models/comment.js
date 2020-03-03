const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, minlength: 3, maxlength: 60 },
  text: { type: String, required: true, minlength: 20, maxlength: 300 },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
});

module.exports = mongoose.model('Comment', commentSchema);
