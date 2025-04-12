import mongoose from 'mongoose';
import User from '../models/User.js';

// Add anime to watchlist
export const addToWatchlist = async (req, res) => {
  try {
    const { userId, animeId } = req.params;
    const { status } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(animeId)) {
      return res.status(400).json({ message: 'Invalid user ID or anime ID' });
    }
    console.log('Adding to watchlist:', { userId, animeId, status });
    
    // Check if the anime exists
    const anime = await mongoose.model('AnimeList').findById(animeId);
    if (!anime) {
      return res.status(404).json({ message: 'Anime not found' });
    }

    // Find user and check if anime is already in watchlist
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingItem = user.watchlist.find(item => 
      item.animeId.toString() === animeId.toString()
    );

    if (existingItem) {
      return res.status(400).json({ message: 'Anime already in watchlist' });
    }

    // Add to user's watchlist
    user.watchlist.push({
      animeId,
      status: status || 'Plan to Watch'
    });

    await user.save();
    
    // Get the newly added watchlist item
    const newItem = user.watchlist[user.watchlist.length - 1];
    
    // Populate and return the new item
    await user.populate('watchlist.animeId');
    
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error in addToWatchlist:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get user's watchlist
export const getWatchlist = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Getting watchlist for user:', userId);

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const user = await User.findOne({ _id: userId })
      .populate({
        path: 'watchlist.animeId',
        select: 'name episodes genres status premiered rating popularity'
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Filter out items where animeId is null and sort by addedAt
    const validWatchlist = user.watchlist
      .filter(item => item.animeId)
      .sort((a, b) => b.addedAt - a.addedAt);
    
    console.log('Found watchlist items:', validWatchlist);
    res.status(200).json(validWatchlist);
  } catch (error) {
    console.error('Error in getWatchlist:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update watchlist item status
export const updateWatchlistStatus = async (req, res) => {
  try {
    const { userId, animeId } = req.params;
    const { status } = req.body;
    
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the watchlist item
    const watchlistItem = user.watchlist.find(item => 
      item.animeId.toString() === animeId.toString()
    );

    if (!watchlistItem) {
      return res.status(404).json({ message: 'Watchlist item not found' });
    }

    // Update the status
    watchlistItem.status = status;
    await user.save();

    // Populate and return the updated item
    await user.populate('watchlist.animeId');
    
    res.status(200).json(watchlistItem);
  } catch (error) {
    console.error('Error updating watchlist status:', error);
    res.status(500).json({ message: error.message });
  }
};

// Remove from watchlist
export const removeFromWatchlist = async (req, res) => {
  try {
    const { userId, animeId } = req.params;
    
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the watchlist item index
    const itemIndex = user.watchlist.findIndex(item => 
      item.animeId.toString() === animeId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Watchlist item not found' });
    }

    // Remove the item
    user.watchlist.splice(itemIndex, 1);
    await user.save();
    
    res.status(200).json({ message: 'Removed from watchlist' });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({ message: error.message });
  }
};

// Check if anime is in user's watchlist
export const checkWatchlistStatus = async (req, res) => {
  try {
    const { userId, animeId } = req.params;
    console.log('Checking watchlist status:', { userId, animeId });

    // Validate animeId
    if (!mongoose.Types.ObjectId.isValid(animeId)) {
      return res.status(400).json({ message: 'Invalid anime ID' });
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const watchlistItem = user.watchlist.find(item => 
      item.animeId.toString() === animeId.toString()
    );

    console.log('Found watchlist item:', watchlistItem);
    res.status(200).json({ inWatchlist: !!watchlistItem });
  } catch (error) {
    console.error('Error checking watchlist status:', error);
    res.status(500).json({ message: error.message });
  }
};
