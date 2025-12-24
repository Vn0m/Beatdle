// server/src/routes/leaderboard.ts

import express from 'express';
// We can reuse the same db connection!
import { query } from '../db.js';

const router = express.Router();

/**
 * @route   GET /api/leaderboard
 * @desc    Fetches top 10 users, sorted by max_streak
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT username, max_streak, games_won FROM users ORDER BY max_streak DESC, games_won DESC LIMIT 10',
      []
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;