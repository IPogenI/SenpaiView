import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Calendar, Film, Trash2 } from 'lucide-react';
import { FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import StarRating from '../components/StarRating';

const WatchHistoryPage = () => {
    const [watchHistory, setWatchHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }
        fetchWatchHistory();
    }, [user, navigate]);

    const fetchWatchHistory = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8000/api/watch-history/${user._id}`);
            setWatchHistory(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching watch history:', error);
            setError('Failed to load watch history');
        } finally {
            setLoading(false);
        }
    };

    const removeFromWatchHistory = async (animeId) => {
        try {
            await axios.delete(`http://localhost:8000/api/watch-history/${user._id}/anime/${animeId}`);
            // Refresh the watch history after removal
            fetchWatchHistory();
        } catch (error) {
            console.error('Error removing from watch history:', error);
        }
    };

    const handleRating = async (animeId, rating) => {
        try {
            await axios.post(`http://localhost:8000/api/ratings/${user._id}/anime/${animeId}`, {
                rating
            });
            // Refresh the watch history to update ratings
            fetchWatchHistory();
        } catch (error) {
            console.error('Error rating anime:', error);
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

    return (
        <div className="min-h-screen pt-20 px-4 bg-gray-900 w-screen overflow-x-hidden">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold text-white mb-6">Watch History</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {watchHistory.map((item) => (
                        <div key={item._id} className="bg-gray-800 rounded-lg p-6 shadow-lg">
                            <div className="flex justify-between items-start mb-3">
                                <h2 className="text-xl font-semibold text-white hover:text-blue-400 cursor-pointer" onClick={() => navigate(`/anime/${item.animeId._id}`)}>{item.animeId.name}</h2>
                                <button
                                    onClick={() => removeFromWatchHistory(item.animeId._id)}
                                    className="flex items-center gap-1 px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                                >
                                    <Trash2 size={16} />
                                    Remove
                                </button>
                            </div>

                            <div className="text-gray-400 mb-3">
                                <p>Episodes: {item.animeId.episodes || 'N/A'}</p>
                                <p>Status: {item.animeId.status}</p>
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

                            <div className="mt-4">
                                <Link
                                    to={`/anime/${item.animeId._id}/watch`}
                                    className="flex items-center gap-1 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    <Play size={16} />
                                    Continue Watching
                                </Link>
                            </div>
                        </div>
                    ))}
                    {watchHistory.length === 0 && (
                        <div className="col-span-full text-center text-gray-400 py-8">
                            No items in watch history
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WatchHistoryPage; 