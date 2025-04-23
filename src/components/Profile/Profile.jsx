import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Avatar,
    Button,
    TextField,
    IconButton,
    Divider,
    Chip,
    CircularProgress
} from '@mui/material';
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';

const Profile = () => {
    const { userId } = useParams();
    const theme = useTheme();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        bio: '',
        socialLinks: {
            twitter: '',
            instagram: '',
            discord: ''
        }
    });

    const fetchProfile = useCallback(async () => {
        try {
            setIsLoading(true);
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token;
            const response = await fetch(`http://localhost:8000/api/profile/${userId || user?._id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }
            const data = await response.json();
            setProfile(data);
            setFormData({
                bio: data.bio || '',
                socialLinks: data.socialLinks || {
                    twitter: '',
                    instagram: '',
                    discord: ''
                }
            });
        } catch (error) {
            console.error('Profile fetch error:', error);
            toast.error('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    }, [userId, user?._id]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchProfile();
        }
    }, [fetchProfile, isAuthenticated]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            bio: profile.bio || '',
            socialLinks: profile.socialLinks || {
                twitter: '',
                instagram: '',
                discord: ''
            }
        });
    };

    const handleSave = async () => {
        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const updatedProfile = await response.json();
                setProfile(updatedProfile);
                setIsEditing(false);
                toast.success('Profile updated successfully');
            } else {
                throw new Error('Failed to update profile');
            }
        } catch {
            toast.error('Failed to update profile');
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            const response = await fetch('/api/profile/upload-picture', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const updatedProfile = await response.json();
                setProfile(updatedProfile);
                toast.success('Profile picture updated successfully');
            } else {
                throw new Error('Failed to upload picture');
            }
        } catch {
            toast.error('Failed to upload picture');
        }
    };

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!profile) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h5" align="center">
                    Profile not found
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                <Grid xs={12} md={4} component="div">
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                <Avatar
                                    src={profile.profilePicture}
                                    sx={{
                                        width: 150,
                                        height: 150,
                                        mb: 2,
                                        border: `4px solid ${theme.palette.primary.main}`,
                                    }}
                                />
                                {user._id === profile.userId._id && (
                                    <IconButton
                                        component="label"
                                        sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            right: 0,
                                            bgcolor: 'background.paper',
                                        }}
                                    >
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                        />
                                        <PhotoCameraIcon />
                                    </IconButton>
                                )}
                            </Box>
                            <Typography variant="h5" gutterBottom>
                                {profile.userId.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {profile.userId.email}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid xs={12} md={8} component="div">
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6">About</Typography>
                                {user._id === profile.userId._id && (
                                    <Box>
                                        {isEditing ? (
                                            <>
                                                <IconButton onClick={handleSave} color="primary">
                                                    <SaveIcon />
                                                </IconButton>
                                                <IconButton onClick={handleCancel} color="error">
                                                    <CancelIcon />
                                                </IconButton>
                                            </>
                                        ) : (
                                            <IconButton onClick={handleEdit}>
                                                <EditIcon />
                                            </IconButton>
                                        )}
                                    </Box>
                                )}
                            </Box>

                            {isEditing ? (
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    variant="outlined"
                                    label="Bio"
                                />
                            ) : (
                                <Typography variant="body1" paragraph>
                                    {profile.bio || 'No bio yet'}
                                </Typography>
                            )}

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="h6" gutterBottom>
                                Social Links
                            </Typography>
                            <Grid container spacing={2}>
                                {Object.entries(profile.socialLinks).map(([platform, link]) => (
                                    <Grid xs={12} sm={4} component="div" key={platform}>
                                        {isEditing ? (
                                            <TextField
                                                fullWidth
                                                label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                                                value={formData.socialLinks[platform]}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        socialLinks: {
                                                            ...formData.socialLinks,
                                                            [platform]: e.target.value,
                                                        },
                                                    })
                                                }
                                            />
                                        ) : (
                                            <Chip
                                                label={platform}
                                                component="a"
                                                href={link}
                                                target="_blank"
                                                clickable
                                                variant={link ? 'filled' : 'outlined'}
                                            />
                                        )}
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Profile; 