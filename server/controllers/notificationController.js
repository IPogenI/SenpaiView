import mongoose from 'mongoose';
import User from '../models/User.js';

// Get user's notifications
export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Sort notifications by date, newest first
    const notifications = user.notifications.sort((a, b) => b.createdAt - a.createdAt);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { userId, notificationId } = req.params;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const notification = user.notifications.id(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await user.save();

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a notification
export const addNotification = async (req, res) => {
  try {
    const { userId } = req.params;
    const { message, type = 'info' } = req.body;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.notifications.push({
      message,
      type,
      read: false,
      createdAt: new Date()
    });

    await user.save();

    res.status(201).json(user.notifications[user.notifications.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { userId, notificationId } = req.params;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const notificationIndex = user.notifications.findIndex(
      n => n._id.toString() === notificationId
    );

    if (notificationIndex === -1) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    user.notifications.splice(notificationIndex, 1);
    await user.save();

    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
