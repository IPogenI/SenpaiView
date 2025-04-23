import Friendship from '../models/Friendship.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// Send friend request
export const sendFriendRequest = async (req, res) => {
    try {
        const { recipientId } = req.body;
        const requesterId = req.user._id;

        console.log('Checking friendship between:', requesterId, 'and', recipientId);

        // Check if users exist
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if friendship already exists and is pending or accepted
        const existingFriendship = await Friendship.findOne({
            $or: [
                { requester: requesterId, recipient: recipientId },
                { requester: recipientId, recipient: requesterId }
            ]
        });

        console.log('Existing friendship:', existingFriendship);

        if (existingFriendship) {
            if (existingFriendship.status === 'pending') {
                return res.status(400).json({ 
                    message: 'Friend request already sent!',
                    details: {
                        status: existingFriendship.status,
                        requester: existingFriendship.requester,
                        recipient: existingFriendship.recipient
                    }
                });
            } else if (existingFriendship.status === 'accepted') {
                return res.status(400).json({ 
                    message: 'You are already friends!',
                    details: {
                        status: existingFriendship.status,
                        requester: existingFriendship.requester,
                        recipient: existingFriendship.recipient
                    }
                });
            }
        }

        // Create new friendship request
        const friendship = new Friendship({
            requester: requesterId,
            recipient: recipientId,
            status: 'pending'
        });

        await friendship.save();

        // Create notification for recipient
        const notification = new Notification({
            userId: recipientId,
            type: 'FRIEND_REQUEST',
            title: 'New Friend Request',
            message: `${req.user.name} sent you a friend request`
        });

        await notification.save();

        res.status(201).json(friendship);
    } catch (error) {
        console.error('Error in sendFriendRequest:', error);
        res.status(500).json({ message: error.message });
    }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
    try {
        const { friendshipId } = req.params;
        const userId = req.user._id;

        const friendship = await Friendship.findOne({
            _id: friendshipId,
            recipient: userId,
            status: 'pending'
        });

        if (!friendship) {
            return res.status(404).json({ message: 'Friend request not found' });
        }

        friendship.status = 'accepted';
        await friendship.save();

        // Create notification for requester
        const notification = new Notification({
            user: friendship.requester,
            type: 'friend_request_accepted',
            message: `${req.user.name} accepted your friend request`,
            data: {
                friendshipId: friendship._id
            }
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
        const { friendshipId } = req.params;
        const userId = req.user._id;

        const friendship = await Friendship.findOneAndDelete({
            _id: friendshipId,
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
        .populate('requester recipient', 'name email')
        .lean();

        const friends = friendships.map(friendship => {
            const friend = friendship.requester._id.equals(userId) 
                ? friendship.recipient 
                : friendship.requester;
            return {
                ...friend,
                friendshipId: friendship._id
            };
        });

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
        .populate('requester', 'name email')
        .lean();

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cancel pending friend request
export const cancelFriendRequest = async (req, res) => {
    try {
        const { recipientId } = req.body;
        const requesterId = req.user._id;

        const friendship = await Friendship.findOneAndDelete({
            requester: requesterId,
            recipient: recipientId,
            status: 'pending'
        });

        if (!friendship) {
            return res.status(404).json({ message: 'No pending friend request found' });
        }

        res.json({ message: 'Friend request cancelled' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 