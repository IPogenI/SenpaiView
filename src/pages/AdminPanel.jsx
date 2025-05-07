import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import AddYoutubeChannel from '../components/AddYoutubeChannel';

const AdminPanel = () => {
  const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [animeList, setAnimeList] = useState([]);
  const [youtubeChannels, setYoutubeChannels] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [isAddChannelModalOpen, setIsAddChannelModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (activeTab === 'users') {
          const res = await api.get('/users/all', {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          });
          setUsers(res.data);
        } else if (activeTab === 'anime') {
          const res = await api.get('/anime', {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          });
          setAnimeList(res.data);
        } else if (activeTab === 'youtube') {
          const res = await api.get('/youtube', {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          });
          setYoutubeChannels(res.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, user.token]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        setUsers(users.filter(user => user._id !== userId));
        toast.success('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleAddChannel = async (newChannel) => {
    try {
      const res = await api.post('/youtube', newChannel, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      setYoutubeChannels([...youtubeChannels, res.data]);
      toast.success('Channel added successfully');
    } catch (error) {
      console.error('Error adding channel:', error);
      toast.error('Failed to add channel');
    }
  };

  const handleDeleteChannel = async (channelId) => {
    if (window.confirm('Are you sure you want to delete this channel?')) {
      try {
        await api.delete(`/youtube/${channelId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        setYoutubeChannels(youtubeChannels.filter(channel => channel._id !== channelId));
        toast.success('Channel deleted successfully');
      } catch (error) {
        console.error('Error deleting channel:', error);
        toast.error('Failed to delete channel');
      }
    }
  };

  const handleDeleteAnime = async (animeId) => {
    if (window.confirm('Are you sure you want to delete this anime?')) {
      try {
        await api.delete(`/anime/${animeId}`);
        setAnimeList(animeList.filter(anime => anime._id !== animeId));
        toast.success('Anime deleted successfully');
      } catch (error) {
        console.error('Error deleting anime:', error);
        toast.error('Failed to delete anime');
      }
    }
  };

  // Redirect if not admin
  if (!user || !user.isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <div className='bg-gray-900 pt-8'>
      <div className="flex flex-col mx-auto px-4 py-20 h-screen container">
        <div className="flex gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === 'anime' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('anime')}
          >
            Anime
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === 'youtube' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('youtube')}
          >
            YouTube Channels
          </button>
        </div>

        {loading ? (
          <div className="text-center text-white">Loading...</div>
        ) : (
          <>
            {activeTab === 'users' && (
              <div className="bg-gray-800 rounded-lg overflow-y-auto container">
                <table className="w-full divide-y divide-gray-700">
                  <thead className="sticky top-0 bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Admin</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {users.map((user) => (
                      <tr key={user._id} className='hover:bg-gray-600'>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.isAdmin ? 'Yes' : 'No'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'anime' && (
              <div className="bg-gray-800 rounded-lg overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="sticky top-0 bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Genres</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {animeList.map((anime) => (
                      <tr key={anime._id} className='hover:bg-gray-600'>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{anime.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{anime.genres}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{anime.status}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDeleteAnime(anime._id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'youtube' && (
              <div className="space-y-6">
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setIsAddChannelModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add Channel
                  </button>
                </div>

                <div className="bg-gray-800 rounded-lg shadow overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-600">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Channel Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Handle</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-600">
                      {youtubeChannels.map((channel) => (
                        <tr key={channel._id} className="hover:bg-gray-600">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{channel.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{channel.channelHandle}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDeleteChannel(channel._id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <AddYoutubeChannel
        isOpen={isAddChannelModalOpen}
        onClose={() => setIsAddChannelModalOpen(false)}
        onAddChannel={handleAddChannel}
      />
    </div>
  );
};

export default AdminPanel;
