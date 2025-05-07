import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Calendar, Film, Trash2, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const WatchHistory = ({ limit }) => {
    const [watchHistory, setWatchHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const fetchWatchHistory = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8000/api/watch-history/${user._id}`);
            // Sort by date in descending order (most recent first) and take only specified number of items
            const sortedHistory = response.data
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                .slice(0, limit);
            setWatchHistory(sortedHistory);
        } catch (error) {
            toast.error('Failed to load watch history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchWatchHistory();
        }
    }, [user, limit]);

    const removeFromWatchHistory = async (animeId) => {
        try {
            await axios.delete(`http://localhost:8000/api/watch-history/${user._id}/anime/${animeId}`);
            fetchWatchHistory();
            toast.success('Removed from watch history');
        } catch (error) {
            toast.error('Failed to remove from watch history');
        }
    };

    const handleRating = async (animeId, rating) => {
        try {
            await axios.post(`http://localhost:8000/api/ratings/${user._id}/anime/${animeId}`, {
                rating
            });
            fetchWatchHistory();
            toast.success('Rating updated successfully');
        } catch (error) {
            toast.error('Failed to update rating');
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
            <h2 className="text-xl font-bold mb-4">Watch History</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {watchHistory.map((item) => (
                    <div key={item._id} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold hover:text-blue-400 cursor-pointer"
                                onClick={() => navigate(`/anime/${item.animeId._id}`)}>
                                {item.animeId.name}
                            </h3>
                            <button
                                onClick={() => removeFromWatchHistory(item.animeId._id)}
                                className="flex items-center gap-1 px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
                            >
                                <Trash2 size={14} />
                                Remove
                            </button>
                        </div>

                        <div className="text-gray-400 text-sm mb-2">
                            <p>Episodes: {item.animeId.episodes || 'N/A'}</p>
                            <p>Status: {item.animeId.status}</p>
                            <p>Genres: {item.animeId.genres}</p>
                        </div>

                        <div className="flex justify-between items-center mb-2">
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

                        <Link
                            to={`/anime/${item.animeId._id}/watch`}
                            className="flex items-center justify-center gap-1 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm w-full"
                        >
                            <Play size={14} />
                            Continue Watching
                        </Link>
                    </div>
                ))}
                {watchHistory.length === 0 && (
                    <div className="col-span-full text-center text-gray-400 py-4">
                        No items in watch history
                    </div>
                )}
            </div>
        </div>
    );
};

export default WatchHistory; 