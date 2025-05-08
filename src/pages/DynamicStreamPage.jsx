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

                <div className="flex gap-10">
                    {/* Video player on the left */}
                    <div className="pr-4 flex items-center justify-center">
                        {episodes.length > 0 ? (
                            <ReactPlayer
                                url={episodes[selectedEp]}
                                controls
                                width="50vw"
                                height="55vh"
                                className="react-player rounded-lg border-2 border-gray-700"
                            />
                        ) : (
                            <div className="text-center text-gray-400">
                                No episodes available
                            </div>
                        )}
                    </div>

                    {/* Episodes sidebar on the right */}
                    <div className="h-[55vh] w-[25vw] bg-[#18181c] p-4 overflow-y-auto border border-gray-600 rounded-lg">
                        <h2 className="text-lg font-semibold mb-4 text-center">Episodes</h2>
                        {error && <p className="text-red-500 mb-4">{error}</p>}
                        {episodes.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-2">
                                {episodes.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedEp(index)}
                                        className={`w-10 h-10 rounded-md text-sm font-medium shadow-sm flex items-center justify-center transition-all duration-200 ${selectedEp === index
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-[#2c2c30] text-gray-300 hover:bg-[#38383e]'
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DynamicStreamPage; 