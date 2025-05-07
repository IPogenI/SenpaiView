import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
        const channelsResponse = await axios.get('http://localhost:8000/api/youtube');
        const channels = channelsResponse.data;

        let allVideos = [];

        // Fetch videos for each channel
        for (const channel of channels) {
          const response = await axios.get(`http://localhost:8000/api/youtube/channel/${channel.channelHandle}`);
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
    <div className='min-h-screen pt-20 px-4 bg-gray-900'>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content Area */}
          <div className="w-full lg:w-3/4">
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title={currentVideo?.title || 'YouTube Video'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg border-2 border-gray-700"
              ></iframe>
            </div>
            {currentVideo && (
              <div className="mt-4">
                <h2 className="text-xl font-semibold text-white">{currentVideo.title}</h2>
                <p className="text-gray-400 mt-2">
                  {new Date(currentVideo.publishedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar with Recommended Videos */}
          <div className="w-full lg:w-1/4">
            <h3 className="text-lg font-semibold text-white mb-4">Recommended Videos</h3>
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center">
                  <FaSpinner className="animate-spin text-white" size={24} />
                </div>
              ) : (
                recommendedVideos.map((video) => (
                  <div
                    key={video.videoId}
                    onClick={() => handleVideoSelect(video)}
                    className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:transform hover:scale-105 transition-transform duration-200"
                  >
                    <img
                      src={video.thumbnails?.medium?.url}
                      alt={video.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-3">
                      <h4 className="text-white font-medium line-clamp-2 text-sm">
                        {video.title}
                      </h4>
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
    </div>
  );
};

export default YouTubePlayerPage;
