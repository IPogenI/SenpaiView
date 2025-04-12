import express from 'express';
import {
  getUserNotifications,
  markAsRead,
  addNotification,
  deleteNotification
} from '../controllers/notificationController.js';

const router = express.Router();

// Get user's notifications
router.get('/user/:userId', getUserNotifications);

// Mark notification as read
router.patch('/user/:userId/notification/:notificationId/read', markAsRead);

// Add a notification
router.post('/user/:userId', addNotification);

// Delete a notification
router.delete('/user/:userId/notification/:notificationId', deleteNotification);

export default router;
