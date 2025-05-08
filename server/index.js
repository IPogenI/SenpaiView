import express, { urlencoded } from "express";
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
import { errorHandler } from './middleware/errorMiddleware.js'

const PORT = process.env.PORT || 8000

const app = express()
// Configure CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-frontend-domain.vercel.app'] // Replace with your actual frontend domain
    : ['http://localhost:5173'], // Vite's default port
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));


app.use(express.json());
connectDB()

app.get('/', (req, res) => res.send('🌍 API is running'));
app.use('/api/anime', animeRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/watch-history', watchHistoryRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/imdb', imdbRoutes);
app.use(errorHandler)

app.listen(PORT, () => { console.log(`Server is running on ${process.env.PORT}`) })