import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const AddYoutubeChannel = ({ isOpen, onClose, onAddChannel }) => {
  const [newChannel, setNewChannel] = useState({
    name: '',
    channelHandle: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddChannel(newChannel);
    setNewChannel({ name: '', channelHandle: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes size={20} />
            </button>

            <h3 className="text-lg font-medium mb-4 text-white">Add New Channel</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200">Channel Name</label>
                <input
                  type="text"
                  value={newChannel.name}
                  onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200">Channel Handle</label>
                <input
                  type="text"
                  value={newChannel.channelHandle}
                  onChange={(e) => setNewChannel({ ...newChannel, channelHandle: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                  required
                  placeholder="e.g., @channelname"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddYoutubeChannel; 