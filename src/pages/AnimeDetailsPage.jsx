import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Plus } from 'lucide-react';

const AnimeDetailsPage = () => {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [addedToWatchlist, setAddedToWatchlist] = useState(false);
  
  // Hardcoded userId for demo - replace with actual user authentication
  const userId = "1";

  useEffect(() => {
    fetchAnimeDetails();
  }, [id]);

  const fetchAnimeDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/anime/${id}`);
      setAnime(response.data);
    } catch (error) {
      console.error('Error fetching anime details:', error);
    }
  };

  const addToWatchlist = async () => {
    try {
      await axios.post('http://localhost:8000/api/watchlist', {
        userId: userId,
        animeId: id,
        status: 'plan_to_watch'
      });
      setAddedToWatchlist(true);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  if (!anime) {
    return (
      <div className="pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{anime.title}</h1>
              <p className="text-gray-400">Episodes: {anime.episodes || 'N/A'}</p>
            </div>
            <button
              onClick={addToWatchlist}
              disabled={addedToWatchlist}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                addedToWatchlist
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Plus size={20} />
              {addedToWatchlist ? 'Added to Watchlist' : 'Add to Watchlist'}
            </button>
          </div>
          
          {/* Add more anime details here */}
          <div className="mt-4 text-gray-300">
            <p>{anime.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetailsPage;
