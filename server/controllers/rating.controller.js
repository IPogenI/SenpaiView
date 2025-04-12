import mongoose from 'mongoose';
import Rating from '../models/Rating.js';

// Create or update a rating
export const rateAnime = async (req, res) => {
    try {
        const { animeId, userId } = req.params;
        const { rating, review } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(animeId)) {
            return res.status(400).json({ message: 'Invalid user ID or anime ID' });
        }

        if (!animeId || !userId || !rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Invalid rating data' });
        }

        const ratingDoc = await Rating.findOneAndUpdate(
            { animeId, userId },
            { rating, review, updatedAt: Date.now() },
            { upsert: true, new: true }
        );

        res.json(ratingDoc);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get ratings for an anime
export const getAnimeRatings = async (req, res) => {
    try {
        const { animeId } = req.params;
        const ratings = await Rating.find({ animeId }).sort({ createdAt: -1 });
        
        // Calculate average rating
        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
            : 0;

        res.json({
            ratings,
            stats: {
                totalRatings,
                averageRating: Math.round(averageRating * 10) / 10
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user's rating for an anime
export const getUserRating = async (req, res) => {
    try {
        const { animeId, userId } = req.params;
        const rating = await Rating.findOne({ animeId, userId });
        res.json(rating || null);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a rating
export const deleteRating = async (req, res) => {
    try {
        const { animeId, userId } = req.params;
        await Rating.findOneAndDelete({ animeId, userId });
        res.json({ message: 'Rating deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
