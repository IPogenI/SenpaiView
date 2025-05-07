import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Bell, CheckCircle, Trash } from 'lucide-react';
import './NotificationSystem.css';

const NotificationSystem = ({ userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            if (!userId) {
                setNotifications([]);
                setUnreadCount(0);
                return;
            }
            const response = await api.get(`/notifications/user/${userId}`);
            const notificationsData = response.data || [];
            setNotifications(notificationsData);
            setUnreadCount(notificationsData.filter(n => !n.isRead).length);
            setError(null);
        } catch (err) {
            setError('Failed to fetch notifications');
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and setup polling
    useEffect(() => {
        if (userId) {
            fetchNotifications();
            
            // Poll for new notifications every 30 seconds
            const pollInterval = setInterval(fetchNotifications, 30000);
            
            return () => clearInterval(pollInterval);
        } else {
            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
        }
    }, [userId]);

    // Mark a notification as read
    const markAsRead = async (notificationId) => {
        try {
            await api.patch(`/notifications/${notificationId}/read`);
            setNotifications(notifications.map(notification =>
                notification._id === notificationId
                    ? { ...notification, isRead: true }
                    : notification
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        try {
            await api.patch(`/notifications/user/${userId}/read-all`);
            setNotifications(notifications.map(notification => ({
                ...notification,
                isRead: true
            })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
        }
    };

    // Delete a notification
    const deleteNotification = async (notificationId) => {
        try {
            await api.delete(`/notifications/${notificationId}`);
            setNotifications(notifications.filter(n => n._id !== notificationId));
            setUnreadCount(prev => 
                notifications.find(n => n._id === notificationId && !n.isRead)
                    ? Math.max(0, prev - 1)
                    : prev
            );
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'NEW_EPISODE':
                return '🎬';
            case 'COMMUNITY_UPDATE':
                return '📢';
            case 'RECOMMENDATION':
                return '⭐';
            default:
                return '📌';
        }
    };

    if (!userId) {
        return null;
    }

    return (
        <div className="notification-system">
            <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={24} className="text-white hover:text-gray-300 transition-colors" />
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </div>

            {showNotifications && (
                <div className="notification-panel">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        {notifications && notifications.length > 0 && (
                            <button onClick={markAllAsRead} className="mark-all-read">
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {loading && <div className="loading">Loading notifications...</div>}
                    {error && <div className="error">{error}</div>}

                    <div className="notification-list">
                        {loading ? (
                            <div className="loading">Loading notifications...</div>
                        ) : error ? (
                            <div className="error">{error}</div>
                        ) : !notifications || notifications.length === 0 ? (
                            <div className="no-notifications">No notifications</div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification._id}
                                    className={"notification-item" + (!notification.isRead ? " unread" : "")}
                                >
                                    <div className="notification-icon">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="notification-content">
                                        <h4>{notification.title}</h4>
                                        <p>{notification.message}</p>
                                        <span className="notification-time">
                                            {new Date(notification.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="notification-actions">
                                        {!notification.isRead && (
                                            <button
                                                onClick={() => markAsRead(notification._id)}
                                                className="action-button read"
                                                title="Mark as read"
                                            >
                                                <CheckCircle />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(notification._id)}
                                            className="action-button delete"
                                            title="Delete notification"
                                        >
                                            <Trash />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationSystem;
