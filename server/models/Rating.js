import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
    animeId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        required: false,
        maxLength: 1000
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure a user can only rate an anime once
ratingSchema.index({ animeId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Rating', ratingSchema);
