import dbConnect from '../server/db/db.js';
import mongoose from 'mongoose';
import Rating from '../server/models/Rating.js';

export default async function handler(req, res) {
  await dbConnect();
  const { method, query, body } = req;
  const { userId, animeId } = query;

  // POST /api/ratings?userId=...&animeId=...
  if (method === 'POST' && userId && animeId) {
    try {
      const { rating, review } = body;
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
      return res.status(200).json(ratingDoc);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // GET /api/ratings?animeId=...
  if (method === 'GET' && animeId && !userId) {
    try {
      const ratings = await Rating.find({ animeId }).sort({ createdAt: -1 });
      const totalRatings = ratings.length;
      const averageRating = totalRatings > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
        : 0;
      return res.status(200).json({
        ratings,
        stats: {
          totalRatings,
          averageRating: Math.round(averageRating * 10) / 10
        }
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // GET /api/ratings?animeId=...&userId=...
  if (method === 'GET' && animeId && userId) {
    try {
      const rating = await Rating.findOne({ animeId, userId });
      return res.status(200).json(rating || null);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // DELETE /api/ratings?animeId=...&userId=...
  if (method === 'DELETE' && animeId && userId) {
    try {
      await Rating.findOneAndDelete({ animeId, userId });
      return res.status(200).json({ message: 'Rating deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  res.status(405).end(`Method ${method} Not Allowed`);
} 