import express from 'express';
import { fetchEpisodeLinks } from '../scraper.js';
import {
  getAllAnime,
  getAnimeById,
  createAnime,
  updateAnime,
  deleteAnime,
} from '../controllers/anime.controller.js';

const router = express.Router();

// Get episodes
router.get('/episodes', async (req, res) => {
  const animeTitle = req.query.title;
  if (!animeTitle) {
    return res.status(400).json({ message: "Anime title is required" });
  }

  try {
    const episodes = await fetchEpisodeLinks(animeTitle);
    res.json({ episodes });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});


router.get('/', getAllAnime);
router.get('/:id', getAnimeById);
router.post('/', createAnime);
router.put('/:id', updateAnime);
router.delete('/:id', deleteAnime);

export default router;
