const express = require('express');
const router = express.Router();
const { 
    getUserProfile, 
    toggleFollow, 
    toggleBookmark, 
    getBookmarks 
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Protected routes for Bookmarks
router.get('/bookmarks', protect, getBookmarks);
router.post('/bookmarks/:postId', protect, toggleBookmark);

// Public route to view a profile
router.get('/:username', getUserProfile);

// Protected route to follow someone
router.post('/:username/follow', protect, toggleFollow);

module.exports = router;