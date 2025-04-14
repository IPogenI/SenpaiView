import express from 'express';
import { getWatchHistory, addToWatchHistory, removeFromWatchHistory } from '../controllers/watchHistory.controller.js';

const router = express.Router();

// Get user's watch history
router.get('/:userId', getWatchHistory);

// Add to watch history
router.post('/:userId/anime/:animeId', addToWatchHistory);

// Remove from watch history
router.delete('/:userId/anime/:animeId', removeFromWatchHistory);

export default router; 