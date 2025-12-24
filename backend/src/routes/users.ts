// server/src/routes/users.ts
import express from 'express';
import { query } from '../db.js';

const router = express.Router();

/**
 * @route   GET /api/users/:id
 * @desc    Fetches a single user's profile data
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  // Convert the string ID from the URL parameter into an integer
  const userId = parseInt(id, 10);

  // Validate that the ID is a valid number
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    // Query the database for a user with the matching user_id
    // Use the parsed 'userId' integer instead of the 'id' string
    const result = await query('SELECT * FROM users WHERE user_id = $1', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return the first (and only) row
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;