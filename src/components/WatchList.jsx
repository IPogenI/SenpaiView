import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

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
      toast.error('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    }
  }, [user]);

  const handleRating = async (animeId, rating) => {
    try {
      await axios.post(`http://localhost:8000/api/ratings/${user._id}/anime/${animeId}`, {
        rating
      });
      fetchWatchlist(); // Refresh the list to update ratings
      toast.success('Rating updated successfully');
    } catch (error) {
      toast.error('Failed to update rating');
    }
  };

  const removeFromWatchlist = async (animeId) => {
    try {
      await axios.delete(`http://localhost:8000/api/watchlist/${user._id}/anime/${animeId}`);
      fetchWatchlist(); // Refresh the list
      toast.success('Removed from watchlist');
    } catch (error) {
      toast.error('Failed to remove from watchlist');
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
            <Star size={16} fill={star <= userRating ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">My Watchlist</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {watchlist.map((item) => (
          <div key={item._id} className="bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold hover:text-blue-400 cursor-pointer"
                onClick={() => navigate(`/anime/${item.animeId._id}`)}>
                {item.animeId.name}
              </h3>
              <button
                onClick={() => removeFromWatchlist(item.animeId._id)}
                className="flex items-center gap-1 px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
              >
                <Trash2 size={14} />
                Remove
              </button>
            </div>

            <div className="text-gray-400 text-sm mb-2">
              <p>Episodes: {item.animeId.episodes || 'N/A'}</p>
              <p>Status: {item.status}</p>
              <p>Genres: {item.animeId.genres}</p>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm mb-1">Your Rating:</p>
                <StarRating
                  rating={5}
                  userRating={item.animeId.userRating}
                  onRate={(rating) => handleRating(item.animeId._id, rating)}
                />
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Avg Rating</p>
                <p className="text-lg font-bold text-yellow-400">{item.animeId.averageRating}</p>
              </div>
            </div>
          </div>
        ))}
        {watchlist.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-4">
            No items in watchlist
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist; 