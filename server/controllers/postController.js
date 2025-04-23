import Post from '../models/Post.js';
import User from '../models/User.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

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