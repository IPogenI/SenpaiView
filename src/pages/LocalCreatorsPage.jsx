import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import YoutubeChannels from '../components/YoutubeChannels';

const LocalCreatorsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  return (
    <div className="pt-20 px-4 bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Local Creators</h1>
        <YoutubeChannels />
      </div>
    </div>
  );
};

export default LocalCreatorsPage;
