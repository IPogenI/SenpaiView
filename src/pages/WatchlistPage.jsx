import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Trash2 } from 'lucide-react';
import { FaSpinner } from 'react-icons/fa';

const WatchlistPage = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    }
  }, [user]);

  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/watchlist/${user._id}`);
      
      // Get ratings for each anime in watchlist
      const watchlistWithDetails = await Promise.all(response.data.map(async (item) => {
        try {
          const ratingRes = await axios.get(`http://localhost:8000/api/ratings/anime/${item.animeId._id}/user/${user._id}`);
          const allRatingsRes = await axios.get(`http://localhost:8000/api/ratings/anime/${item.animeId._id}`);

          const { stats } = allRatingsRes.data;
          const averageRating = stats ? stats.averageRating : 0;

          return {
            ...item,
            animeId: {
              ...item.animeId,
              userRating: ratingRes.data?.rating || 0,
              averageRating: averageRating.toFixed(1)
            }
          };
        } catch (error) {
          return {
            ...item,
            animeId: {
              ...item.animeId,
              userRating: 0,
              averageRating: '0.0'
            }
          };
        }
      }));

      setWatchlist(watchlistWithDetails);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      setError('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (animeId, rating) => {
    try {
      await axios.post(`http://localhost:8000/api/ratings/${user._id}/anime/${animeId}`, {
        rating
      });
      fetchWatchlist(); // Refresh the list to update ratings
    } catch (error) {
      console.error('Error rating anime:', error);
    }
  };

  const removeFromWatchlist = async (animeId) => {
    try {
      await axios.delete(`http://localhost:8000/api/watchlist/${user._id}/anime/${animeId}`);
      fetchWatchlist(); // Refresh the list
    } catch (error) {
      console.error('Error removing from watchlist:', error);
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
      <div className="flex justify-center items-center w-screen h-screen bg-gray-900">
        <FaSpinner className="animate-spin text-gray-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 bg-gray-900 w-screen overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">My Watchlist</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {watchlist.map((item) => (
            <div key={item._id} className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-semibold text-white hover:text-blue-400 cursor-pointer" onClick={() => navigate(`/anime/${item.animeId._id}`)}>{item.animeId.name}</h2>
                <button
                  onClick={() => removeFromWatchlist(item.animeId._id)}
                  className="flex items-center gap-1 px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>

              <div className="text-gray-400 mb-3">
                <p>Episodes: {item.animeId.episodes || 'N/A'}</p>
                <p>Status: {item.status}</p>
                <p>Genres: {item.animeId.genres}</p>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 mb-1">Your Rating:</p>
                  <StarRating
                    rating={5}
                    userRating={item.animeId.userRating}
                    onRate={(rating) => handleRating(item.animeId._id, rating)}
                  />
                </div>
                <div className="text-right">
                  <p className="text-gray-400">Average Rating</p>
                  <p className="text-2xl font-bold text-yellow-400">{item.animeId.averageRating}</p>
                </div>
              </div>
            </div>
          ))}
          {watchlist.length === 0 && (
            <div className="col-span-full text-center text-gray-400 py-8">
              No items in watchlist
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WatchlistPage;
