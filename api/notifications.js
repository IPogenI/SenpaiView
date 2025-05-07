import dbConnect from '../server/db/db.js';
import mongoose from 'mongoose';
import User from '../server/models/User.js';

export default async function handler(req, res) {
  await dbConnect();
  const { method, query, body } = req;
  const { userId, notificationId } = query;

  // GET /api/notifications?userId=...
  if (method === 'GET' && userId) {
    try {
      const user = await User.findOne({ _id: userId });
      if (!user) return res.status(404).json({ message: 'User not found' });
      const notifications = user.notifications.sort((a, b) => b.createdAt - a.createdAt);
      return res.status(200).json(notifications);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // PATCH /api/notifications?userId=...&notificationId=...
  if (method === 'PATCH' && userId && notificationId) {
    try {
      const user = await User.findOne({ _id: userId });
      if (!user) return res.status(404).json({ message: 'User not found' });
      const notification = user.notifications.id(notificationId);
      if (!notification) return res.status(404).json({ message: 'Notification not found' });
      notification.read = true;
      await user.save();
      return res.status(200).json(notification);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // POST /api/notifications?userId=...
  if (method === 'POST' && userId) {
    try {
      const { message, type = 'info' } = body;
      const user = await User.findOne({ _id: userId });
      if (!user) return res.status(404).json({ message: 'User not found' });
      user.notifications.push({ message, type, read: false, createdAt: new Date() });
      await user.save();
      return res.status(201).json(user.notifications[user.notifications.length - 1]);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // DELETE /api/notifications?userId=...&notificationId=...
  if (method === 'DELETE' && userId && notificationId) {
    try {
      const user = await User.findOne({ _id: userId });
      if (!user) return res.status(404).json({ message: 'User not found' });
      const notificationIndex = user.notifications.findIndex(n => n._id.toString() === notificationId);
      if (notificationIndex === -1) return res.status(404).json({ message: 'Notification not found' });
      user.notifications.splice(notificationIndex, 1);
      await user.save();
      return res.status(200).json({ message: 'Notification deleted' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
  res.status(405).end(`Method ${method} Not Allowed`);
} 