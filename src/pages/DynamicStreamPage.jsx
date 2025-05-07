import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';
import ReactPlayer from 'react-player/lazy';

const DynamicStreamPage = () => {
    const { id } = useParams();
    const [anime, setAnime] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [selectedEp, setSelectedEp] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }
        fetchAnimeDetails();
    }, [id, user, navigate]);

    const fetchAnimeDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8000/api/anime/${id}`);
            setAnime(response.data);
            setError(null);

            // Fetch episodes using the anime name
            const episodesRes = await axios.get(`http://localhost:8000/api/anime/episodes?title=${encodeURIComponent(response.data.name)}`);
            if (episodesRes.data.episodes && episodesRes.data.episodes.length > 0) {
                setEpisodes(episodesRes.data.episodes);
            } else {
                setError('No episodes available');
            }
        } catch (error) {
            console.error('Error fetching anime details:', error);
            setError('Failed to load anime details');
        } finally {
            setLoading(false);
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
        <div className="min-h-screen pt-20 px-4 bg-gray-900">
            <div className="max-w-6xl mx-auto">
                {anime && (
                    <h1 className="text-2xl font-bold text-white mb-6">{anime.name}</h1>
                )}

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Video player */}
                    <div className="w-full lg:w-2/3">
                        {episodes.length > 0 ? (
                            <div className="aspect-video w-full">
                                <ReactPlayer
                                    url={episodes[selectedEp]}
                                    controls
                                    width="100%"
                                    height="100%"
                                    className="react-player rounded-lg border-2 border-gray-700"
                                />
                            </div>
                        ) : (
                            <div className="text-center text-gray-400">
                                No episodes available
                            </div>
                        )}
                    </div>

                    {/* Episodes sidebar */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-gray-800 rounded-lg p-4">
                            <h2 className="text-xl font-semibold text-white mb-4">Episodes</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto">
                                {episodes.map((episode, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedEp(index)}
                                        className={`p-2 rounded-lg text-sm ${selectedEp === index
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                    >
                                        Episode {index + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DynamicStreamPage; 