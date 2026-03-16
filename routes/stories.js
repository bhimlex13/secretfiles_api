// routes/stories.js
const express = require('express');
const router = express.Router();
const Story = require('../models/Story');

// Fetch all stories (we will add filtering/searching later)
router.get('/', async (req, res) => {
  try {
    // Sort by newest first
    const stories = await Story.find().sort({ createdAt: -1 }); 
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new story
router.post('/', async (req, res) => {
  const story = new Story({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author || 'Anonymous',
    isAnonymous: req.body.isAnonymous !== false,
    tags: req.body.tags || []
  });

  try {
    const newStory = await story.save();
    res.status(201).json(newStory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;