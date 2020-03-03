const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2, maxlength: 20 },
});

module.exports = mongoose.model('Category', categorySchema);
