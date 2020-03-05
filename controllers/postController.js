const passport = require('passport');
const { check, validationResult } = require('express-validator');

// Models
const Post = require('../models/post');

// GET request for post list
exports.post_list_get = (req, res) => {
  return Post.find({})
    .exec()
    .then((posts) => res.json(posts))
    .catch((error) => res.json({ error: error.message }));
};

exports.post_create = [
  passport.authenticate('jwt', { session: false }),
  check('title', 'Title is not valid')
    .exists()
    .notEmpty()
    .isString()
    .isLength({ min: 5, max: 50 })
    .trim(),
  check('description', 'Description is not valid')
    .exists()
    .notEmpty()
    .isString()
    .isLength({ min: 10, max: 300 })
    .trim(),
  check('text', 'Text is not valid')
    .exists()
    .notEmpty()
    .isString()
    .isLength({ min: 10, max: 3000 })
    .trim(),
  check('picture', 'Picture is not valid')
    .optional()
    .isString()
    .trim()
    .escape(),
  check('published', 'Published is not valid')
    .isString()
    .trim()
    .escape(),
  check('category', 'Published is not valid')
    .exists()
    .notEmpty()
    .isString()
    .trim()
    .escape(),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }

    const { title, description, text, picture, published, category } = req.body;

    const post = new Post({
      title,
      description,
      text,
      picture,
      published: Boolean(published),
      user: req.user.id,
      category,
    });

    return post
      .save()
      .then((newPost) => res.json({ post: newPost }))
      .catch((error) => res.json({ error: error.message }));
  },
];

exports.post_update = [
  passport.authenticate('jwt', { session: false }),
  check('title', 'Title is not valid')
    .exists()
    .notEmpty()
    .isString()
    .isLength({ min: 5, max: 50 })
    .trim()
    .escape(),
  check('description', 'Description is not valid')
    .exists()
    .notEmpty()
    .isString()
    .isLength({ min: 10, max: 300 })
    .trim()
    .escape(),
  check('text', 'Text is not valid')
    .exists()
    .notEmpty()
    .isString()
    .isLength({ min: 10, max: 3000 })
    .trim()
    .escape(),
  check('picture', 'Picture is not valid')
    .optional()
    .isString()
    .trim()
    .escape(),
  check('published', 'Published is not valid')
    .isString()
    .trim()
    .escape(),
  check('category', 'Published is not valid')
    .exists()
    .notEmpty()
    .isString()
    .trim()
    .escape(),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    const { title, description, text, picture, published, category } = req.body;
    const { postId } = req.params;

    const post = new Post({
      _id: postId,
      title,
      description,
      text,
      picture,
      published: Boolean(published),
      user: req.user.id,
      category,
      modified: new Date().toUTCString(),
    });

    return Post.findOneAndUpdate({ _id: post._id }, post)
      .then((updatedPost) => res.json(updatedPost))
      .catch((error) => res.json({ error: error.message }));
  },
];

exports.post_get = (req, res) => {
  const { postId } = req.params;

  return Post.findOne({ _id: postId })
    .populate('category')
    .exec()
    .then((post) => res.json(post))
    .catch((error) => res.json({ error: error.message }));
};

exports.post_delete = [
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { postId } = req.params;

    return Post.findOneAndRemove({ _id: postId })
      .exec()
      .then((removedPost) => res.json(removedPost))
      .catch((error) => res.json({ error: error.message }));
  },
];
