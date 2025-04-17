import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const YoutubeChannels = () => {
  const [channels] = useState([
    { handle: '@AntikMahmud', name: 'Antik Mahmud' },
    { handle: '@SamimaSraboni', name: 'Samima Sraboni' },
    { handle: '@FrozenFire100', name: 'Frozen Fire' },
    // Add more channels as needed
  ]);

  const [channelVideos, setChannelVideos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchChannelVideos = async (handle) => {
      try {
      const response = await axios.get(`http://localhost:8000/api/youtube/channel/${handle}`);
        if (response.data && response.data.videos) {
          setChannelVideos(prev => {
          const newState = {
            ...prev,
            [handle]: response.data.videos
          };
            return newState;
        });
      } else {
        }
    } catch (error) {
      console.error(`Error fetching videos for ${handle}:`, error.message);
      setError(`Error loading videos for ${handle}. Please try again later.`);
    }
  };

  // Track which channels we've loaded
  const [loadedChannels, setLoadedChannels] = useState(new Set());

  useEffect(() => {
    const loadAllChannelVideos = async () => {
      setLoading(true);
      setError(null);
      try {
        for (const channel of channels) {
          if (!loadedChannels.has(channel.handle)) {
            console.log('Loading channel:', channel.handle);
            await fetchChannelVideos(channel.handle);
            setLoadedChannels(prev => new Set([...prev, channel.handle]));
          } else {
            console.log('Channel already loaded:', channel.handle);
          }
        }
      } catch (error) {
        setError('Failed to load videos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadAllChannelVideos();
  }, []);

  const handleVideoSelect = (video) => {
    navigate(`/youtube/${video.videoId}`, { state: { video } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-white" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 bg-red-100 p-4 rounded">
        {error}
      </div>
    );
  }

  console.log('Rendering with channelVideos:', channelVideos);
  return (
    <div className="space-y-12">
      {channels.map((channel) => (
        <div key={channel.handle} className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6">{channel.name}</h2>
          
          {/* Video Grid */}
          {console.log('Checking videos for handle:', channel.handle, channelVideos[channel.handle])}
          {channelVideos[channel.handle] ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {channelVideos[channel.handle].map((video) => (
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
