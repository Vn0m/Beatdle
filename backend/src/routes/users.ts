import express from 'express';
import { query } from '../db.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const userId = parseInt(id, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const result = await query('SELECT * FROM users WHERE user_id = $1', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;