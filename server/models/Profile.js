import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        unique: true
    },
    profilePicture: {
        type: String,
        default: '/default-avatar.png'
    },
    bio: {
        type: String,
        maxlength: 500,
        default: ''
    },
    socialLinks: {
        twitter: String,
        instagram: String,
        discord: String
    },
    preferences: {
        profileVisibility: {
            type: String,
            enum: ['public', 'friends', 'private'],
            default: 'public'
        },
        watchlistVisibility: {
            type: String,
            enum: ['public', 'friends', 'private'],
            default: 'public'
        }
    },
    stats: {
        postsCount: {
            type: Number,
            default: 0
        },
        friendsCount: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

export default mongoose.model('Profile', profileSchema); 