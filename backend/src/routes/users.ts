import express from 'express';
import { query } from '../db.js';
import { verifyAuth, type AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.post('/sync', verifyAuth, async (req: AuthRequest, res) => {
  const { id, email } = req.user!
  const username = req.body.username || email.split('@')[0]

  try {
    await query(
      `INSERT INTO users (id, username)
       VALUES ($1, $2)
       ON CONFLICT (id) DO NOTHING`,
      [id, username]
    )
    await query(
      `INSERT INTO user_stats (user_id)
       VALUES ($1)
       ON CONFLICT (user_id) DO NOTHING`,
      [id]
    )
    const result = await query('SELECT * FROM users WHERE id = $1', [id])
    res.json(result.rows[0])
  } catch (err) {
    console.error('Error syncing user:', err)
    res.status(500).json({ error: 'Failed to sync user' })
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const userResult = await query('SELECT id, username, avatar_url, created_at FROM users WHERE id = $1', [id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const statsResult = await query('SELECT * FROM user_stats WHERE user_id = $1', [id]);

    const gameTypeStats = await query(
      `SELECT game_type,
              COUNT(*) AS games_played,
              COUNT(*) FILTER (WHERE completed = true) AS games_won
       FROM scores WHERE user_id = $1
       GROUP BY game_type`,
      [id]
    );

    const byType: Record<string, { games_played: number; games_won: number }> = {};
    for (const row of gameTypeStats.rows) {
      byType[row.game_type] = { games_played: Number(row.games_played), games_won: Number(row.games_won) };
    }

    res.json({
      ...userResult.rows[0],
      stats: statsResult.rows[0] || null,
      daily: byType['daily'] || null,
      custom: byType['custom'] || null,
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
