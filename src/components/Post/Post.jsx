import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Box,
    Container,
    Card,
    CardContent,
    CardMedia,
    Typography,
    TextField,
    Button,
    IconButton,
    Avatar,
    Divider,
    Grid,
    Chip,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Comment as CommentIcon,
    Share as ShareIcon,
    EmojiEmotions as EmojiIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import EmojiPicker from 'emoji-picker-react';

const Post = () => {
    const { user } = useSelector((state) => state.auth);
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({
        content: '',
        visibility: 'public',
        media: []
    });
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await fetch('/api/posts');
            const data = await response.json();
            setPosts(data);
        } catch {
            toast.error('Failed to load posts');
        }
    };

    const handleCreatePost = async () => {
        if (!newPost.content.trim() && selectedFiles.length === 0) {
            toast.error('Post cannot be empty');
            return;
        }

        const formData = new FormData();
        formData.append('content', newPost.content);
        formData.append('visibility', newPost.visibility);
        selectedFiles.forEach((file) => {
            formData.append('media', file);
        });

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const createdPost = await response.json();
                setPosts([createdPost, ...posts]);
                setNewPost({
                    content: '',
                    visibility: 'public',
                    media: []
                });
                setSelectedFiles([]);
                setPreviewUrls([]);
                toast.success('Post created successfully');
            } else {
                throw new Error('Failed to create post');
            }
        } catch {
            toast.error('Failed to create post');
        }
    };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        if (files.length + selectedFiles.length > 5) {
            toast.error('Maximum 5 files allowed');
            return;
        }

        setSelectedFiles([...selectedFiles, ...files]);
        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    };

    const handleLike = async (postId) => {
        try {
            const response = await fetch(`/api/posts/${postId}/like`, {
                method: 'PUT',
            });

            if (response.ok) {
                const updatedPost = await response.json();
                setPosts(posts.map(post => 
                    post._id === postId ? updatedPost : post
                ));
            } else {
                throw new Error('Failed to like post');
            }
        } catch {
            toast.error('Failed to like post');
        }
    };

    const handleComment = async (postId, content) => {
        try {
            const response = await fetch(`/api/posts/${postId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content }),
            });

            if (response.ok) {
                const updatedPost = await response.json();
                setPosts(posts.map(post => 
                    post._id === postId ? updatedPost : post
                ));
            } else {
                throw new Error('Failed to add comment');
            }
        } catch {
            toast.error('Failed to add comment');
        }
    };

    const onEmojiClick = (event, emojiObject) => {
        setNewPost({
            ...newPost,
            content: newPost.content + emojiObject.emoji
        });
        setShowEmojiPicker(false);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Create Post Card */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Avatar src={user.profilePicture} sx={{ mr: 2 }} />
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="What's on your mind?"
                            value={newPost.content}
                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                            variant="outlined"
                        />
                    </Box>

                    {/* Media Preview */}
                    {previewUrls.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Grid container spacing={1}>
                                {previewUrls.map((url, index) => (
                                    <Grid item xs={4} key={index}>
                                        <Box
                                            sx={{
                                                position: 'relative',
                                                paddingTop: '100%',
                                                borderRadius: 1,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <img
                                                src={url}
                                                alt={`Preview ${index + 1}`}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <input
                                accept="image/*,video/*"
                                style={{ display: 'none' }}
                                id="media-upload"
                                type="file"
                                multiple
                                onChange={handleFileSelect}
                            />
                            <label htmlFor="media-upload">
                                <Button component="span" startIcon={<ShareIcon />}>
                                    Add Media
                                </Button>
                            </label>
                            <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                                <EmojiIcon />
                            </IconButton>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <FormControl size="small">
                                <InputLabel>Visibility</InputLabel>
                                <Select
                                    value={newPost.visibility}
                                    onChange={(e) => setNewPost({ ...newPost, visibility: e.target.value })}
                                    label="Visibility"
                                >
                                    <MenuItem value="public">Public</MenuItem>
                                    <MenuItem value="friends">Friends</MenuItem>
                                    <MenuItem value="private">Private</MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleCreatePost}
                            >
                                Post
                            </Button>
                        </Box>
                    </Box>

                    {showEmojiPicker && (
                        <Box sx={{ position: 'absolute', zIndex: 1 }}>
                            <EmojiPicker onEmojiClick={onEmojiClick} />
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Posts List */}
            {posts.map((post) => (
                <Card key={post._id} sx={{ mb: 3 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar src={post.author.profilePicture} sx={{ mr: 2 }} />
                            <Box>
                                <Typography variant="subtitle1">
                                    {post.author.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(post.createdAt).toLocaleString()}
                                </Typography>
                            </Box>
                        </Box>

                        <Typography variant="body1" paragraph>
                            {post.content}
                        </Typography>

                        {/* Post Media */}
                        {post.media && post.media.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                                <Grid container spacing={1}>
                                    {post.media.map((media, index) => (
                                        <Grid item xs={4} key={index}>
                                            {media.type === 'image' ? (
                                                <CardMedia
                                                    component="img"
                                                    image={media.url}
                                                    alt={`Media ${index + 1}`}
                                                    sx={{ borderRadius: 1 }}
                                                />
                                            ) : (
                                                <video
                                                    controls
                                                    style={{ width: '100%', borderRadius: '4px' }}
                                                >
                                                    <source src={media.url} type={media.contentType} />
                                                </video>
                                            )}
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        {/* Post Actions */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Box>
                                <IconButton onClick={() => handleLike(post._id)}>
                                    {post.likes.includes(user._id) ? (
                                        <FavoriteIcon color="error" />
                                    ) : (
                                        <FavoriteBorderIcon />
                                    )}
                                </IconButton>
                                <Typography variant="caption">
                                    {post.likes.length} likes
                                </Typography>
                            </Box>
                            <Typography variant="caption">
                                {post.comments.length} comments
                            </Typography>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {/* Comments */}
                        {post.comments.map((comment) => (
                            <Box key={comment._id} sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <Avatar
                                        src={comment.user.profilePicture}
                                        sx={{ width: 24, height: 24, mr: 1 }}
                                    />
                                    <Box>
                                        <Typography variant="subtitle2">
                                            {comment.user.name}
                                        </Typography>
                                        <Typography variant="body2">
                                            {comment.content}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        ))}

                        {/* Add Comment */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                            <Avatar
                                src={user.profilePicture}
                                sx={{ width: 32, height: 32, mr: 1 }}
                            />
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Write a comment..."
                                variant="outlined"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && e.target.value.trim()) {
                                        handleComment(post._id, e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                            />
                        </Box>
                    </CardContent>
                </Card>
            ))}
        </Container>
    );
};

export default Post; 