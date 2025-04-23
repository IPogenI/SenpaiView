import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: ['NEW_EPISODE', 'COMMUNITY_UPDATE', 'RECOMMENDATION', 'FRIEND_REQUEST']
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedAnimeId: {
        type: String,
        required: false
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries on userId and isRead status
notificationSchema.index({ userId: 1, isRead: 1 });
// Index for sorting by creation date
notificationSchema.index({ createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
