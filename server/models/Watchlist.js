import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  animeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AnimeList',
    required: true,
  },
  status: {
    type: String,
    enum: ['Plan to Watch', 'Watching', 'Completed', 'Dropped'],
    default: 'Plan to Watch'
  },
  addedAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

// Compound index to prevent duplicate entries for the same user and anime
watchlistSchema.index({ userId: 1, animeId: 1 }, { unique: true });

const WatchlistModel = mongoose.model('Watchlist', watchlistSchema);

export default WatchlistModel;
