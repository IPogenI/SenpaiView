import dbConnect from '../server/db/db.js';
import Youtube from '../server/models/Youtube.js';
import axios from 'axios';

function isCacheStale(lastUpdated) {
  const oneHour = 60 * 60 * 1000;
  return Date.now() - new Date(lastUpdated).getTime() > oneHour;
}

export default async function handler(req, res) {
  await dbConnect();
  const { method, query, body } = req;

  // GET /api/youtube/channel?handle=...
  if (method === 'GET' && query.handle) {
    try {
      const handle = query.handle;
      let cacheEntry = await Youtube.findOne({ channelHandle: handle });
      if (cacheEntry && !isCacheStale(cacheEntry.lastUpdated)) {
        return res.status(200).json({ channelId: cacheEntry.channelId, videos: cacheEntry.videos });
      }
      // Fetch from YouTube API
      const channelResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
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
      const videosResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          channelId: channelId,
          maxResults: 25,
          order: 'date',
          type: 'video',
          key: process.env.YOUTUBE_API_KEY
        }
      });
      if (!videosResponse.data.items?.length) {
        return res.status(200).json({ channelId, videos: [] });
      }
      const searchResults = videosResponse.data.items || [];
      const videoIds = searchResults.map(item => item.id.videoId).join(',');
      if (!videoIds) {
        return res.status(200).json({ channelId, videos: [] });
      }
      const videoDetailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'contentDetails,snippet',
          id: videoIds,
          key: process.env.YOUTUBE_API_KEY
        }
      });
      const parseDuration = (duration) => {
        try {
          const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
          if (!match) return 0;
          const [, hours, minutes, seconds] = match;
          return (parseInt(hours) || 0) * 3600 + (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0);
        } catch (error) {
          return 0;
        }
      };
      let allVideos = videoDetailsResponse.data.items || [];
      let filteredVideos = allVideos.filter(item => {
        if (!item.contentDetails?.duration) return false;
        const duration = parseDuration(item.contentDetails.duration);
        return duration >= 300;
      });
      const videos = filteredVideos.slice(0, 3).map(item => ({
        videoId: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnails: item.snippet.thumbnails,
        publishedAt: item.snippet.publishedAt
      }));
      // Update or create cache
      try {
        if (cacheEntry) {
          cacheEntry.videos = videos;
          cacheEntry.lastUpdated = new Date();
          await cacheEntry.save();
        } else {
          // Instead of creating a new channel, return 404
          return res.status(404).json({ message: 'Channel not found in database' });
        }
      } catch (error) {
        // Ignore cache errors
      }
      return res.status(200).json({ channelId, videos });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching YouTube data' });
    }
  }

  // GET /api/youtube
  if (method === 'GET') {
    // Get all channels
    try {
      const channels = await Youtube.find({});
      return res.status(200).json(channels);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // POST /api/youtube (admin only, skip auth for now)
  if (method === 'POST') {
    try {
      const { name, channelHandle } = body;
      if (!name || !channelHandle) {
        return res.status(400).json({ message: 'Please provide name and channel handle' });
      }
      // Get channel ID
      const channelResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
        params: {
          part: 'id,snippet',
          forHandle: channelHandle.replace('@', ''),
          key: process.env.YOUTUBE_API_KEY
        }
      });
      if (!channelResponse.data.items?.length) {
        return res.status(404).json({ message: 'Channel not found on YouTube' });
      }
      const channelId = channelResponse.data.items[0].id;
      // Fetch videos for the channel
      let videosResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          channelId: channelId,
          maxResults: 50,
          order: 'date',
          type: 'video',
          key: process.env.YOUTUBE_API_KEY,
          videoDuration: 'long'
        }
      });
      if (!videosResponse.data.items?.length) {
        videosResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            part: 'snippet',
            channelId: channelId,
            maxResults: 50,
            order: 'date',
            type: 'video',
            key: process.env.YOUTUBE_API_KEY,
            videoDuration: 'medium'
          }
        });
      }
      let videos = [];
      if (videosResponse.data.items?.length) {
        const videoIds = videosResponse.data.items.map(item => item.id.videoId).join(',');
        const videoDetailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            part: 'contentDetails,snippet',
            id: videoIds,
            key: process.env.YOUTUBE_API_KEY
          }
        });
        const parseDuration = (duration) => {
          try {
            const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
            if (!match) return 0;
            const [, hours, minutes, seconds] = match;
            return (parseInt(hours) || 0) * 3600 + (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0);
          } catch (error) {
            return 0;
          }
        };
        const filteredVideos = videoDetailsResponse.data.items.filter(item => {
          if (!item.contentDetails?.duration) return false;
          const duration = parseDuration(item.contentDetails.duration);
          return duration >= 300;
        }).slice(0, 3);
        videos = filteredVideos.map(item => ({
          videoId: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnails: item.snippet.thumbnails,
          publishedAt: item.snippet.publishedAt
        }));
      }
      const channel = await Youtube.create({
        name,
        channelHandle,
        channelId,
        videos,
        lastUpdated: new Date()
      });
      return res.status(201).json(channel);
    } catch (error) {
      return res.status(500).json({ message: 'Error adding channel. Please try again.' });
    }
  }

  // DELETE /api/youtube?id=... (admin only, skip auth for now)
  if (method === 'DELETE' && query.id) {
    try {
      const channel = await Youtube.findById(query.id);
      if (!channel) return res.status(404).json({ message: 'Channel not found' });
      await channel.deleteOne();
      return res.status(200).json({ message: 'Channel removed' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  res.status(405).end(`Method ${method} Not Allowed`);
} 