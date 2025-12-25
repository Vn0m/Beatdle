import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import userRoutes from './routes/users.js';
import leaderboardRoutes from './routes/leaderboard.js';
import spotifyRoutes from './routes/spotify.js';
import { initializeWebSocketServer } from './websocket/handlers.js';
import { PORT, ALLOWED_ORIGINS } from './constants.js';

dotenv.config();

const app = express();

const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) {
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
app.use('/api/spotify', spotifyRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Beatdle API is running!',
    version: '1.0.0'
  });
});

initializeWebSocketServer(wss);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
