import mongoose from 'mongoose';

const animeListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  genres: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  premiered: {
    type: String,
    required: true,
  },
  episodes: {
    type: Number,
    required: true,

  },
  rating: {
    type: Number,

  },
  popularity: {
    type: String,
    required: true,
  },
  doj: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const AnimeListModel = mongoose.model('AnimeList', animeListSchema); 

export default AnimeListModel;
