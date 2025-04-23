import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriends,
    getPendingRequests,
    cancelFriendRequest
} from '../controllers/friendshipController.js';

const router = express.Router();

// Friend request routes
router.post('/request', protect, sendFriendRequest);
router.delete('/request', protect, cancelFriendRequest);
router.put('/request/:friendshipId/accept', protect, acceptFriendRequest);
router.delete('/request/:friendshipId/reject', protect, rejectFriendRequest);

// Friends list routes
router.get('/', protect, getFriends);
router.get('/pending', protect, getPendingRequests);

export default router; 