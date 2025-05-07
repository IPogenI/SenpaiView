import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { User, Mail, Shield, Clock, Star, List, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import Watchlist from '../components/Watchlist';
import WatchHistory from '../components/WatchHistory';

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    watchlistCount: 0,
    watchHistoryCount: 0,
    ratingsCount: 0,
    averageRating: 0
  });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchUserStats();
    fetchRecommendations();
  }, [user, navigate]);

  const fetchUserStats = async () => {
    try {
      // const [watchlistRes, historyRes, ratingsRes] = await Promise.all([
      //   axios.get(`http://localhost:8000/api/watchlist/${user._id}`),
      //   axios.get(`http://localhost:8000/api/watch-history/${user._id}`),
      //   axios.get(`http://localhost:8000/api/ratings/user/${user._id}`)
      // ]);

      // // Calculate average rating
      // const ratings = ratingsRes.data;
      // const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
      // const averageRating = ratings.length > 0 ? (totalRating / ratings.length).toFixed(1) : 0;

      setStats({
        // watchlistCount: watchlistRes.data.length,
        // watchHistoryCount: historyRes.data.length,
        // ratingsCount: ratings.length,
        // averageRating
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      toast.error('Failed to load user statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await api.get(`/watchlist/${user._id}/recommendations`);

      // Get ratings for each recommended anime
      const recommendationsWithRatings = await Promise.all(response.data.map(async (anime) => {
        try {
          const allRatingsRes = await api.get(`/ratings/anime/${anime._id}`);
          const { stats } = allRatingsRes.data;
          const averageRating = stats ? stats.averageRating : 0;

          return {
            ...anime,
            averageRating: averageRating.toFixed(1)
          };
        } catch (error) {
          return {
            ...anime,
            averageRating: '0.0'
          };
        }
      }));

      // Remove duplicates based on anime ID
      const uniqueRecommendations = recommendationsWithRatings.reduce((acc, current) => {
        const x = acc.find(item => item._id === current._id);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);

      setRecommendations(uniqueRecommendations.slice(0, 3)); // Show only top 3 recommendations
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const addToWatchlist = async (animeId) => {
    try {
      await api.post(`/watchlist/${user._id}/anime/${animeId}`, {
        status: 'Plan to Watch'
      });
      fetchUserStats(); // Refresh stats
      fetchRecommendations(); // Refresh recommendations
      toast.success('Added to watchlist');
    } catch (error) {
      toast.error('Failed to add to watchlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center">
              <User size={48} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <div className="flex items-center space-x-2 text-gray-400 mt-2">
                <Mail size={16} />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400 mt-1">
                <Shield size={16} />
                <span>{user.isAdmin ? 'Admin' : 'User'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <List size={24} className="text-blue-500" />
              <div>
                <p className="text-gray-400">Watchlist</p>
                <p className="text-2xl font-bold">{stats.watchlistCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <Clock size={24} className="text-green-500" />
              <div>
                <p className="text-gray-400">Watch History</p>
                <p className="text-2xl font-bold">{stats.watchHistoryCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <Star size={24} className="text-yellow-500" />
              <div>
                <p className="text-gray-400">Ratings</p>
                <p className="text-2xl font-bold">{stats.ratingsCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <Star size={24} className="text-purple-500" />
              <div>
                <p className="text-gray-400">Avg Rating</p>
                <p className="text-2xl font-bold">{stats.averageRating}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Watchlist Section */}
        <div className="mb-8">
          <Watchlist />
        </div>

        {/* Watch History */}
        <div className="mb-8">
          <WatchHistory limit={3} />
        </div>

        {/* Recommendations */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((anime) => (
              <div key={anime._id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold hover:text-blue-400 cursor-pointer"
                    onClick={() => navigate(`/anime/${anime._id}`)}>
                    {anime.name}
                  </h3>
                  <button
                    onClick={() => addToWatchlist(anime._id)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700 text-sm"
                  >
                    <Plus size={14} />
                    Add
                  </button>
                </div>
                <div className="text-gray-400 text-sm">
                  <p>Episodes: {anime.episodes || 'N/A'}</p>
                  <p>Genres: {anime.genres}</p>
                </div>
                <div className="mt-2 text-right">
                  <p className="text-gray-400 text-sm">Rating</p>
                  <p className="text-xl font-bold text-yellow-400">{anime.averageRating}</p>
                </div>
              </div>
            ))}
            {recommendations.length === 0 && (
              <div className="col-span-full text-center text-gray-400 py-4">
                No recommendations available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
