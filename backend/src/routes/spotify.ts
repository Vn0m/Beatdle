import express from 'express';
import { getTrack, getDailyTrack, searchTracks, getRandomTrack } from '../services/spotify.js';

const router = express.Router();

router.get('/track/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const track = await getTrack(id);
    res.json(track);
  } catch (error) {
    console.error('Error fetching track:', error);
    res.status(500).json({
      error: 'Failed to fetch track from Spotify'
    });
  }
});

router.get('/search', async (req, res) => {
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
      error: 'Failed to search tracks'
    });
  }
});

router.get('/daily-song', async (req, res) => {
  try {
    const track = await getDailyTrack();
    res.json(track);
  } catch (error) {
    console.error('Error fetching daily song:', error);
    res.status(500).json({
      error: 'Failed to fetch daily song'
    });
  }
});

router.get('/random-track', async (req, res) => {
  try {
    const track = await getRandomTrack();
    res.json(track);
  } catch (error) {
    console.error('Error fetching random track:', error);
    res.status(500).json({
      error: 'Failed to fetch random track'
    });
  }
});

router.get('/callback', (req, res) => {
  console.log('Spotify callback hit with params:', req.query);
  res.send('Callback received');
});

export default router;
