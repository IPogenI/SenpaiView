import axios from 'axios';

export default async function handler(req, res) {
  const { method, query } = req;

  // GET /api/imdb?title=...
  if (method === 'GET' && query.title) {
    try {
      const apiKey = process.env.OMDB_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: 'OMDB API key not configured' });
      }
      const response = await axios.get(`http://www.omdbapi.com/?t=${encodeURIComponent(query.title)}&type=series&apikey=${apiKey}`);
      if (response.data.Error) {
        return res.status(404).json({ message: 'Anime not found on IMDB' });
      }
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
      return res.status(200).json(animeDetails);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching anime details from IMDB' });
    }
  }

  // Method not allowed
  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${method} Not Allowed`);
} 