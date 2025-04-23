import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriends,
    getPendingRequests
} from '../controllers/friendshipController.js';
import { upload } from '../middleware/uploadMiddleware.js';
import profileRoutes from './routes/profileRoutes.js';
import friendshipRoutes from './routes/friendshipRoutes.js';
import postRoutes from './routes/postRoutes.js';
import Profile from '../models/Profile.js';
import User from '../models/User.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import Friendship from '../models/Friendship.js';
import Notification from '../models/Notification.js';
import Post from '../models/Post.js';

const router = express.Router();

router.post('/request', protect, sendFriendRequest);
router.put('/request/:requestId/accept', protect, acceptFriendRequest);
router.put('/request/:requestId/reject', protect, rejectFriendRequest);
router.get('/list', protect, getFriends);
router.get('/pending', protect, getPendingRequests);
router.post('/', protect, upload.array('media', 5), createPost);
router.get('/', protect, getPosts);
router.put('/:postId/like', protect, toggleLike);
router.post('/:postId/comment', protect, addComment);
router.delete('/:postId', protect, deletePost);

// Add these after other route imports
app.use('/api/profile', profileRoutes);
app.use('/api/friends', friendshipRoutes);
app.use('/api/posts', postRoutes);

// Get current user's profile
export const getProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user._id })
            .populate('userId', 'name email profilePicture');
            
        if (!profile) {
            // Create a default profile if none exists
            const newProfile = new Profile({
                userId: req.user._id
            });
            await newProfile.save();
            return res.json(newProfile);
        }
        
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get profile by ID
export const getProfileById = async (req, res) => {
    try {
        const { userId } = req.params;
        const profile = await Profile.findOne({ userId })
            .populate('userId', 'name email profilePicture');
            
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update profile
export const updateProfile = async (req, res) => {
    try {
        const { bio, socialLinks, preferences } = req.body;
        const userId = req.user._id;

        let profile = await Profile.findOne({ userId });

        if (!profile) {
            profile = new Profile({ userId });
        }

        if (bio) profile.bio = bio;
        if (socialLinks) profile.socialLinks = socialLinks;
        if (preferences) profile.preferences = preferences;

        await profile.save();

        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Upload profile picture
export const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const result = await uploadToCloudinary(req.file.path, {
            folder: 'profile-pictures',
            transformation: [
                { width: 500, height: 500, crop: 'fill' },
                { quality: 'auto' }
            ]
        });

        const profile = await Profile.findOneAndUpdate(
            { userId: req.user._id },
            { profilePicture: result.secure_url },
            { new: true }
        );

        // Update user's profile picture as well
        await User.findByIdAndUpdate(
            req.user._id,
            { profilePicture: result.secure_url }
        );

        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get friend suggestions
export const getFriendSuggestions = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Get existing friends
        const existingFriends = await Friendship.find({
            $or: [
                { requester: userId, status: 'accepted' },
                { recipient: userId, status: 'accepted' }
            ]
        }).select('requester recipient');

        const friendIds = existingFriends.map(f => 
            f.requester.equals(userId) ? f.recipient : f.requester
        );

        // Get random users excluding current user and friends
        const suggestions = await User.aggregate([
            { $match: { _id: { $nin: [userId, ...friendIds] } } },
            { $sample: { size: 4 } },
            { $project: { name: 1, email: 1, profilePicture: 1 } }
        ]);

        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Send friend request
export const sendFriendRequest = async (req, res) => {
    try {
        const { recipientId } = req.body;
        const requesterId = req.user._id;

        // Check if friendship already exists
        const existingFriendship = await Friendship.findOne({
            $or: [
                { requester: requesterId, recipient: recipientId },
                { requester: recipientId, recipient: requesterId }
            ]
        });

        if (existingFriendship) {
            return res.status(400).json({ message: 'Friendship already exists' });
        }

        const friendship = new Friendship({
            requester: requesterId,
            recipient: recipientId
        });

        await friendship.save();

        // Create notification for recipient
        const requester = await User.findById(requesterId);
        const notification = new Notification({
            userId: recipientId,
            message: `${requester.name} sent you a friend request`,
            type: 'friend_request',
            data: { friendshipId: friendship._id }
        });

        await notification.save();

        res.status(201).json(friendship);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;

        const friendship = await Friendship.findOne({
            _id: requestId,
            recipient: userId,
            status: 'pending'
        });

        if (!friendship) {
            return res.status(404).json({ message: 'Friend request not found' });
        }

        friendship.status = 'accepted';
        await friendship.save();

        // Create notification for requester
        const recipient = await User.findById(userId);
        const notification = new Notification({
            userId: friendship.requester,
            message: `${recipient.name} accepted your friend request`,
            type: 'friend_request_accepted'
        });

        await notification.save();

        res.json(friendship);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reject friend request
export const rejectFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;

        const friendship = await Friendship.findOneAndDelete({
            _id: requestId,
            recipient: userId,
            status: 'pending'
        });

        if (!friendship) {
            return res.status(404).json({ message: 'Friend request not found' });
        }

        res.json({ message: 'Friend request rejected' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get friends list
export const getFriends = async (req, res) => {
    try {
        const userId = req.user._id;

        const friendships = await Friendship.find({
            $or: [
                { requester: userId, status: 'accepted' },
                { recipient: userId, status: 'accepted' }
            ]
        })
        .populate('requester', 'name email profilePicture')
        .populate('recipient', 'name email profilePicture');

        const friends = friendships.map(friendship => 
            friendship.requester._id.equals(userId) ? friendship.recipient : friendship.requester
        );

        res.json(friends);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get pending friend requests
export const getPendingRequests = async (req, res) => {
    try {
        const userId = req.user._id;

        const requests = await Friendship.find({
            recipient: userId,
            status: 'pending'
        })
        .populate('requester', 'name email profilePicture');

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create post
export const createPost = async (req, res) => {
    try {
        const { content, tags, visibility } = req.body;
        const author = req.user._id;

        const post = new Post({
            author,
            content,
            tags: tags || [],
            visibility: visibility || 'public'
        });

        // Handle media uploads if any
        if (req.files && req.files.length > 0) {
            const mediaUploads = await Promise.all(
                req.files.map(async (file) => {
                    const result = await uploadToCloudinary(file.path, {
                        folder: 'posts',
                        resource_type: 'auto'
                    });
                    return {
                        type: result.resource_type,
                        url: result.secure_url
                    };
                })
            );
            post.media = mediaUploads;
        }

        await post.save();

        // Update user's post count
        await User.findByIdAndUpdate(author, {
            $inc: { 'profile.stats.postsCount': 1 }
        });

        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get posts
export const getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user._id;

        const posts = await Post.find({
            $or: [
                { visibility: 'public' },
                { author: userId, visibility: 'private' },
                {
                    $and: [
                        { visibility: 'friends' },
                        {
                            $or: [
                                { author: userId },
                                { 'friends': userId }
                            ]
                        }
                    ]
                }
            ]
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'name profilePicture')
        .populate({
            path: 'comments.user',
            select: 'name profilePicture'
        })
        .lean();

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Like/unlike post
export const toggleLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const likeIndex = post.likes.indexOf(userId);
        if (likeIndex === -1) {
            post.likes.push(userId);
        } else {
            post.likes.splice(likeIndex, 1);
        }

        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add comment
export const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = {
            user: userId,
            content
        };

        post.comments.push(comment);
        await post.save();

        const populatedPost = await Post.findById(postId)
            .populate('comments.user', 'name profilePicture')
            .lean();

        res.json(populatedPost.comments[populatedPost.comments.length - 1]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete post
export const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findOneAndDelete({
            _id: postId,
            author: userId
        });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Update user's post count
        await User.findByIdAndUpdate(userId, {
            $inc: { 'profile.stats.postsCount': -1 }
        });

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default router;