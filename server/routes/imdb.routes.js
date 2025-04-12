import express from 'express';
import { getAnimeDetails } from '../controllers/imdb.controller.js';

const router = express.Router();

router.get('/:title', getAnimeDetails);

export default router;
