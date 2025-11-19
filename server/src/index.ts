import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getTrack, searchTracks,getRandomTrack } from '../services/spotify.js';
import userRoutes from './routes/users.js';
import leaderboardRoutes from './routes/leaderboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://beatdle-app.onrender.com',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Basic test route
app.get('/', (req, res) => {
  res.send('Beatdle API is running!');
});

app.get('/api/spotify/track/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const track = await getTrack(id);
    res.json(track);
  } catch (error) {
    console.error('Error fetching track:', error);
    res.status(500).json({ 
      error: 'Failed to fetch track from Spotify',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/spotify/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Missing or empty search query' });
    }
    const results = await searchTracks(query, 5);
    res.json({ results });
  } catch (error) {
    console.error('Error searching tracks:', error);
    res.status(500).json({ 
      error: 'Failed to search tracks',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/spotify/daily-song', async (req, res) => {
  try {
    const dailyTrackId = '2qSkIjg1o9h3YT9RAgYN75';
    const track = await getTrack(dailyTrackId);
    res.json(track);
  } catch (error) {
    console.error('Error fetching daily song:', error);
    res.status(500).json({ 
      error: 'Failed to fetch daily song',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
app.get('/api/spotify/random-track', async (req, res) => {
  try {
    const track = await getRandomTrack();
    res.json(track);
  } catch (error) {
    console.error('Error fetching random track:', error);
    res.status(500).json({ 
      error: 'Failed to fetch random track',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// callback route for Spotify OAuth if we need it later
// spotify asked me to have a callback URL obligatory 
app.get('/callback', (req, res) => {
  console.log('Spotify callback hit with params:', req.query);
  res.send('Callback received');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
