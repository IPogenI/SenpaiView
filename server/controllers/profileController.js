import Profile from '../models/Profile.js';
import userModel from '../models/User.js';
import Friendship from '../models/Friendship.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// Get user profile
export const getProfile = async (req, res) => {
    try {
        console.log('Profile request received:', {
            user: req.user,
            headers: req.headers
        });

        // Get user from token
        const user = await userModel.findById(req.user._id);
        console.log('Found user:', user);
        
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        // Find or create profile
        let profile = await Profile.findOne({ userId: user._id })
            .populate('userId', 'name email profilePicture');
            
        console.log('Found profile:', profile);
            
        if (!profile) {
            console.log('Creating new profile');
            // Create a default profile
            profile = new Profile({
                userId: user._id,
                bio: '',
                socialLinks: {
                    twitter: '',
                    instagram: '',
                    discord: ''
                },
                preferences: {
                    profileVisibility: 'public',
                    watchlistVisibility: 'public'
                },
                stats: {
                    postsCount: 0,
                    friendsCount: 0
                }
            });
            await profile.save();
            console.log('New profile created:', profile);
        }
        
        res.json(profile);
    } catch (error) {
        console.error('Profile error:', error);
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
        const suggestions = await userModel.aggregate([
            { $match: { _id: { $nin: [userId, ...friendIds] } } },
            { $sample: { size: 4 } },
            { $project: { name: 1, email: 1, profilePicture: 1 } }
        ]);

        res.json(suggestions);
    } catch (error) {
        console.error('Friend suggestions error:', error);
        res.status(500).json({ message: error.message });
    }
}; 