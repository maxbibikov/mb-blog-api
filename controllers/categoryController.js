const { check, validationResult, param } = require('express-validator');

// Models
const Category = require('../models/category');

exports.category_list_get = (req, res) =>
  Category.find({})
    .exec()
    .then((categories) => res.json({ categories }))
    .catch((err) => res.json({ error: err }));

exports.category_get = [
  param('categoryid', 'Category id is not valid')
    .exists()
    .withMessage('Category id should be specified')
    .notEmpty()
    .isString(),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
    }
    const categoryId = req.params.categoryid;

    return Category.findOne({ _id: categoryId })
      .exec()
      .then((category) => res.json(category))
      .catch((error) => res.json({ error }));
  },
];

exports.category_create = [
  check('name', 'Name is invalid')
    .exists()
    .notEmpty()
    .isString()
    .isLength({ min: 2, max: 20 })
    .trim()
    .escape(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    const category = new Category({
      name: req.body.name.toLowerCase(),
    });

    return category
      .save()
      .then((createdCategory) => res.json({ category: createdCategory }))
      .catch((err) => res.json({ error: err }));
  },
];

exports.category_update = [
  param('categoryid', 'Category id is not valid')
    .exists()
    .withMessage('Category id should be specified')
    .notEmpty()
    .isString(),
  check('name', 'Name is invalid')
    .exists()
    .notEmpty()
    .isString()
    .isLength({ min: 2, max: 20 })
    .trim()
    .escape(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    const category = new Category({
      _id: req.params.categoryid,
      name: req.body.name.toLowerCase(),
    });

    return Category.findOneAndUpdate({ _id: category._id }, category)
      .then((updatedCategory) => res.json(updatedCategory))
      .catch((err) => res.json({ error: err }));
  },
];

exports.category_delete = [
  param('categoryid', 'Category id is not valid')
    .exists()
    .withMessage('Category id should be specified')
    .notEmpty()
    .isString(),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
    }
    const categoryId = req.params.categoryid;

    return Category.findOneAndRemove({ _id: categoryId })
      .exec()
      .then((removedCategory) => res.json(removedCategory))
      .catch((error) => res.json({ error }));
  },
];
