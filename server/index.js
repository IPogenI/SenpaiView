import express from "express";
import cors from "cors";
import 'dotenv/config';
import connectDB from "./db/db.js";
import animeRoutes from './routes/anime.routes.js';
import watchlistRoutes from './routes/watchlist.routes.js';
import ratingRoutes from './routes/rating.routes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import chatRoutes from './routes/chat.routes.js';
import userRoutes from './routes/userRoutes.js';
import imdbRoutes from './routes/imdb.routes.js';
import youtubeRoutes from './routes/youtubeRoutes.js';
import watchHistoryRoutes from './routes/watchHistory.routes.js';
import profileRoutes from './routes/profileRoutes.js';
import friendshipRoutes from './routes/friendshipRoutes.js';
import postRoutes from './routes/postRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8000;

const app = express();
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
connectDB();

// Request logging middleware
app.use((req, res, next) => {
    console.log('=== Incoming Request ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Path:', req.path);
    console.log('Original URL:', req.originalUrl);
    console.log('=====================');
    next();
});

// Routes
app.get('/', (req, res) => res.send('🌍 API is running'));

// API Routes
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/friends', friendshipRoutes);
app.use('/api/anime', animeRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/watch-history', watchHistoryRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/imdb', imdbRoutes);

// Debug catch-all route
app.use('*', (req, res, next) => {
    console.log('=== Catch-all Route ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Path:', req.path);
    console.log('Original URL:', req.originalUrl);
    console.log('Headers:', req.headers);
    console.log('=====================');
    next();
});

// Error handling
app.use(notFound); // Handle 404s
app.use(errorHandler); // Handle other errors

// Start server
app.listen(PORT, () => { 
    console.log(`Server is running on port ${PORT}`);
    console.log('Available routes:');
    console.log('- POST /api/posts');
    console.log('- GET /api/posts');
    console.log('- PUT /api/posts/:postId/like');
    console.log('- POST /api/posts/:postId/comment');
    console.log('- DELETE /api/posts/:postId');
});