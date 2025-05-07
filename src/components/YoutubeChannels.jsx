import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const YoutubeChannels = () => {
  const [channels, setChannels] = useState([]);
  const [channelVideos, setChannelVideos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await api.get('/youtube');
        setChannels(response.data);
        
        // Initialize channelVideos with videos from the response
        const initialVideos = {};
        response.data.forEach(channel => {
          if (channel.videos && channel.videos.length > 0) {
            initialVideos[channel.channelHandle] = channel.videos;
          }
        });
        setChannelVideos(initialVideos);
      } catch (error) {
        console.error('Error fetching channels:', error);
        setError('Failed to load channels. Please try again later.');
      }
    };

    fetchChannels();
  }, []);

  const fetchChannelVideos = async (handle) => {
    try {
      const response = await api.get(`/youtube/channel/${handle}`);
      if (response.data && response.data.videos) {
        setChannelVideos(prev => ({
          ...prev,
          [handle]: response.data.videos
        }));
      }
    } catch (error) {
      console.error(`Error fetching videos for ${handle}:`, error.message);
      setError(`Error loading videos for ${handle}. Please try again later.`);
    }
  };

  useEffect(() => {
    const loadAllChannelVideos = async () => {
      setLoading(true);
      setError(null);
      try {
        const refreshPromises = channels.map(async (channel) => {
          // Only fetch if we don't have videos for this channel yet
          if (!channelVideos[channel.channelHandle]) {
            await fetchChannelVideos(channel.channelHandle);
          }
        });
        
        await Promise.all(refreshPromises);
      } catch (error) {
        setError('Failed to load videos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (channels.length > 0) {
      loadAllChannelVideos();
    }
  }, [channels]);

  const handleVideoSelect = (video) => {
    navigate(`/youtube/${video.videoId}`, { state: { video } });
  };

  if (loading && channels.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-white" size={32} />
      </div>
    );
  }

  if (error && channels.length === 0) {
    return (
      <div className="text-red-500 bg-red-100 p-4 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {channels.map((channel) => (
        <div key={channel._id} className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6">{channel.name}</h2>
          
          {/* Video Grid */}
          {channelVideos[channel.channelHandle] ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {channelVideos[channel.channelHandle].map((video) => (
                <div
                  key={video.videoId}
                  className="bg-gray-700 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform duration-200"
                >
                  <div onClick={() => handleVideoSelect(video)} className="cursor-pointer">
                    <img
                      src={video.thumbnails?.medium?.url}
                      alt={video.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-white font-semibold line-clamp-2 mb-2">
                        {video.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {new Date(video.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-32">
              <FaSpinner className="animate-spin text-white" size={32} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default YoutubeChannels;
