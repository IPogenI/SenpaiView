import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';

const YoutubeChannels = () => {
  const [channels] = useState([
    { handle: '@AntikMahmud', name: 'Antik Mahmud' },
    { handle: '@SamimaSraboni', name: 'Samima Sraboni' },
    { handle: '@FrozenFire100', name: 'Frozen Fire' },
    // Add more channels as needed
  ]);

  const [channelVideos, setChannelVideos] = useState({});
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChannelVideos = async (handle) => {
    console.log('Fetching videos for handle:', handle);
    try {
      const response = await axios.get(`http://localhost:8000/api/youtube/channel/${handle}`);
      console.log('API Response:', response.data);
      if (response.data && response.data.videos) {
        console.log('Setting videos for handle:', handle, response.data.videos);
        setChannelVideos(prev => {
          const newState = {
            ...prev,
            [handle]: response.data.videos
          };
          console.log('New channel videos state:', newState);
          return newState;
        });
      } else {
        console.error('Invalid response format:', response.data);
      }
    } catch (error) {
      console.error(`Error fetching videos for ${handle}:`, error);
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
    setSelectedVideo(video);
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

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex-1 relative">
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`}
              title={selectedVideo.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            ></iframe>
          </div>
          <div className="bg-gray-900 p-4 flex items-center justify-between">
            <h3 className="text-white text-xl font-semibold truncate mr-4">
              {selectedVideo.title}
            </h3>
            <button
              onClick={() => setSelectedVideo(null)}
              className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <span>Close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default YoutubeChannels;
