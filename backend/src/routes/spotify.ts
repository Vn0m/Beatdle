import express from 'express';
import { getTrack, getDailyTrack, searchTracks, getRandomTrack, getCustomTrack } from '../services/spotify.js';

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
    const userDate = req.query.date as string | undefined;
    const track = await getDailyTrack(userDate);
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

router.get('/custom-track', async (req, res) => {
  try {
    const genre = req.query.genre as string | undefined;
    const artist = req.query.artist as string | undefined;
    const decadeStart = req.query.decadeStart ? parseInt(req.query.decadeStart as string, 10) : undefined;
    const decadeEnd = req.query.decadeEnd ? parseInt(req.query.decadeEnd as string, 10) : undefined;

    if (decadeStart && (isNaN(decadeStart) || decadeStart < 1900 || decadeStart > 2100)) {
      return res.status(400).json({ error: 'Invalid decadeStart value' });
    }
    if (decadeEnd && (isNaN(decadeEnd) || decadeEnd < 1900 || decadeEnd > 2100)) {
      return res.status(400).json({ error: 'Invalid decadeEnd value' });
    }
    if (decadeStart && decadeEnd && decadeStart > decadeEnd) {
      return res.status(400).json({ error: 'decadeStart must be less than or equal to decadeEnd' });
    }

    const settings: {
      genre?: string;
      artist?: string;
      decadeStart?: number;
      decadeEnd?: number;
    } = {};

    if (genre) settings.genre = genre;
    if (artist) settings.artist = artist;
    if (decadeStart) settings.decadeStart = decadeStart;
    if (decadeEnd) settings.decadeEnd = decadeEnd;

    const track = await getCustomTrack(settings);
    res.json(track);
  } catch (error) {
    console.error('Error fetching custom track:', error);
    res.status(500).json({
      error: 'Failed to fetch custom track'
    });
  }
});

router.get('/callback', (req, res) => {
  console.log('Spotify callback hit with params:', req.query);
  res.send('Callback received');
});

export default router;
