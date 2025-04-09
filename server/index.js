import express, { urlencoded } from "express";
import cors from "cors";
import connectDB from "./db/db.js";
import animeRoutes from './routes/anime.routes.js';

const PORT = process.env.PORT

const app = express()
app.use(cors())

app.use(express.json());
connectDB()

app.get('/', (req, res) => res.send('🌍 API is running'));
app.use('/api/', animeRoutes);


app.listen(PORT, () => {console.log(`Server is running on ${process.env.PORT}`)})