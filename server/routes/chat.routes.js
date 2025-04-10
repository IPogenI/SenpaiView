import express from 'express';
import { createChatMessage, getChatHistory } from '../controllers/chat.controller.js';

const router = express.Router();

router.post('/message', createChatMessage);
router.get('/history/:userId', getChatHistory);

export default router;
