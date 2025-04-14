import mongoose from "mongoose";

// Define embedded schemas
const watchlistItemSchema = new mongoose.Schema({
    animeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AnimeList',
        required: true
    },
    status: {
        type: String,
        enum: ['Plan to Watch', 'Watching', 'Completed', 'Dropped'],
        default: 'Plan to Watch'
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

const watchHistorySchema = new mongoose.Schema({
    animeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AnimeList',
        required: true
    },
    watchedAt: {
        type: Date,
        default: Date.now
    }
});

const notificationSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'error'],
        default: 'info'
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ratingSchema = new mongoose.Schema({
    animeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AnimeList',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    watchlist: [watchlistItemSchema],
    watchHistory: [watchHistorySchema],
    notifications: [notificationSchema],
    ratings: [ratingSchema],
    preferences: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'dark'
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

const userModel = mongoose.model('users', userSchema);

export default userModel

//Hello