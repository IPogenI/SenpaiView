import React from 'react';
import Watchlist from '../components/Watchlist';

const WatchlistPage = () => {
  // For now, using a hardcoded userId. In a real app, this would come from authentication
  const userId = "1"; // Replace with actual user ID from your auth system

  return (
    <div className="pt-20 px-4">
      <Watchlist userId={userId} />
    </div>
  );
};

export default WatchlistPage;
