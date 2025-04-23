import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Avatar,
    Button,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    Chip,
    Tabs,
    Tab
} from '@mui/material';
import {
    PersonAdd as PersonAddIcon,
    Check as CheckIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const Friends = () => {
    const [tabValue, setTabValue] = useState(0);
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        if (tabValue === 0) {
            fetchFriends();
        } else if (tabValue === 1) {
            fetchPendingRequests();
        } else {
            fetchSuggestions();
        }
    }, [tabValue]);

    const fetchFriends = async () => {
        try {
            const response = await fetch('/api/friends');
            const data = await response.json();
            setFriends(data);
        } catch {
            toast.error('Failed to load friends');
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const response = await fetch('/api/friends/pending');
            const data = await response.json();
            setPendingRequests(data);
        } catch {
            toast.error('Failed to load pending requests');
        }
    };

    const fetchSuggestions = async () => {
        try {
            const response = await fetch('/api/profile/suggestions/friends');
            const data = await response.json();
            setSuggestions(data);
        } catch {
            toast.error('Failed to load suggestions');
        }
    };

    const handleSendRequest = async (userId) => {
        try {
            const response = await fetch('/api/friends/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ recipientId: userId }),
            });

            if (response.ok) {
                toast.success('Friend request sent');
                fetchSuggestions();
            } else {
                throw new Error('Failed to send friend request');
            }
        } catch {
            toast.error('Failed to send friend request');
        }
    };

    const handleAcceptRequest = async (friendshipId) => {
        try {
            const response = await fetch(`/api/friends/request/${friendshipId}/accept`, {
                method: 'PUT',
            });

            if (response.ok) {
                toast.success('Friend request accepted');
                fetchPendingRequests();
                fetchFriends();
            } else {
                throw new Error('Failed to accept friend request');
            }
        } catch {
            toast.error('Failed to accept friend request');
        }
    };

    const handleRejectRequest = async (friendshipId) => {
        try {
            const response = await fetch(`/api/friends/request/${friendshipId}/reject`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Friend request rejected');
                fetchPendingRequests();
            } else {
                throw new Error('Failed to reject friend request');
            }
        } catch {
            toast.error('Failed to reject friend request');
        }
    };

    const renderFriendsList = () => (
        <List>
            {friends.map((friend) => (
                <React.Fragment key={friend._id}>
                    <ListItem>
                        <ListItemAvatar>
                            <Avatar src={friend.profilePicture} />
                        </ListItemAvatar>
                        <ListItemText
                            primary={friend.name}
                            secondary={friend.email}
                        />
                        <ListItemSecondaryAction>
                            <Button
                                variant="outlined"
                                color="primary"
                                href={`/profile/${friend._id}`}
                            >
                                View Profile
                            </Button>
                        </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                </React.Fragment>
            ))}
            {friends.length === 0 && (
                <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
                    No friends yet
                </Typography>
            )}
        </List>
    );

    const renderPendingRequests = () => (
        <List>
            {pendingRequests.map((request) => (
                <React.Fragment key={request._id}>
                    <ListItem>
                        <ListItemAvatar>
                            <Avatar src={request.requester.profilePicture} />
                        </ListItemAvatar>
                        <ListItemText
                            primary={request.requester.name}
                            secondary={request.requester.email}
                        />
                        <ListItemSecondaryAction>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<CheckIcon />}
                                onClick={() => handleAcceptRequest(request._id)}
                                sx={{ mr: 1 }}
                            >
                                Accept
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<CloseIcon />}
                                onClick={() => handleRejectRequest(request._id)}
                            >
                                Reject
                            </Button>
                        </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                </React.Fragment>
            ))}
            {pendingRequests.length === 0 && (
                <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
                    No pending requests
                </Typography>
            )}
        </List>
    );

    const renderSuggestions = () => (
        <List>
            {suggestions.map((suggestion) => (
                <React.Fragment key={suggestion._id}>
                    <ListItem>
                        <ListItemAvatar>
                            <Avatar src={suggestion.profilePicture} />
                        </ListItemAvatar>
                        <ListItemText
                            primary={suggestion.name}
                            secondary={suggestion.email}
                        />
                        <ListItemSecondaryAction>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<PersonAddIcon />}
                                onClick={() => handleSendRequest(suggestion._id)}
                            >
                                Add Friend
                            </Button>
                        </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                </React.Fragment>
            ))}
            {suggestions.length === 0 && (
                <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
                    No suggestions available
                </Typography>
            )}
        </List>
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Card>
                <CardContent>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs
                            value={tabValue}
                            onChange={(e, newValue) => setTabValue(newValue)}
                            aria-label="friends tabs"
                        >
                            <Tab label="Friends" />
                            <Tab label="Pending Requests" />
                            <Tab label="Suggestions" />
                        </Tabs>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                        {tabValue === 0 && renderFriendsList()}
                        {tabValue === 1 && renderPendingRequests()}
                        {tabValue === 2 && renderSuggestions()}
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default Friends; 