import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createPost,
    getPosts,
    toggleLike,
    addComment,
    deletePost
} from '../controllers/postController.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Post routes
router.post('/', protect, upload.array('media', 5), createPost);
router.get('/', protect, getPosts);
router.put('/:postId/like', protect, toggleLike);
router.post('/:postId/comment', protect, addComment);
router.delete('/:postId', protect, deletePost);

export default router; 