const express = require('express');
const router = express.Router();

// Controller
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.category_list_get);
router.get('/:categoryid', categoryController.category_get);
router.post('/', categoryController.category_create);
router.put('/:categoryid', categoryController.category_update);
router.delete('/:categoryid', categoryController.category_delete);

module.exports = router;
