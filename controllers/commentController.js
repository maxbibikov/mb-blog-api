const passport = require('passport');
const { check, param, validationResult } = require('express-validator');

// Utils
const { getIdFromSlug } = require('../utils');

// Models
const Comment = require('../models/comment');

exports.comment_list_get = [
  param('postSlug', 'Param postId is not valid')
    .isString()
    .notEmpty()
    .trim(),
  (req, res) => {
    const errors = validationResult(req);
    const { postSlug } = req.params;
    const postId = getIdFromSlug(postSlug);

    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }

    return Comment.find({ post: postId })
      .exec()
      .then((comments) => res.json(comments))
      .catch((error) => res.json({ error: error.message }));
  },
];

exports.comment_get = [
  param('commentId', 'Param commentId is not valid')
    .isString()
    .notEmpty()
    .trim(),
  (req, res) => {
    const errors = validationResult(req);
    const { commentId } = req.params;

    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }

    return Comment.find({ _id: commentId })
      .exec()
      .then((comment) => res.json(comment))
      .catch((error) => res.json({ error: error.message }));
  },
];

exports.comment_create = [
  param('postSlug', 'Param postSlug is not valid')
    .isString()
    .notEmpty()
    .trim(),
  check('name', 'Name is required')
    .isString()
    .notEmpty()
    .isLength({ min: 2, max: 300 })
    .withMessage('Name length should be from 3 to 20 characters')
    .trim()
    .escape(),
  check('text', 'Comment text is not valid')
    .isString()
    .notEmpty()
    .isLength({ min: 2, max: 300 })
    .withMessage('Comment length should be from 2 to 300 characters')
    .trim()
    .escape(),
  (req, res) => {
    const errors = validationResult(req);
    const { postSlug } = req.params;
    const { name, text } = req.body;
    const postId = getIdFromSlug(postSlug);

    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }

    const comment = new Comment({
      post: postId,
      name,
      text,
    });

    return comment
      .save()
      .then((newComment) => res.json(newComment))
      .catch((error) => res.json({ error: error.message }));
  },
];

exports.comment_update = [
  param('commentId', 'Param commentId is not valid')
    .isString()
    .notEmpty()
    .trim(),
  check('text', 'Comment text is not valid')
    .isString()
    .notEmpty()
    .isLength({ min: 2, max: 300 })
    .withMessage('Comment length should be from 2 to 300 characters')
    .trim()
    .escape(),
  (req, res) => {
    const errors = validationResult(req);
    const { commentId } = req.params;
    const { text } = req.body;

    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }

    const comment = new Comment({
      _id: commentId,
      text,
    });

    return Comment.findOneAndUpdate({ _id: commentId }, comment)
      .exec()
      .then((updatedComment) => res.json(updatedComment))
      .catch((error) => res.json({ error: error.message }));
  },
];

exports.comment_delete = [
  passport.authenticate('jwt', { session: false }),
  param('commentId', 'Param commentId is not valid')
    .isString()
    .notEmpty()
    .trim(),
  (req, res) => {
    const errors = validationResult(req);
    const { commentId } = req.params;

    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }

    return Comment.findOneAndRemove({ _id: commentId })
      .exec()
      .then((deletedComment) => res.json(deletedComment))
      .catch((error) => res.json({ error: error.message }));
  },
];
