const express = require('express');
const router = express.Router();
const User = require('../models/User'); // MongoDB model for users

// Send a friend request
router.post('/request', async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        const receiver = await User.findById(receiverId);
        if (!receiver.friendRequests.includes(senderId)) {
            receiver.friendRequests.push(senderId);
            await receiver.save();
            res.status(200).json({ message: 'Friend request sent' });
        } else {
            res.status(400).json({ error: 'Friend request already sent' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to send friend request' });
    }
});

// Accept a friend request
router.post('/accept', async (req, res) => {
    try {
        const { userId, friendId } = req.body;
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (user.friendRequests.includes(friendId)) {
            user.friends.push(friendId);
            friend.friends.push(userId);

            user.friendRequests = user.friendRequests.filter(id => id !== friendId);
            await user.save();
            await friend.save();

            res.status(200).json({ message: 'Friend request accepted' });
        } else {
            res.status(400).json({ error: 'No friend request found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to accept friend request' });
    }
});

module.exports = router;