import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: join(__dirname, '../../.env') });

// Get anime details from OMDB API
export const getAnimeDetails = async (req, res) => {
    try {
        const { title } = req.params;
        
        // OMDB API requires an API key
        const apiKey = process.env.OMDB_API_KEY;
        console.log('API Key:', apiKey); // Debug log
        console.log('All env:', process.env); // Debug log
        if (!apiKey) {
            return res.status(500).json({ message: 'OMDB API key not configured' });
        }

        const response = await axios.get(`http://www.omdbapi.com/?t=${encodeURIComponent(title)}&type=series&apikey=${apiKey}`);
        
        if (response.data.Error) {
            return res.status(404).json({ message: 'Anime not found on IMDB' });
        }

        // Extract and format relevant data
        const animeDetails = {
            title: response.data.Title,
            plot: response.data.Plot,
            imdbRating: response.data.imdbRating,
            imdbId: response.data.imdbID,
            year: response.data.Year,
            genre: response.data.Genre,
            totalSeasons: response.data.totalSeasons,
            poster: response.data.Poster,
            rated: response.data.Rated,
            director: response.data.Director,
            writer: response.data.Writer,
            actors: response.data.Actors,
            awards: response.data.Awards
        };

        res.json(animeDetails);
    } catch (error) {
        console.error('Error fetching IMDB data:', error);
        res.status(500).json({ message: 'Error fetching anime details from IMDB' });
    }
};
