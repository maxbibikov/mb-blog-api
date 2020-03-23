const passport = require('passport');
const { check, validationResult } = require('express-validator');

// Models
const Post = require('../models/post');

// Utils
const { generateSlug, getIdFromSlug } = require('../utils');

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
    .isLength({ min: 5, max: 100 })
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
    .isBoolean()
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
      published,
      user: req.user.id,
      category,
    });

    post.slug = generateSlug(post.title, post._id);

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
    .matches(/^[a-zA-Z0-9 ]+$/)
    .withMessage('Title should contain only letters')
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
    .isBoolean()
    .trim()
    .escape(),
  check('category', 'Category is not valid')
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
    const { postSlug } = req.params;
    const postId = getIdFromSlug(postSlug);

    const post = new Post({
      _id: postId,
      slug: generateSlug(title, postId),
      title,
      description,
      text,
      picture,
      published,
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
  const { postSlug } = req.params;

  return Post.findOne({ slug: postSlug })
    .populate('category')
    .exec()
    .then((post) => {
      if (!post) {
        return res.status(404).json({ error: 'Post Not Found' });
      }
      return res.json(post);
    })
    .catch((error) => res.json({ error: error.message }));
};

exports.post_delete = [
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { postSlug } = req.params;

    return Post.findOneAndRemove({ _id: getIdFromSlug(postSlug) })
      .exec()
      .then((removedPost) => res.json(removedPost))
      .catch((error) => res.json({ error: error.message }));
  },
];
