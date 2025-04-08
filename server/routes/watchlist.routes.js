import express from 'express';
import {
  addToWatchlist,
  getWatchlist,
  updateWatchlistStatus,
  removeFromWatchlist
} from '../controllers/watchlist.controller.js';

const router = express.Router();

// Add anime to watchlist
router.post('/', addToWatchlist);

// Get user's watchlist
router.get('/:userId', getWatchlist);

// Update watchlist item status
router.patch('/:id', updateWatchlistStatus);

// Remove from watchlist
router.delete('/:id', removeFromWatchlist);

export default router;
