import express from 'express';
import Youtube from '../models/Youtube.js';
import axios from 'axios';
import { protect } from "../middleware/authMiddleware.js"
import {
  getAllChannels,
  addChannel,
  deleteChannel
} from "../controllers/youtubeController.js"

const router = express.Router();

// Helper function to check if cache is stale (older than 1 hour)
const isCacheStale = (lastUpdated) => {
  const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
  return Date.now() - new Date(lastUpdated).getTime() > oneHour;
};

// Get channel videos (with caching)
router.get('/channel/:handle', async (req, res) => {
  try {
    const { handle } = req.params;

    // Check if channel exists in database
    const channel = await Youtube.findOne({ channelHandle: handle });

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found in database' });
    }

    // If cache is not stale, return cached data
    if (!isCacheStale(channel.lastUpdated)) {
      return res.json({
        channelId: channel.channelId,
        videos: channel.videos
      });
    }

    console.log('Cache stale for:', handle, '- fetching fresh data');

    // Fetch fresh data from YouTube API
    const videosResponse = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
      params: {
        part: 'snippet',
        channelId: channel.channelId,
        maxResults: 25,
        order: 'date',
        type: 'video',
        key: process.env.YOUTUBE_API_KEY
      }
    });

    if (!videosResponse.data.items?.length) {
      return res.json({ channelId: channel.channelId, videos: [] });
    }

    const videoIds = videosResponse.data.items.map(item => item.id.videoId).join(',');

    const videoDetailsResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
      params: {
        part: 'contentDetails,snippet',
        id: videoIds,
        key: process.env.YOUTUBE_API_KEY
      }
    });

    // Helper function to convert YouTube duration to seconds
    const parseDuration = (duration) => {
      try {
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return 0;
        const [, hours, minutes, seconds] = match;
        return (parseInt(hours) || 0) * 3600 + (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0);
      } catch (error) {
        console.error('Error parsing duration:', duration, error);
        return 0;
      }
    };

    // Filter out Shorts and map to desired format
    const filteredVideos = videoDetailsResponse.data.items
      .filter(item => {
        if (!item.contentDetails?.duration) return false;
        const duration = parseDuration(item.contentDetails.duration);
        return duration >= 300; // Include videos that are 5 minutes or longer
      })
      .slice(0, 3)
      .map(item => ({
        videoId: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnails: item.snippet.thumbnails,
        publishedAt: item.snippet.publishedAt
      }));

    // Update channel's videos and lastUpdated
    channel.videos = filteredVideos;
    channel.lastUpdated = new Date();
    await channel.save();

    res.json({ channelId: channel.channelId, videos: filteredVideos });
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    res.status(500).json({ message: 'Error fetching YouTube data' });
  }
});

// Public route to get all channels
router.get("/", getAllChannels);

// Protected routes for admin operations
router.post("/", protect, addChannel);
router.delete("/:id", protect, deleteChannel);

export default router;
