import express from 'express';
import { query } from '../db.js';
import { verifyAuth, type AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyAuth, async (req: AuthRequest, res) => {
  const { game_date, game_type, attempts, completed } = req.body;
  const userId = req.user!.id;

  if (!game_type || attempts === undefined || completed === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!['daily', 'custom', 'multiplayer'].includes(game_type)) {
    return res.status(400).json({ error: 'Invalid game_type' });
  }

  if (attempts < 1 || attempts > 5) {
    return res.status(400).json({ error: 'attempts must be between 1 and 5' });
  }

  try {
    await query(
      `INSERT INTO scores (user_id, game_date, game_type, attempts, completed)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, game_date || null, game_type, attempts, completed]
    );

    await query(
      `UPDATE user_stats SET
         games_played = games_played + 1,
         games_won = games_won + $1,
         total_attempts = total_attempts + $2,
         guess_distribution = jsonb_set(
           guess_distribution,
           ARRAY[$3::text],
           ((COALESCE((guess_distribution->>$3)::int, 0) + 1)::text)::jsonb
         )
       WHERE user_id = $4`,
      [completed ? 1 : 0, attempts, attempts.toString(), userId]
    );

    if (game_type === 'daily') {
      if (completed) {
        await query(
          `UPDATE user_stats SET
             current_streak = current_streak + 1,
             best_streak = GREATEST(best_streak, current_streak + 1)
           WHERE user_id = $1`,
          [userId]
        );
      } else {
        await query(
          `UPDATE user_stats SET current_streak = 0 WHERE user_id = $1`,
          [userId]
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error saving score:', err);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

export default router;
