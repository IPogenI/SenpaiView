import React, { useState } from 'react';
import ReactPlayer from 'react-player/lazy';
import { FiSearch } from 'react-icons/fi';
import api from '../api/axios';
import './Stream.css';

const Stream = () => {
    const [animeName, setAnimeName] = useState('');
    const [episodes, setEpisodes] = useState([]);
    const [selectedEp, setSelectedEp] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchEpisodes = async () => {
        if (!animeName) return;
        setError('');
        setEpisodes([]);
        setSelectedEp(0);
        setLoading(true);

        try {
            const res = await api.get(`/anime/episodes?title=${animeName}`);
            if (res.data.episodes && res.data.episodes.length > 0) {
                setEpisodes(res.data.episodes);
            } else {
                setError('No anime available');
            }
        } catch (err) {
            setError('No anime available');
        }
        setLoading(false);
    };

    return (
        <div className="h-[80%] items-center justify-center self-center mx-auto w-[80%] text-white flex flex-col">
            <div className="flex justify-center self-start border border-gray-600 mb-4 rounded-lg overflow-hidden">
                <div className="flex">
                    <input
                        type="text"
                        placeholder="Enter anime name..."
                        className="bg-gray-800 p-2 rounded-l w-64 focus:outline-none"
                        value={animeName}
                        onChange={(e) => setAnimeName(e.target.value)}
                    />
                    <button
                        onClick={fetchEpisodes}
                        className="bg-[#1a1a1a] p-2 rounded-r flex items-center gap-1 rounded-lg cursor-pointer"
                    >
                        <FiSearch /> Search
                    </button>
                </div>
            </div>

            {/* Main content area */}
            <div className="flex self-start gap-10">
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
                        <div className="text-center">
                            <ReactPlayer
                                url={episodes[selectedEp]}
                                controls
                                width="50vw"
                                height="55vh"
                                className="react-player rounded-lg border-2 border-gray-700"
                            />
                            {loading ? 'Loading...' : 'Search for an anime to stream'}
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
    );
};

export default Stream;
