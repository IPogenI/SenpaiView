import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, Plus, Check } from 'lucide-react';
import { FaSpinner } from 'react-icons/fa';

const AllAnimePage = () => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = "1"; // Replace with actual user authentication

  useEffect(() => {
    fetchAnimeList();
  }, []);

  const fetchAnimeList = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/anime');
      // Get watchlist status for each anime
      const watchlistRes = await axios.get(`http://localhost:8000/api/watchlist/${userId}`);
      const watchlistMap = new Map(watchlistRes.data.map(item => [item.animeId._id, item]));

      // Get user ratings for each anime
      const animeWithDetails = await Promise.all(response.data.map(async (anime) => {
        try {
          const ratingRes = await axios.get(`http://localhost:8000/api/ratings/anime/${anime._id}/user/${userId}`);
          const allRatingsRes = await axios.get(`http://localhost:8000/api/ratings/anime/${anime._id}`);

          const { stats } = allRatingsRes.data;
          const averageRating = stats ? stats.averageRating : 0;

          return {
            ...anime,
            userRating: ratingRes.data?.rating || 0,
            averageRating: averageRating.toFixed(1),
            inWatchlist: watchlistMap.has(anime._id)
          };
        } catch (error) {
          return {
            ...anime,
            userRating: 0,
            averageRating: '0.0',
            inWatchlist: false
          };
        }
      }));

      setAnimeList(animeWithDetails);
    } catch (error) {
      console.error('Error fetching anime list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (animeId, rating) => {
    try {
      await axios.post('http://localhost:8000/api/ratings', {
        userId,
        animeId,
        rating
      });
      fetchAnimeList(); // Refresh the list to update ratings
    } catch (error) {
      console.error('Error rating anime:', error);
    }
  };

  const addToWatchlist = async (animeId) => {
    try {
      await axios.post('http://localhost:8000/api/watchlist', {
        userId,
        animeId,
        status: 'Plan to Watch'
      });
      fetchAnimeList(); // Refresh the list to update watchlist status
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const StarRating = ({ rating, onRate, userRating }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRate(star)}
            className={`${star <= userRating ? 'text-yellow-400' : 'text-gray-400'
              } hover:text-yellow-400 transition-colors`}
          >
            <Star size={20} fill={star <= userRating ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
    );
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center w-screen h-screen bg-black">
        <FaSpinner className="animate-spin text-gray-800" size={40} />
      </div>
    );
  }

  return (
    <div className="pt-20 px-4 bg-black  w-screen overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">All Anime</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {animeList.map((anime) => (
            <div key={anime._id} className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-semibold text-white">{anime.name}</h2>
                <button
                  onClick={() => !anime.inWatchlist && addToWatchlist(anime._id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded ${anime.inWatchlist
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  disabled={anime.inWatchlist}
                >
                  {anime.inWatchlist ? <Check size={16} /> : <Plus size={16} />}
                  {anime.inWatchlist ? 'Added' : 'Add to Watchlist'}
                </button>
              </div>

              <div className="text-gray-400 mb-3">
                <p>Episodes: {anime.episodes || 'N/A'}</p>
                <p>Status: {anime.status}</p>
                <p>Genres: {anime.genres}</p>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 mb-1">Your Rating:</p>
                  <StarRating
                    rating={5}
                    userRating={anime.userRating}
                    onRate={(rating) => handleRating(anime._id, rating)}
                  />
                </div>
                <div className="text-right">
                  <p className="text-gray-400">Average Rating</p>
                  <p className="text-2xl font-bold text-yellow-400">{anime.averageRating}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllAnimePage;
