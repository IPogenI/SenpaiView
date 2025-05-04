const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment'); // MongoDB model for comments

// Add a new comment
router.post('/add', async (req, res) => {
    try {
        const { animeId, userId, content } = req.body;
        const newComment = new Comment({ animeId, userId, content });
        await newComment.save();
        res.status(201).json({ message: 'Comment added successfully', comment: newComment });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

// Get comments for an anime
router.get('/:animeId', async (req, res) => {
    try {
        const { animeId } = req.params;
        const comments = await Comment.find({ animeId }).populate('userId', 'username');
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

module.exports = router;