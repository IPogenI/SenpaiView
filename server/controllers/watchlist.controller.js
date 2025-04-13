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
      .populate('watchlist.animeId')
      .populate('watchHistory.animeId');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    // Get IDs of anime to exclude (in watchlist or watch history)
    const excludedAnimeIds = [
      ...user.watchlist.map(item => item.animeId._id.toString()),
      ...user.watchHistory.map(item => item.animeId._id.toString())
    ];

    // If watchlist is empty, return top 3 highest rated anime
    if (user.watchlist.length === 0) {
      const topRatedAnime = await mongoose.model('AnimeList')
        .find({ _id: { $nin: excludedAnimeIds } })
        .sort({ rating: -1 })
        .limit(3);
      return res.status(200).json(topRatedAnime);
    }

    // Get user's preferred genres with frequency count
    const genreCount = {};
    user.watchlist.forEach(item => {
      if (item.animeId && item.animeId.genres) {
        const genres = item.animeId.genres.split(',');
        genres.forEach(genre => {
          genreCount[genre.trim()] = (genreCount[genre.trim()] || 0) + 1;
        });
      }
    });

    // Sort genres by frequency and get top 3
    const topGenres = Object.entries(genreCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([genre]) => genre);

    console.log('Top 3 preferred genres:', topGenres);

    // Get recommendations for each top genre
    const recommendations = await Promise.all(topGenres.map(async (genre) => {
      return await mongoose.model('AnimeList')
        .find({
          genres: { $regex: genre, $options: 'i' },
          _id: { $nin: excludedAnimeIds }
        })
        .sort({ rating: -1 })
        .limit(1); // Get top rated anime for each genre
    }));

    // Flatten and filter out any null results
    const finalRecommendations = recommendations
      .flat()
      .filter(anime => anime !== null);

    console.log(`Final recommendations count: ${finalRecommendations.length}`);

    // If we have less than 3 recommendations, fill with top rated anime
    if (finalRecommendations.length < 3) {
      const additionalAnime = await mongoose.model('AnimeList')
        .find({
          _id: {
            $nin: [
              ...excludedAnimeIds,
              ...finalRecommendations.map(a => a._id.toString())
            ]
          }
        })
        .sort({ rating: -1 })
        .limit(3 - finalRecommendations.length);

      finalRecommendations.push(...additionalAnime);
    }

    res.status(200).json(finalRecommendations.slice(0, 3)); // Ensure we return exactly 3 recommendations
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ message: error.message });
  }
};