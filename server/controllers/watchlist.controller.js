import WatchlistModel from '../models/Watchlist.js';

// Add anime to watchlist
export const addToWatchlist = async (req, res) => {
  try {
    const { userId, animeId, status } = req.body;
    
    const watchlistItem = new WatchlistModel({
      userId,
      animeId,
      status: status || 'Plan to Watch'
    });

    const savedItem = await watchlistItem.save();
    
    await savedItem.populate('animeId');
    res.status(201).json(savedItem);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Anime already in watchlist' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Get user's watchlist
export const getWatchlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const watchlist = await WatchlistModel.find({ userId })
      .populate('animeId')
      .sort({ addedAt: -1 });
    
    res.status(200).json(watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update watchlist item status
export const updateWatchlistStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedItem = await WatchlistModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('animeId');
    
    if (!updatedItem) {
      return res.status(404).json({ message: 'Watchlist item not found' });
    }
    
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove from watchlist
export const removeFromWatchlist = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedItem = await WatchlistModel.findByIdAndDelete(id);
    
    if (!deletedItem) {
      return res.status(404).json({ message: 'Watchlist item not found' });
    }
    
    res.status(200).json({ message: 'Removed from watchlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
