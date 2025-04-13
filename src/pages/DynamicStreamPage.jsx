import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';

const DynamicStreamPage = () => {
    const { id } = useParams();
    const [anime, setAnime] = useState(null);
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
        <div className="pt-20 px-4 min-h-screen bg-gray-900">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold text-white mb-6">{anime.name}</h1>
                <div className="aspect-w-16 aspect-h-9">
                    {/* Add your video player component here */}
                    <div className="w-full h-96 bg-gray-800 rounded-lg flex items-center justify-center">
                        <p className="text-gray-400">Video player will be implemented here</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DynamicStreamPage; 