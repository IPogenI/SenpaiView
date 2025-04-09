import Notification from '../models/Notification.js';

// Create a new notification
export const createNotification = async (req, res) => {
    try {
        const notification = new Notification(req.body);
        await notification.save();
        res.status(201).json(notification);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all notifications for a user
export const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, unreadOnly = false } = req.query;

        const query = { userId };
        if (unreadOnly === 'true') {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Notification.countDocuments(query);

        res.json({
            notifications,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalNotifications: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.notificationId,
            { isRead: true },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark all notifications as read for a user
export const markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.params;
        await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.notificationId);
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new episode notification for all users watching an anime
export const notifyNewEpisode = async (req, res) => {
    try {
        const { animeId, episodeNumber, animeTitle, userIds } = req.body;
        
        const notifications = await Promise.all(
            userIds.map(userId => {
                const notification = new Notification({
                    userId,
                    type: 'NEW_EPISODE',
                    title: `New Episode Available`,
                    message: `Episode ${episodeNumber} of ${animeTitle} is now available!`,
                    relatedAnimeId: animeId
                });
                return notification.save();
            })
        );
        
        res.status(201).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a community update notification
export const createCommunityUpdate = async (req, res) => {
    try {
        const { title, message, userIds } = req.body;
        
        const notifications = await Promise.all(
            userIds.map(userId => {
                const notification = new Notification({
                    userId,
                    type: 'COMMUNITY_UPDATE',
                    title,
                    message
                });
                return notification.save();
            })
        );
        
        res.status(201).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create personalized recommendations
export const createRecommendation = async (req, res) => {
    try {
        const { userId, animeId, animeTitle } = req.body;
        
        const notification = new Notification({
            userId,
            type: 'RECOMMENDATION',
            title: 'New Anime Recommendation',
            message: `Based on your watching history, we think you'll love ${animeTitle}!`,
            relatedAnimeId: animeId
        });
        
        await notification.save();
        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
