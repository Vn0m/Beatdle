import express from 'express';
import { query } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const type = req.query.type as string || 'overall';

  try {
    let result;

    if (type === 'daily') {
      result = await query(
        `SELECT u.username, s.best_streak,
                COUNT(sc.id) FILTER (WHERE sc.completed = true) AS games_won
         FROM users u
         JOIN user_stats s ON s.user_id = u.id
         LEFT JOIN scores sc ON sc.user_id = u.id AND sc.game_type = 'daily'
         GROUP BY u.username, s.best_streak
         ORDER BY s.best_streak DESC, games_won DESC
         LIMIT 10`,
        []
      );
    } else if (type === 'custom') {
      result = await query(
        `SELECT u.username,
                COUNT(sc.id) FILTER (WHERE sc.completed = true) AS games_won,
                COUNT(sc.id) AS games_played
         FROM users u
         JOIN scores sc ON sc.user_id = u.id AND sc.game_type = 'custom'
         GROUP BY u.username
         ORDER BY games_won DESC, games_played DESC
         LIMIT 10`,
        []
      );
    } else {
      result = await query(
        `SELECT u.username, s.games_won, s.games_played, s.best_streak
         FROM users u
         JOIN user_stats s ON s.user_id = u.id
         ORDER BY s.games_won DESC, s.best_streak DESC
         LIMIT 10`,
        []
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
