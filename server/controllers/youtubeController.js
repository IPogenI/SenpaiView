import asyncHandler from "express-async-handler"
import youtubeModel from "../models/Youtube.js"
import axios from 'axios'

// @desc    Get all YouTube channels
// @route   GET /api/youtube
// @access  Public
export const getAllChannels = asyncHandler(async (req, res) => {
    const channels = await youtubeModel.find({})
    res.status(200).json(channels)
})

// @desc    Add a new YouTube channel
// @route   POST /api/youtube
// @access  Private/Admin
export const addChannel = asyncHandler(async (req, res) => {
    if (!req.user.isAdmin) {
        res.status(403)
        throw new Error("Not authorized as admin")
    }

    const { name, channelHandle } = req.body

    if (!name || !channelHandle) {
        res.status(400)
        throw new Error("Please provide name and channel handle")
    }

    try {
        console.log('Adding new channel:', { name, channelHandle });
        
        // First get channel ID using the exact handle
        console.log('Fetching channel ID from YouTube API...');
        const channelResponse = await axios.get(`https://www.googleapis.com/youtube/v3/channels`, {
            params: {
                part: 'id,snippet',
                forHandle: channelHandle.replace('@', ''), // Remove @ symbol if present
                key: process.env.YOUTUBE_API_KEY
            }
        });

        if (!channelResponse.data.items?.length) {
            res.status(404)
            throw new Error('Channel not found on YouTube')
        }

        const channelId = channelResponse.data.items[0].id;
        console.log('Found channel ID:', channelId);

        // Fetch videos for the channel
        console.log('Fetching videos for channel...');
        let videosResponse = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: {
                part: 'snippet',
                channelId: channelId,
                maxResults: 50,
                order: 'date',
                type: 'video',
                key: process.env.YOUTUBE_API_KEY,
                videoDuration: 'long' // First try to get long videos (>20 minutes)
            }
        });

        // If no long videos found, try medium length videos
        if (!videosResponse.data.items?.length) {
            console.log('No long videos found, trying medium length videos...');
            videosResponse = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
                params: {
                    part: 'snippet',
                    channelId: channelId,
                    maxResults: 50,
                    order: 'date',
                    type: 'video',
                    key: process.env.YOUTUBE_API_KEY,
                    videoDuration: 'medium' // Try medium length videos (4-20 minutes)
                }
            });
        }

        console.log('Video search response:', {
            totalResults: videosResponse.data.pageInfo?.totalResults,
            resultsPerPage: videosResponse.data.pageInfo?.resultsPerPage,
            itemCount: videosResponse.data.items?.length,
            durationType: videosResponse.config.params.videoDuration
        });

        let videos = [];
        if (videosResponse.data.items?.length) {
            const videoIds = videosResponse.data.items.map(item => item.id.videoId).join(',');
            console.log('Fetching details for videos:', videoIds);
            
            const videoDetailsResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
                params: {
                    part: 'contentDetails,snippet',
                    id: videoIds,
                    key: process.env.YOUTUBE_API_KEY
                }
            });

            console.log('Video details response:', {
                itemCount: videoDetailsResponse.data.items?.length
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
                    if (!item.contentDetails?.duration) {
                        console.log('Video missing duration:', item.id);
                        return false;
                    }
                    const duration = parseDuration(item.contentDetails.duration);
                    const isShort = duration < 300; // Consider videos under 5 minutes as short videos
                    console.log(`Video ${item.id} duration: ${duration}s, isShort: ${isShort}`);
                    return duration >= 300; // Include videos that are 5 minutes or longer
                })
                .slice(0, 3); // Keep only top 3 long-form videos

            console.log('Filtered videos count:', filteredVideos.length);

            videos = filteredVideos.map(item => ({
                videoId: item.id,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnails: item.snippet.thumbnails,
                publishedAt: item.snippet.publishedAt
            }));

            console.log('Final videos array:', videos);
        }

        // Create the channel with the fetched videos
        console.log('Creating channel in database with videos:', {
            channelHandle,
            videoCount: videos.length
        });

        const channel = await youtubeModel.create({
            name,
            channelHandle,
            channelId,
            videos,
            lastUpdated: new Date()
        })

        console.log('Channel created successfully:', {
            id: channel._id,
            videoCount: channel.videos.length
        });

        res.status(201).json(channel)
    } catch (error) {
        if (error.response?.status === 404) {
            res.status(404)
            throw new Error('Channel not found on YouTube')
        }
        console.error('Error adding channel:', error)
        res.status(500)
        throw new Error('Error adding channel. Please try again.')
    }
})

// @desc    Delete a YouTube channel
// @route   DELETE /api/youtube/:id
// @access  Private/Admin
export const deleteChannel = asyncHandler(async (req, res) => {
    if (!req.user.isAdmin) {
        res.status(403)
        throw new Error("Not authorized as admin")
    }

    const channel = await youtubeModel.findById(req.params.id)

    if (!channel) {
        res.status(404)
        throw new Error("Channel not found")
    }

    await channel.deleteOne()
    res.status(200).json({ message: "Channel removed" })
}) 