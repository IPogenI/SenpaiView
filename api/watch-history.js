import dbConnect from '../server/db/db.js';
import mongoose from 'mongoose';
import User from '../server/models/User.js';
import AnimeListModel from '../server/models/AnimeList.js';
import Rating from '../server/models/Rating.js';

export default async function handler(req, res) {
  await dbConnect();
  const { method, query, body } = req;
  const { userId, animeId } = query;

  // GET /api/watch-history?userId=...
  if (method === 'GET' && userId) {
    try {
      const user = await User.findOne({ _id: userId })
        .populate({ path: 'watchHistory.animeId', select: 'name episodes genres status premiered rating popularity' });
      if (!user) return res.status(404).json({ message: 'User not found' });
      const watchHistoryWithRatings = await Promise.all(user.watchHistory.map(async (item) => {
        if (!item.animeId) return null;
        try {
          const userRating = await Rating.findOne({ animeId: item.animeId._id.toString(), userId });
          const allRatings = await Rating.find({ animeId: item.animeId._id.toString() });
          const totalRatings = allRatings.length;
          const averageRating = totalRatings > 0 ? allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings : 0;
          return {
            ...item.toObject(),
            animeId: {
              ...item.animeId.toObject(),
              userRating: userRating?.rating || 0,
              averageRating: Math.round(averageRating * 10) / 10
            }
          };
        } catch (error) {
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
      const sortedHistory = watchHistoryWithRatings.filter(item => item !== null).sort((a, b) => b.watchedAt - a.watchedAt);
      return res.status(200).json(sortedHistory);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // POST /api/watch-history?userId=...&animeId=...
  if (method === 'POST' && userId && animeId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(animeId)) {
        return res.status(400).json({ message: 'Invalid user ID or anime ID' });
      }
      const anime = await AnimeListModel.findById(animeId);
      if (!anime) return res.status(404).json({ message: 'Anime not found' });
      const user = await User.findOne({ _id: userId });
      if (!user) return res.status(404).json({ message: 'User not found' });
      const existingEntry = user.watchHistory.find(item => item.animeId.toString() === animeId.toString());
      if (existingEntry) {
        existingEntry.watchedAt = new Date();
        await user.save();
        return res.status(200).json(existingEntry);
      }
      user.watchHistory.push({ animeId, watchedAt: new Date() });
      await user.save();
      await user.populate('watchHistory.animeId');
      const newItem = user.watchHistory[user.watchHistory.length - 1];
      return res.status(201).json(newItem);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // DELETE /api/watch-history?userId=...&animeId=...
  if (method === 'DELETE' && userId && animeId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(animeId)) {
        return res.status(400).json({ message: 'Invalid user ID or anime ID' });
      }
      const user = await User.findOne({ _id: userId });
      if (!user) return res.status(404).json({ message: 'User not found' });
      const itemIndex = user.watchHistory.findIndex(item => item.animeId.toString() === animeId.toString());
      if (itemIndex === -1) return res.status(404).json({ message: 'Watch history item not found' });
      user.watchHistory.splice(itemIndex, 1);
      await user.save();
      return res.status(200).json({ message: 'Removed from watch history' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  res.status(405).end(`Method ${method} Not Allowed`);
} 