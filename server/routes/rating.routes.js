import express from 'express';
import * as ratingController from '../controllers/rating.controller.js';

const router = express.Router();

// POST - Create/Update a rating
router.post('/', ratingController.rateAnime);

// GET - Get all ratings for an anime
router.get('/anime/:animeId', ratingController.getAnimeRatings);

// GET - Get user's rating for an anime
router.get('/anime/:animeId/user/:userId', ratingController.getUserRating);

// DELETE - Delete a rating
router.delete('/anime/:animeId/user/:userId', ratingController.deleteRating);

export default router;
