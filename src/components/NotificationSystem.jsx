import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, CheckCircle, Trash } from 'lucide-react';
import './NotificationSystem.css';

const NotificationSystem = ({ userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8000/api/notifications/user/${userId}`);
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.notifications.filter(n => !n.isRead).length);
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
        fetchNotifications();
        
        // Poll for new notifications every 30 seconds
        const pollInterval = setInterval(fetchNotifications, 30000);
        
        return () => clearInterval(pollInterval);
    }, [userId]);

    // Mark a notification as read
    const markAsRead = async (notificationId) => {
        try {
            await axios.patch(`http://localhost:8000/api/notifications/${notificationId}/read`);
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
            await axios.patch(`http://localhost:8000/api/notifications/user/${userId}/read-all`);
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
            await axios.delete(`http://localhost:8000/api/notifications/${notificationId}`);
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
                        {notifications.length > 0 && (
                            <button onClick={markAllAsRead} className="mark-all-read">
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {loading && <div className="loading">Loading notifications...</div>}
                    {error && <div className="error">{error}</div>}

                    <div className="notification-list">
                        {notifications.length === 0 ? (
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
