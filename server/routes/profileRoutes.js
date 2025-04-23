import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
    getProfile, 
    updateProfile, 
    uploadProfilePicture,
    getFriendSuggestions,
    getProfileById
} from '../controllers/profileController.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Profile routes
router.get('/', protect, getProfile);
router.get('/:userId', protect, getProfileById);
router.put('/', protect, updateProfile);
router.post('/upload-picture', protect, upload.single('profilePicture'), uploadProfilePicture);

// Friend suggestions
router.get('/suggestions/friends', protect, getFriendSuggestions);

export default router; 