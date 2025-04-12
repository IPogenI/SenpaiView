import express from 'express';
import YoutubeCache from '../models/youtubeCache.js';
import axios from 'axios';

const router = express.Router();

// Helper function to check if cache is stale (older than 1 hour)
const isCacheStale = (lastUpdated) => {
  const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
  return Date.now() - new Date(lastUpdated).getTime() > oneHour;
};

// Get channel videos (with caching)
router.get('/channel/:handle', async (req, res) => {
  console.log('Fetching videos for handle:', req.params.handle);
  try {
    const { handle } = req.params;
    
    // Check cache first
    let cacheEntry = await YoutubeCache.findOne({ channelHandle: handle });
    
    // If cache exists and is not stale, return cached data
    if (cacheEntry && !isCacheStale(cacheEntry.lastUpdated)) {
      console.log('Cache hit! Age:', Math.round((Date.now() - new Date(cacheEntry.lastUpdated).getTime()) / 1000), 'seconds');
      console.log('Returning', cacheEntry.videos.length, 'cached videos for:', req.params.handle);
      return res.json({
        channelId: cacheEntry.channelId,
        videos: cacheEntry.videos
      });
    }
    
    console.log('Cache miss or stale for:', handle, '- fetching fresh data');

    // If no cache or stale, fetch from YouTube API
    // First get channel ID
    console.log('Cache miss or stale, fetching from YouTube API');
    const channelResponse = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
      params: {
        part: 'snippet',
        q: handle,
        type: 'channel',
        key: process.env.YOUTUBE_API_KEY
      }
    });

    if (!channelResponse.data.items?.length) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const channelId = channelResponse.data.items[0].id.channelId;
    console.log('Found channel ID:', channelId);

    // Get recent videos (fetch more since we'll filter out Shorts)
    console.log('Fetching videos for channel ID:', channelId);
    const videosResponse = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
      params: {
        part: 'snippet',
        channelId: channelId,
        maxResults: 50, // Fetch more since we'll filter out Shorts
        order: 'date',
        type: 'video',
        key: process.env.YOUTUBE_API_KEY
      }
    });
    
    console.log('Search response:', {
      totalResults: videosResponse.data.pageInfo?.totalResults,
      resultsPerPage: videosResponse.data.pageInfo?.resultsPerPage,
      itemCount: videosResponse.data.items?.length
    });

    if (!videosResponse.data.items?.length) {
      console.log('No videos found for channel:', channelId);
      return res.json({ channelId, videos: [] });
    }

    // Get video details to check duration
    const searchResults = videosResponse.data.items || [];
    if (!searchResults.length) {
      console.log('No videos found in search results');
      return res.json({ channelId, videos: [] });
    }

    console.log('Search returned', searchResults.length, 'videos');
    const videoIds = searchResults.map(item => item.id.videoId).join(',');
    if (!videoIds) {
      console.log('No valid video IDs found in search results');
      return res.json({ channelId, videos: [] });
    }

    console.log('Fetching details for videos:', videoIds);

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

    console.log('Video details response:', videoDetailsResponse.data);

    // Filter out Shorts (videos less than 5 minutes) and map to desired format
    let allVideos = videoDetailsResponse.data.items || [];
    console.log(`Processing ${allVideos.length} total videos`);

    let filteredVideos = allVideos
      .filter(item => {
        if (!item.contentDetails?.duration) {
          console.log(`Video ${item.id} - ${item.snippet?.title} - No duration found`);
          return false;
        }
        const duration = parseDuration(item.contentDetails.duration);
        const isShort = duration < 300;
        console.log(`Video ${item.id} - ${item.snippet?.title} - duration: ${duration}s, isShort: ${isShort}`);
        return !isShort;
      });

    console.log(`Found ${filteredVideos.length} videos longer than 5 minutes`);
    
    const videos = filteredVideos
      .slice(0, 10) // Show up to 10 non-Shorts videos
      .map(item => ({
        videoId: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnails: item.snippet.thumbnails,
        publishedAt: item.snippet.publishedAt
      }));
    
    console.log('Final video list:', videos.map(v => ({ id: v.videoId, title: v.title })));

    console.log('Final videos to be sent:', videos);

    console.log(`Found ${videos.length} non-Short videos for channel:`, channelId);

    console.log('Fetched videos:', videos);
    // Update or create cache
    try {
      if (cacheEntry) {
        console.log('Updating existing cache for:', handle);
        cacheEntry.videos = videos;
        cacheEntry.lastUpdated = new Date();
        await cacheEntry.save();
        console.log('Cache updated successfully with', videos.length, 'videos');
      } else {
        console.log('Creating new cache entry for:', handle);
        await YoutubeCache.create({
          channelHandle: handle,
          channelId,
          videos,
          lastUpdated: new Date()
        });
        console.log('New cache entry created with', videos.length, 'videos');
      }
    } catch (error) {
      console.error('Error updating cache:', error);
      // Don't throw the error - we still want to return the videos even if caching fails
    }

    res.json({ channelId, videos });
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    res.status(500).json({ message: 'Error fetching YouTube data' });
  }
});

export default router;
