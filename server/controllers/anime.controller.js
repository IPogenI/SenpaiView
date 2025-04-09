import AnimeListModel from '../models/AnimeList.js';

// GET all anime entries
export const getAllAnime = async (req, res) => {
  try {
    console.log('🔍 Attempting to fetch anime list...');
    console.log('📑 Collection name:', AnimeListModel.collection.name);
    console.log('📒 Collection namespace:', AnimeListModel.collection.namespace);
    const animeList = await AnimeListModel.find();
    console.log('📊 Found anime list:', animeList);
    console.log('📈 Number of documents found:', animeList.length);
    res.status(200).json(animeList);
  } catch (err) {
    console.error('❌ Error fetching anime list:', err);
    res.status(500).json({ error: 'Failed to fetch anime list' });
  }
};

// GET single anime by ID
export const getAnimeById = async (req, res) => {
  try {
    const anime = await AnimeListModel.findById(req.params.id);
    if (!anime) return res.status(404).json({ error: 'Anime not found' });
    res.status(200).json(anime);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch anime' });
  }
};

// POST new anime entry
export const createAnime = async (req, res) => {
  try {
    const newAnime = new AnimeListModel(req.body);
    const savedAnime = await newAnime.save();
    res.status(201).json(savedAnime);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT update anime by ID
export const updateAnime = async (req, res) => {
  try {
    const updatedAnime = await AnimeListModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedAnime) return res.status(404).json({ error: 'Anime not found' });
    res.status(200).json(updatedAnime);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE anime by ID
export const deleteAnime = async (req, res) => {
  try {
    const deletedAnime = await AnimeListModel.findByIdAndDelete(req.params.id);
    if (!deletedAnime) return res.status(404).json({ error: 'Anime not found' });
    res.status(200).json({ message: 'Anime deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete anime' });
  }
};
