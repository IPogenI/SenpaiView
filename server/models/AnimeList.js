import mongoose from 'mongoose';

const animeListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  genres: {
    type: String,
    default: 'N/A',
  },
  status: {
    type: String,
    default: 'Finished Airing',
  },
  premiered: {
    type: String,
    default: 'Spring 2025',
  },
  episodes: {
    type: Number,
    required: true,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  popularity: {
    type: String,
    default: 'N/A',
  },
  doj: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const AnimeListModel = mongoose.model('AnimeList', animeListSchema); 

export default AnimeListModel;
