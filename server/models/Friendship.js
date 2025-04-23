import mongoose from "mongoose";

const friendshipSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Ensure unique friendship pairs
friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

// Add virtual for friend request notification
friendshipSchema.virtual('notification').get(function() {
    if (this.status === 'pending') {
        return {
            type: 'friend_request',
            message: `Friend request from ${this.requester.name}`,
            data: {
                friendshipId: this._id,
                requesterId: this.requester
            }
        };
    }
    return null;
});

const Friendship = mongoose.model('Friendship', friendshipSchema);

export default Friendship; 