const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, minlength: 4, maxlength: 15 },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['admin', 'user'], required: true },
  firstName: { type: String, required: true, minlength: 2, maxlength: 50 },
  lastName: { type: String, required: true, minlength: 2, maxlength: 50 },
  about: { type: String, maxlength: 300 },
});

module.exports = mongoose.model('User', userSchema);
