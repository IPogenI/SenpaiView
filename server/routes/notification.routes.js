import express from 'express';
import * as notificationController from '../controllers/notification.controller.js';

const router = express.Router();

// Get user's notifications
router.get('/user/:userId', notificationController.getUserNotifications);

// Create a new notification
router.post('/', notificationController.createNotification);

// Mark a notification as read
router.patch('/:notificationId/read', notificationController.markAsRead);

// Mark all notifications as read for a user
router.patch('/user/:userId/read-all', notificationController.markAllAsRead);

// Delete a notification
router.delete('/:notificationId', notificationController.deleteNotification);

// Create new episode notifications
router.post('/new-episode', notificationController.notifyNewEpisode);

// Create community update notifications
router.post('/community-update', notificationController.createCommunityUpdate);

// Create recommendation notification
router.post('/recommendation', notificationController.createRecommendation);

export default router;
