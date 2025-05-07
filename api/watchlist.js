import dbConnect from '../server/db/db.js';
import mongoose from 'mongoose';
import User from '../server/models/User.js';
import AnimeListModel from '../server/models/AnimeList.js';

export default async function handler(req, res) {
  await dbConnect();
  const { method, query, body } = req;
  const { userId, animeId } = query;

  // GET /api/watchlist?userId=...&check=animeId
  if (method === 'GET' && userId && query.check) {
    // Check if anime is in user's watchlist
    try {
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(query.check)) {
        return res.status(400).json({ message: 'Invalid user ID or anime ID' });
      }
      const user = await User.findOne({ _id: userId });
      if (!user) return res.status(404).json({ message: 'User not found' });
      const watchlistItem = user.watchlist.find(item => item.animeId.toString() === query.check.toString());
      return res.status(200).json({ inWatchlist: !!watchlistItem, status: watchlistItem?.status });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // GET /api/watchlist?userId=...&recommendations=true
  if (method === 'GET' && userId && query.recommendations) {
    // Get recommended anime based on watchlist
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      const user = await User.findOne({ _id: userId })
        .populate('watchlist.animeId')
        .populate('watchHistory.animeId');
      if (!user) return res.status(404).json({ message: 'User not found' });
      const excludedAnimeIds = [
        ...user.watchlist.map(item => item.animeId._id.toString()),
        ...user.watchHistory.map(item => item.animeId._id.toString())
      ];
      if (user.watchlist.length === 0) {
        const topRatedAnime = await AnimeListModel
          .find({ _id: { $nin: excludedAnimeIds } })
          .sort({ rating: -1 })
          .limit(3);
        return res.status(200).json(topRatedAnime);
      }
      const genreCount = {};
      user.watchlist.forEach(item => {
        if (item.animeId && item.animeId.genres) {
          const genres = item.animeId.genres.split(',');
          genres.forEach(genre => {
            genreCount[genre.trim()] = (genreCount[genre.trim()] || 0) + 1;
          });
        }
      });
      const topGenres = Object.entries(genreCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([genre]) => genre);
      const recommendations = await Promise.all(topGenres.map(async (genre) => {
        return await AnimeListModel
          .find({ genres: { $regex: genre, $options: 'i' }, _id: { $nin: excludedAnimeIds } })
          .sort({ rating: -1 })
          .limit(1);
      }));
      const finalRecommendations = recommendations.flat().filter(anime => anime !== null);
      if (finalRecommendations.length < 3) {
        const additionalAnime = await AnimeListModel
          .find({ _id: { $nin: [...excludedAnimeIds, ...finalRecommendations.map(a => a._id.toString())] } })
          .sort({ rating: -1 })
          .limit(3 - finalRecommendations.length);
        finalRecommendations.push(...additionalAnime);
      }
      return res.status(200).json(finalRecommendations);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // GET /api/watchlist?userId=...
  if (method === 'GET' && userId) {
    // Get user's watchlist
    try {
      const user = await User.findOne({ _id: userId })
        .populate({ path: 'watchlist.animeId', select: 'name episodes genres status premiered rating popularity' });
      if (!user) return res.status(404).json({ message: 'User not found' });
      const validWatchlist = user.watchlist.filter(item => item.animeId).sort((a, b) => b.addedAt - a.addedAt);
      return res.status(200).json(validWatchlist);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // POST /api/watchlist?userId=...&animeId=...
  if (method === 'POST' && userId && animeId) {
    // Add anime to watchlist
    try {
      const { status } = body;
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(animeId)) {
        return res.status(400).json({ message: 'Invalid user ID or anime ID' });
      }
      const anime = await AnimeListModel.findById(animeId);
      if (!anime) return res.status(404).json({ message: 'Anime not found' });
      const user = await User.findOne({ _id: userId });
      if (!user) return res.status(404).json({ message: 'User not found' });
      const existingEntry = user.watchlist.find(item => item.animeId.toString() === animeId.toString());
      if (existingEntry) return res.status(400).json({ message: 'Anime already in watchlist' });
      user.watchlist.push({ animeId, status: status || 'Plan to Watch', addedAt: new Date() });
      await user.save();
      await user.populate('watchlist.animeId');
      const newItem = user.watchlist[user.watchlist.length - 1];
      return res.status(201).json(newItem);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // PATCH /api/watchlist?userId=...&animeId=...
  if (method === 'PATCH' && userId && animeId) {
    // Update watchlist item status
    try {
      const { status } = body;
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(animeId)) {
        return res.status(400).json({ message: 'Invalid user ID or anime ID' });
      }
      const user = await User.findOne({ _id: userId });
      if (!user) return res.status(404).json({ message: 'User not found' });
      const watchlistItem = user.watchlist.find(item => item.animeId.toString() === animeId.toString());
      if (!watchlistItem) return res.status(404).json({ message: 'Watchlist item not found' });
      watchlistItem.status = status;
      await user.save();
      return res.status(200).json(watchlistItem);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // DELETE /api/watchlist?userId=...&animeId=...
  if (method === 'DELETE' && userId && animeId) {
    // Remove from watchlist
    try {
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(animeId)) {
        return res.status(400).json({ message: 'Invalid user ID or anime ID' });
      }
      const user = await User.findOne({ _id: userId });
      if (!user) return res.status(404).json({ message: 'User not found' });
      const itemIndex = user.watchlist.findIndex(item => item.animeId.toString() === animeId.toString());
      if (itemIndex === -1) return res.status(404).json({ message: 'Watchlist item not found' });
      user.watchlist.splice(itemIndex, 1);
      await user.save();
      return res.status(200).json({ message: 'Removed from watchlist' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
  res.status(405).end(`Method ${method} Not Allowed`);
} 