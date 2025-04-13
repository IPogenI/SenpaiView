import mongoose from 'mongoose';
import User from '../models/User.js';

// Add anime to watchlist
export const addToWatchlist = async (req, res) => {
  try {
    const { userId, animeId } = req.params;
    const { status } = req.body;

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

    // Check if anime is already in watchlist
    const existingEntry = user.watchlist.find(item =>
      item.animeId.toString() === animeId.toString()
    );

    if (existingEntry) {
      return res.status(400).json({ message: 'Anime already in watchlist' });
    }

    // Add to watchlist
    user.watchlist.push({
      animeId,
      status: status || 'Plan to Watch',
      addedAt: new Date()
    });

    await user.save();

    // Populate and return the new item
    await user.populate('watchlist.animeId');
    const newItem = user.watchlist[user.watchlist.length - 1];

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's watchlist
export const getWatchlist = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findOne({ _id: userId })
      .populate({
        path: 'watchlist.animeId',
        select: 'name episodes genres status premiered rating popularity'
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out items where animeId is null and sort by addedAt
    const validWatchlist = user.watchlist
      .filter(item => item.animeId)
      .sort((a, b) => b.addedAt - a.addedAt);

    res.status(200).json(validWatchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update watchlist item status
export const updateWatchlistStatus = async (req, res) => {
  try {
    const { userId, animeId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(animeId)) {
      return res.status(400).json({ message: 'Invalid user ID or anime ID' });
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const watchlistItem = user.watchlist.find(item =>
      item.animeId.toString() === animeId.toString()
    );

    if (!watchlistItem) {
      return res.status(404).json({ message: 'Watchlist item not found' });
    }

    watchlistItem.status = status;
    await user.save();

    res.status(200).json(watchlistItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove from watchlist
export const removeFromWatchlist = async (req, res) => {
  try {
    const { userId, animeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(animeId)) {
      return res.status(400).json({ message: 'Invalid user ID or anime ID' });
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const itemIndex = user.watchlist.findIndex(item =>
      item.animeId.toString() === animeId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Watchlist item not found' });
    }

    user.watchlist.splice(itemIndex, 1);
    await user.save();

    res.status(200).json({ message: 'Removed from watchlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check if anime is in user's watchlist
export const checkWatchlistStatus = async (req, res) => {
  try {
    const { userId, animeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(animeId)) {
      return res.status(400).json({ message: 'Invalid user ID or anime ID' });
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const watchlistItem = user.watchlist.find(item =>
      item.animeId.toString() === animeId.toString()
    );

    res.status(200).json({
      inWatchlist: !!watchlistItem,
      status: watchlistItem?.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get recommended anime based on watchlist
export const getRecommendedAnime = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findOne({ _id: userId })
      .populate('watchlist.animeId');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If watchlist is empty, return popular anime
    if (user.watchlist.length === 0) {
      const popularAnime = await mongoose.model('AnimeList')
        .find()
        .sort({ rating: -1 })
        .limit(10);
      return res.status(200).json(popularAnime);
    }

    // Get user's preferred genres
    const genreCount = {};
    user.watchlist.forEach(item => {
      if (item.animeId && item.animeId.genres) {
        const genres = item.animeId.genres.split(',');
        genres.forEach(genre => {
          genreCount[genre.trim()] = (genreCount[genre.trim()] || 0) + 1;
        });
      }
    });

    // Sort genres by frequency
    const sortedGenres = Object.entries(genreCount)
      .sort(([, a], [, b]) => b - a)
      .map(([genre]) => genre);

    // Get average rating from watchlist
    const averageRating = user.watchlist.reduce((sum, item) => {
      return sum + (item.animeId?.rating || 0);
    }, 0) / user.watchlist.length;

    // Find recommendations based on genres and rating
    let recommendations = await mongoose.model('AnimeList')
      .find({
        genres: { $in: sortedGenres },
        rating: { $gte: averageRating - 1 }
      })
      .limit(20);

    // If not enough recommendations, relax the rating filter
    if (recommendations.length < 10) {
      recommendations = await mongoose.model('AnimeList')
        .find({
          genres: { $in: sortedGenres }
        })
        .limit(20);
    }

    // Filter out anime already in watchlist
    const watchlistIds = user.watchlist.map(item => item.animeId._id.toString());
    const finalRecommendations = recommendations.filter(anime =>
      !watchlistIds.includes(anime._id.toString())
    );

    res.status(200).json(finalRecommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};