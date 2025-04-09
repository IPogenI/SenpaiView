import express from 'express';
import {
  getAllAnime,
  getAnimeById,
  createAnime,
  updateAnime,
  deleteAnime,
} from '../controllers/anime.controller.js';

const router = express.Router();

router.get('/animeList', getAllAnime);
router.get('/:id', getAnimeById);
router.post('/', createAnime);
router.put('/:id', updateAnime);
router.delete('/:id', deleteAnime);

export default router;
