import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';

const Watchlist = ({ userId }) => {
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    fetchWatchlist();
  }, [userId]);

  const fetchWatchlist = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/watchlist/${userId}`);
      setWatchlist(response.data);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      await axios.patch(`http://localhost:8000/api/watchlist/${itemId}`, {
        status: newStatus,
      });
      fetchWatchlist(); // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await axios.delete(`http://localhost:8000/api/watchlist/${itemId}`);
      fetchWatchlist(); // Refresh the list
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-4 p-4">
      <h2 className="text-2xl font-bold mb-4 text-white">My Watchlist</h2>
      <div className="bg-gray-800 rounded-lg shadow-lg">
        <ul className="divide-y divide-gray-700">
          {watchlist.map((item) => (
            <li key={item._id} className="p-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg text-white">{item.animeId?.name || 'Untitled Anime'}</h3>
                <p className="text-gray-400">{`Episodes: ${item.animeId?.episodes || 'N/A'}`}</p>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={item.status}
                  onChange={(e) => handleStatusChange(item._id, e.target.value)}
                  className="bg-gray-700 text-white rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Plan to Watch">Plan to Watch</option>
                  <option value="Watching">Watching</option>
                  <option value="Completed">Completed</option>
                  <option value="Dropped">Dropped</option>
                </select>
                <button
                  onClick={() => handleRemove(item._id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="delete"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </li>
          ))}
          {watchlist.length === 0 && (
            <li className="p-4 text-gray-400 text-center">
              No items in watchlist
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Watchlist;
