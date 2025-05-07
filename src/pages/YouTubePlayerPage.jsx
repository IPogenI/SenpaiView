import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FaSpinner } from 'react-icons/fa';

const YouTubePlayerPage = () => {
  const { videoId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentVideo, setCurrentVideo] = useState(location.state?.video || null);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendedVideos = async () => {
      setLoading(true);
      try {
        // First fetch all channels
        const channelsResponse = await api.get('/youtube');
        const channels = channelsResponse.data;
        
        let allVideos = [];

        // Fetch videos for each channel
        for (const channel of channels) {
          const response = await api.get(`/youtube/channel/${channel.channelHandle}`);
          if (response.data && response.data.videos) {
            allVideos = [...allVideos, ...response.data.videos];
          }
        }

        // Filter out the current video and shuffle the rest
        const filtered = allVideos.filter(v => v.videoId !== videoId);
        const shuffled = filtered.sort(() => Math.random() - 0.5);
        setRecommendedVideos(shuffled.slice(0, 10)); // Show up to 10 recommended videos
      } catch (error) {
        console.error('Error fetching recommended videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedVideos();
  }, [videoId]);

  const handleVideoSelect = (video) => {
    setCurrentVideo(video);
    navigate(`/youtube/${video.videoId}`, { state: { video }, replace: true });
  };

  return (
    <div className='flex items-center justify-center w-screen h-screen bg-gray-900'>
      <div className="flex h-[80%] w-[80%] text-white pt-26">
        {/* Main Content Area */}
        <div className="w-3/4 pl-25 pr-25 pb-25">
          <div className="h-full">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title={currentVideo?.title || 'YouTube Video'}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-[60vh] rounded-lg border-2 border-gray-700"
            ></iframe>
            {currentVideo && (
              <div className="mt-4">
                <h2 className="text-xl font-semibold text-white">{currentVideo.title}</h2>
                <p className="text-gray-400 mt-2">
                  {new Date(currentVideo.publishedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar with Recommended Videos */}
        <div className="w-1/4 bg-[#18181c] p-4 overflow-y-auto border border-gray-600 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recommended</h2>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <FaSpinner className="animate-spin text-white" size={32} />
              </div>
            ) : (
              recommendedVideos.map((video) => (
                <div
                  key={video.videoId}
                  onClick={() => handleVideoSelect(video)}
                  className="cursor-pointer mb-4 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors bg-[#2c2c30]"
                >
                  <img
                    src={video.thumbnails?.medium?.url}
                    alt={video.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-2">
                    <h3 className="text-white text-sm font-medium line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(video.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayerPage;
