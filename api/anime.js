import dbConnect from '../server/db/db.js';
import AnimeListModel from '../server/models/AnimeList.js';
import { fetchEpisodeLinks } from '../server/scraper.js';
import api from '../api/axios';

export default async function handler(req, res) {
  await dbConnect();
  const { method, query, body } = req;

  // GET /api/anime/episodes?title=...
  if (method === 'GET' && query.title) {
    try {
      const episodes = await fetchEpisodeLinks(query.title);
      return res.status(200).json({ episodes });
    } catch (err) {
      return res.status(404).json({ message: err.message });
    }
  }

  // GET /api/anime or /api/anime?id=...
  if (method === 'GET') {
    if (query.id) {
      // Get by ID
      try {
        const anime = await AnimeListModel.findById(query.id);
        if (!anime) return res.status(404).json({ error: 'Anime not found' });
        return res.status(200).json(anime);
      } catch (err) {
        return res.status(500).json({ error: 'Failed to fetch anime' });
      }
    } else {
      // Get all
      try {
        const animeList = await AnimeListModel.find();
        return res.status(200).json(animeList);
      } catch (err) {
        return res.status(500).json({ error: 'Failed to fetch anime list' });
      }
    }
  }

  // POST /api/anime
  if (method === 'POST') {
    try {
      if (Array.isArray(body)) {
        const savedAnimes = await AnimeListModel.insertMany(body);
        return res.status(201).json(savedAnimes);
      } else {
        const newAnime = new AnimeListModel(body);
        const savedAnime = await newAnime.save();
        return res.status(201).json(savedAnime);
      }
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  // PUT /api/anime?id=...
  if (method === 'PUT' && query.id) {
    try {
      const updatedAnime = await AnimeListModel.findByIdAndUpdate(query.id, body, { new: true });
      if (!updatedAnime) return res.status(404).json({ error: 'Anime not found' });
      return res.status(200).json(updatedAnime);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  // DELETE /api/anime?id=...
  if (method === 'DELETE' && query.id) {
    try {
      const deletedAnime = await AnimeListModel.findByIdAndDelete(query.id);
      if (!deletedAnime) return res.status(404).json({ error: 'Anime not found' });
      return res.status(200).json({ message: 'Anime deleted' });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete anime' });
    }
  }

  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${method} Not Allowed`);
} 