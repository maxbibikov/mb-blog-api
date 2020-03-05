const express = require('express');
const router = express.Router();

// Controllers
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');

// GET post list
router.get('/', postController.post_list_get);

// GET one post
router.get('/:postId', postController.post_get);

// POST route to create new post
router.post('/', postController.post_create);

// PUT to update post
router.put('/:postId', postController.post_update);

// DELETE post
router.delete('/:postId', postController.post_delete);

// get comments for post
router.get('/:postId/comments/', commentController.comment_list_get);

// POST new comment for post
router.post('/:postId/comments/', commentController.comment_create);

// Remove comment
router.post('/:postId/comments/:commentId', commentController.comment_delete);

module.exports = router;
