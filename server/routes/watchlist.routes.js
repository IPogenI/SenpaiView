import express from 'express';
import {
  addToWatchlist,
  getWatchlist,
  updateWatchlistStatus,
  removeFromWatchlist,
  checkWatchlistStatus
} from '../controllers/watchlist.controller.js';

const router = express.Router();

// Get user's watchlist
router.get('/:userId', getWatchlist);

// Add anime to watchlist
router.post('/:userId/anime/:animeId', addToWatchlist);

// Update watchlist item status
router.patch('/:userId/anime/:animeId', updateWatchlistStatus);

// Remove from watchlist
router.delete('/:userId/anime/:animeId', removeFromWatchlist);

// Check if anime is in user's watchlist
router.get('/:userId/check/:animeId', checkWatchlistStatus);

export default router;
