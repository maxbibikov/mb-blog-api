const debug = require('debug');
const Post = require('../models/post');
const User = require('../models/user');
const Category = require('../models/category');

function populateDB() {
  const newUser = new User({
    username: 'testuser',
    password: 'testuserpassword',
    role: 'user',
    firstName: 'Test',
    lastName: 'User',
  }).save();

  const newCategory = new Category({
    name: 'general',
  }).save();

  return Promise.all([newUser, newCategory])
    .then(([user, category]) => {
      const newPost = new Post({
        slug: 'test slug',
        title: 'test post title',
        description: 'test post description',
        text: 'Test post body text. Welcome to blogpost.',
        created: new Date().toUTCString(),
        published: true,
        user: user._id,
        category: category._id,
      });

      return newPost.save();
    })
    .catch((error) => {
      debug(error);
    });
}

module.exports = { populateDB };
