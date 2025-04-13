import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Plus, Star, Calendar, Film, Award, Play } from 'lucide-react';
import { FaSpinner } from 'react-icons/fa';

const AnimeDetailsPage = () => {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [imdbData, setImdbData] = useState(null);
  const [addedToWatchlist, setAddedToWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  useEffect(() => {
    fetchAnimeDetails();
  }, [id]);

  useEffect(() => {
    if (anime) {
      checkWatchlistStatus();
    }
  }, [anime, user]);

  const fetchAnimeDetails = async () => {
    try {
      setLoading(true);
      // Fetch basic anime details
      const response = await axios.get(`http://localhost:8000/api/anime/${id}`);
      setAnime(response.data);

      // Fetch IMDB data
      // Clean up the anime name for better IMDB search results
      const searchTitle = response.data.name
        .replace(/Season \d+/i, '') // Remove "Season X"
        .replace(/\(.*?\)/g, '')   // Remove anything in parentheses
        .replace(/\[.*?\]/g, '')   // Remove anything in square brackets
        .trim();

      console.log('Searching IMDB for:', searchTitle);
      const imdbResponse = await axios.get(`http://localhost:8000/api/imdb/${encodeURIComponent(searchTitle)}`);
      setImdbData(imdbResponse.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching anime details:', error);
      setError('Failed to load anime details');
    } finally {
      setLoading(false);
    }
  };

  const checkWatchlistStatus = async () => {
    try {
      if (!anime?._id) return;

      const response = await axios.get(`http://localhost:8000/api/watchlist/${user._id}/check/${anime._id}`);
      setAddedToWatchlist(response.data.inWatchlist);
    } catch (error) {
      setAddedToWatchlist(false);
    }
  };

  const addToWatchlist = async () => {
    try {
      if (!anime?._id) {
        return;
      }

      await axios.post(`http://localhost:8000/api/watchlist/${user._id}/anime/${anime._id}`, {
        status: 'Plan to Watch'
      });

      setAddedToWatchlist(true);
    } catch (error) {
      // Handle error silently
    }
  };

  const handleWatchNow = async () => {
    try {
      await axios.post(`http://localhost:8000/api/watch-history/${user._id}/anime/${anime._id}`);
      navigate(`/anime/${anime._id}/watch`);
    } catch (error) {
      // Still navigate even if watch history fails
      navigate(`/anime/${anime._id}/watch`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center w-screen h-screen bg-gray-900">
        <FaSpinner className="animate-spin text-gray-600" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 px-4 min-h-screen bg-gray-900">
        <div className="max-w-4xl mx-auto text-red-400">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!anime) {
    return null;
  }

  return (
    <div className="pt-20 px-4 min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Poster */}
            <div className="md:col-span-1">
              {imdbData?.poster && imdbData.poster !== 'N/A' ? (
                <img
                  src={imdbData.poster}
                  alt={anime.name}
                  className="w-full rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full h-96 bg-gray-700 rounded-lg flex items-center justify-center">
                  <Film size={48} className="text-gray-600" />
                </div>
              )}
              <button
                onClick={addToWatchlist}
                disabled={addedToWatchlist}
                className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-lg ${addedToWatchlist
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                <Plus size={20} />
                {addedToWatchlist ? 'Added to Watchlist' : 'Add to Watchlist'}
              </button>

              <button
                onClick={handleWatchNow}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                <Play size={20} />
                Watch Now
              </button>
            </div>

            {/* Right Column - Details */}
            <div className="md:col-span-2">
              <h1 className="text-4xl font-bold text-white mb-4">{anime.name}</h1>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-yellow-400">
                  <Star size={20} />
                  <span className="text-2xl font-bold">
                    {imdbData?.imdbRating || 'N/A'}
                  </span>
                  <span className="text-gray-400 text-sm">IMDB Rating</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar size={20} />
                  <span>{imdbData?.year || 'N/A'}</span>
                </div>
              </div>

              {imdbData?.plot && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white mb-2">Plot</h2>
                  <p className="text-gray-300 leading-relaxed">{imdbData.plot}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Details</h2>
                  <ul className="space-y-2 text-gray-300">
                    <li><span className="text-gray-400">Episodes:</span> {anime.episodes || 'N/A'}</li>
                    <li><span className="text-gray-400">Genres:</span> {imdbData?.genre || anime.genres || 'N/A'}</li>
                    <li><span className="text-gray-400">Total Seasons:</span> {imdbData?.totalSeasons || 'N/A'}</li>
                    <li><span className="text-gray-400">Rated:</span> {imdbData?.rated || 'N/A'}</li>
                  </ul>
                </div>

                {(imdbData?.director || imdbData?.writer || imdbData?.actors) && (
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">Cast & Crew</h2>
                    <ul className="space-y-2 text-gray-300">
                      {imdbData.director && <li><span className="text-gray-400">Director:</span> {imdbData.director}</li>}
                      {imdbData.writer && <li><span className="text-gray-400">Writer:</span> {imdbData.writer}</li>}
                      {imdbData.actors && <li><span className="text-gray-400">Actors:</span> {imdbData.actors}</li>}
                    </ul>
                  </div>
                )}
              </div>

              {imdbData?.awards && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 text-yellow-400 mb-2">
                    <Award size={20} />
                    <h2 className="text-xl font-semibold">Awards</h2>
                  </div>
                  <p className="text-gray-300">{imdbData.awards}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetailsPage;
