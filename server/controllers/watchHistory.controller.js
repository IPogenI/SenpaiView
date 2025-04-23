import mongoose from 'mongoose';
import User from '../models/User.js';

// Get user's watch history
export const getWatchHistory = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const user = await User.findOne({ _id: userId })
            .populate({
                path: 'watchHistory.animeId',
                select: 'name episodes genres status premiered rating popularity'
            });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get ratings for each anime in watch history
        const watchHistoryWithRatings = await Promise.all(user.watchHistory.map(async (item) => {
            if (!item.animeId) return null;

            try {
                // Get user's rating for this anime
                const userRating = await mongoose.model('Rating').findOne({
                    animeId: item.animeId._id.toString(),
                    userId: userId
                });

                // Get all ratings for this anime to calculate average
                const allRatings = await mongoose.model('Rating').find({
                    animeId: item.animeId._id.toString()
                });

                const totalRatings = allRatings.length;
                const averageRating = totalRatings > 0
                    ? allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
                    : 0;

                return {
                    ...item.toObject(),
                    animeId: {
                        ...item.animeId.toObject(),
                        userRating: userRating?.rating || 0,
                        averageRating: Math.round(averageRating * 10) / 10
                    }
                };
            } catch (error) {
                console.error('Error fetching ratings:', error);
                return {
                    ...item.toObject(),
                    animeId: {
                        ...item.animeId.toObject(),
                        userRating: 0,
                        averageRating: 0
                    }
                };
            }
        }));

        // Filter out null items and sort by most recently watched
        const sortedHistory = watchHistoryWithRatings
            .filter(item => item !== null)
            .sort((a, b) => b.watchedAt - a.watchedAt);

        res.status(200).json(sortedHistory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add to watch history
export const addToWatchHistory = async (req, res) => {
    try {
        const { userId, animeId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(animeId)) {
            return res.status(400).json({ message: 'Invalid user ID or anime ID' });
        }

        // Check if the anime exists
        const anime = await mongoose.model('AnimeList').findById(animeId);
        if (!anime) {
            return res.status(404).json({ message: 'Anime not found' });
        }

        // Find user
        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if anime is already in watch history
        const existingEntry = user.watchHistory.find(item =>
            item.animeId.toString() === animeId.toString()
        );

        if (existingEntry) {
            // Update the watchedAt timestamp
            existingEntry.watchedAt = new Date();
            await user.save();
            return res.status(200).json(existingEntry);
        }

        // Add to watch history
        user.watchHistory.push({
            animeId,
            watchedAt: new Date()
        });

        await user.save();

        // Populate and return the new item
        await user.populate('watchHistory.animeId');
        const newItem = user.watchHistory[user.watchHistory.length - 1];

        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove from watch history
export const removeFromWatchHistory = async (req, res) => {
    try {
        const { userId, animeId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(animeId)) {
            return res.status(400).json({ message: 'Invalid user ID or anime ID' });
        }

        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the watch history item index
        const itemIndex = user.watchHistory.findIndex(item =>
            item.animeId.toString() === animeId.toString()
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Watch history item not found' });
        }

        // Remove the item
        user.watchHistory.splice(itemIndex, 1);
        await user.save();

        res.status(200).json({ message: 'Removed from watch history' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 