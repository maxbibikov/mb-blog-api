const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  slug: { type: String, required: true, minlength: 5, maxlength: 200 },
  title: { type: String, required: true, minlength: 5, maxlength: 100 },
  description: { type: String, required: true, minlength: 10, maxlength: 300 },
  text: { type: String, required: true, minlength: 10, maxlength: 3000 },
  created: Date,
  modified: Date,
  picture: String,
  published: { type: Boolean, default: false },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
});

module.exports = mongoose.model('Post', postSchema);
