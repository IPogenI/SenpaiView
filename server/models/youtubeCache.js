import mongoose from 'mongoose';

const youtubeCacheSchema = new mongoose.Schema({
  channelHandle: {
    type: String,
    required: true,
    unique: true
  },
  channelId: {
    type: String,
    required: true
  },
  videos: [{
    videoId: String,
    title: String,
    description: String,
    thumbnails: {
      default: { url: String, width: Number, height: Number },
      medium: { url: String, width: Number, height: Number },
      high: { url: String, width: Number, height: Number }
    },
    publishedAt: Date
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('YoutubeCache', youtubeCacheSchema);
