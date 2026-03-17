const express = require('express');
const router = express.Router();
const { getPosts, getPostById, createPost, toggleReaction, addComment, updatePost } = require('../controllers/postController');
const { protect } = require('../middleware/auth');

// Public route to view posts, protected route to create one
router.route('/').get(getPosts).post(protect, createPost);

// Protected routes for interacting with specific posts
router.route('/:id/react').post(protect, toggleReaction);
router.route('/:id/comment').post(protect, addComment);
router.route('/:id').get(getPostById).put(protect, updatePost);

module.exports = router;