import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { getTrack, getDailyTrack, searchTracks, getRandomTrack } from '../services/spotify.js';
import userRoutes from './routes/users.js';
import leaderboardRoutes from './routes/leaderboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Create HTTP server
const server = createServer(app);

// Create WebSocket server attached to the HTTP server
const wss = new WebSocketServer({ server });

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
    const track = await getDailyTrack();
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

// WebSocket types and state
interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  currentAttempt: number;
  isCorrect: boolean;
  guesses: string[];
}

interface LobbyState {
  clients: WebSocket[];
  players: Player[];
  currentTrack?: any;
  round: number;
  maxRounds: number;
  usedTrackIds: string[];
}

const lobbies: Record<string, LobbyState> = {};
const SCORE_POINTS = [5, 4, 3, 2, 1];

// WebSocket connection handler
wss.on("connection", (ws) => {
  console.log("New WebSocket connection established");

  let currentLobbyId: string | null = null;
  let currentPlayerId: string | null = null;

  ws.on("message", async (message) => {
    try {
      const msg = JSON.parse(message.toString());
      switch (msg.type) {
        case "joinLobby": {
          const { lobbyId, name, isHost } = msg.payload;
          currentLobbyId = lobbyId;

          currentPlayerId =
            Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

          if (!lobbies[lobbyId]) {
            lobbies[lobbyId] = {
              clients: [],
              players: [],
              round: 0,
              maxRounds: 5,
              usedTrackIds: [],
            };
          }

          const lobby = lobbies[lobbyId];
          if (!lobby.players.some((p) => p.id === currentPlayerId)) {
            const newPlayer: Player = {
              id: currentPlayerId,
              name,
              score: 0,
              isHost,
              currentAttempt: 0,
              isCorrect: false,
              guesses: [],
            };
            lobby.players.push(newPlayer);
            lobby.clients.push(ws);
          }

          ws.send(
            JSON.stringify({
              type: "joinedLobby",
              payload: { yourId: currentPlayerId, players: lobby.players },
            })
          );

          broadcastToLobby(lobbyId, {
            type: "updatePlayers",
            payload: { players: lobby.players },
          });
          break;
        }

        case "startGame": {
          const { lobbyId } = msg.payload;
          const lobby = lobbies[lobbyId];
          if (!lobby) return;

          lobby.round = 0;
          await startNextRound(lobbyId);
          break;
        }

        case "playerGuess": {
          const { lobbyId, playerId, correct } = msg.payload;
          const lobby = lobbies[lobbyId];
          if (!lobby) return;

          const player = lobby.players.find((p) => p.id === playerId);
          if (!player) return;

          if (player.isCorrect || player.currentAttempt >= 5) return;

          player.guesses.push(correct ? "correct" : "wrong");
          player.currentAttempt = player.guesses.length;
          
          if (correct) {
            player.isCorrect = true;
            const pointsIndex = player.currentAttempt - 1;
            player.score += SCORE_POINTS[pointsIndex] || 0; 
          }

          if (lobby.players.every((p) => p.isCorrect || p.currentAttempt >= 5)) {
            if (lobby.round >= lobby.maxRounds) {
              const maxScore = Math.max(...lobby.players.map((p) => p.score));
              const winners = lobby.players.filter((p) => p.score === maxScore);
              broadcastToLobby(lobbyId, {
                type: "gameOver", 
                payload: { winners, players: lobby.players },
              });
            } else {
               broadcastToLobby(lobbyId, {
                type: "roundOver", 
                payload: { players: lobby.players },
              });
            }
          }

          broadcastToLobby(lobbyId, {
            type: "updatePlayers",
            payload: { players: lobby.players },
          });
          break;
        }
        
        case "nextSong": {
          const { lobbyId } = msg.payload;
          await startNextRound(lobbyId);
          break;
        }
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  });

  ws.on("close", () => {
    if (!currentLobbyId || !currentPlayerId) return;

    const lobby = lobbies[currentLobbyId];
    if (!lobby) return;

    lobby.clients = lobby.clients.filter((c) => c !== ws);
    lobby.players = lobby.players.filter((p) => p.id !== currentPlayerId);

    if (lobby.clients.length === 0) {
      delete lobbies[currentLobbyId];
    } else {
      if (lobby.players.length > 0 && !lobby.players.some(p => p.isHost)) {
          const newHost = lobby.players[0];
          if (newHost) {
              newHost.isHost = true;
          }
      }
      
      broadcastToLobby(currentLobbyId, {
        type: "updatePlayers",
        payload: { players: lobby.players },
      });
    }
  });
});

async function startNextRound(lobbyId: string) {
  const lobby = lobbies[lobbyId];
  if (!lobby) return;

  lobby.round++;

  if (lobby.round > lobby.maxRounds) {
      const maxScore = Math.max(...lobby.players.map((p) => p.score));
      const winners = lobby.players.filter((p) => p.score === maxScore);
      broadcastToLobby(lobbyId, {
          type: "gameOver",
          payload: { winners, players: lobby.players },
      });
      return;
  }
  
  lobby.players.forEach((p) => {
    p.currentAttempt = 0;
    p.isCorrect = false;
    p.guesses = [];
  });

  let track;
  try {
    track = await getRandomTrack();
  } catch (err) {
    console.error("Failed to fetch track", err);
    broadcastToLobby(lobbyId, { type: "error", payload: { message: "Failed to load song" } });
    return;
  }

  if (track && track.id) {
      lobby.currentTrack = track;
      lobby.usedTrackIds.push(track.id);
  } else {
      console.error("Fetched track is missing an ID.");
      broadcastToLobby(lobbyId, { type: "error", payload: { message: "Fetched song data is invalid" } });
      return;
  }

  broadcastToLobby(lobbyId, {
    type: "startRound",
    payload: { track, players: lobby.players, round: lobby.round },
  });
}

function broadcastToLobby(lobbyId: string, message: any) {
  const lobby = lobbies[lobbyId];
  if (!lobby) return;
  const data = JSON.stringify(message);
  lobby.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(data);
  });
}

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
