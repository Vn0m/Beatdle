import { WebSocketServer, WebSocket } from "ws";

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
  currentTrack?: any; // SpotifyTrack object
  round: number;
  maxRounds: number;
  usedTrackIds: string[]; // Added to prevent song repetition
}

const wss = new WebSocketServer({ port: 8080 });
const lobbies: Record<string, LobbyState> = {};

// Points awarded based on the attempt number (1st attempt gives 5 points, 5th gives 1)
const SCORE_POINTS = [5, 4, 3, 2, 1];

wss.on("connection", (ws) => {
  console.log("New connection established");

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
              usedTrackIds: [], // Initialized for tracking repeated songs
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

          // Start the game at round 1
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

          // Do not process guess if player already got it right or has max attempts
          if (player.isCorrect || player.currentAttempt >= 5) return;

          player.guesses.push(correct ? "correct" : "wrong");
          player.currentAttempt = player.guesses.length;
          
          if (correct) {
            player.isCorrect = true;
            // Scoring logic: 5 points for 1st attempt, 4 for 2nd, etc.
            const pointsIndex = player.currentAttempt - 1;
            player.score += SCORE_POINTS[pointsIndex] || 0; 
          }

          // Check if all players finished the round
          if (lobby.players.every((p) => p.isCorrect || p.currentAttempt >= 5)) {
            // Check if game is over (this is handled in startNextRound's pre-check, but kept here for fallback)
            if (lobby.round >= lobby.maxRounds) {
              const maxScore = Math.max(...lobby.players.map((p) => p.score));
              const winners = lobby.players.filter((p) => p.score === maxScore);
              broadcastToLobby(lobbyId, {
                type: "gameOver", 
                payload: { winners, players: lobby.players },
              });
            } else {
               // Notify clients that the round is over based on player completion
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
          // This message is sent by the host to move to the next round
          const { lobbyId } = msg.payload;
          await startNextRound(lobbyId);
          break;
        }
      }
    } catch (error) {
      console.error("Error handling message:", error);
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
      // Reassign host if the host left
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

  // Increment round counter
  lobby.round++;

  // Check for game over
  if (lobby.round > lobby.maxRounds) {
      const maxScore = Math.max(...lobby.players.map((p) => p.score));
      const winners = lobby.players.filter((p) => p.score === maxScore);
      broadcastToLobby(lobbyId, {
          type: "gameOver",
          payload: { winners, players: lobby.players },
      });
      return;
  }
  
  // Reset players' round data
  lobby.players.forEach((p) => {
    p.currentAttempt = 0;
    p.isCorrect = false;
    p.guesses = [];
  });

  // Fetch random track from your API
  let track;
  try {
    // MODIFIED: Pass excluded IDs to the API
    const res = await fetch("http://localhost:8000/api/spotify/random-track", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ exclude: lobby.usedTrackIds }),
    });

    if (!res.ok) throw new Error("Failed to fetch track");
    track = await res.json();
  } catch (err) {
    console.error("Failed to fetch track", err);
    broadcastToLobby(lobbyId, { type: "error", payload: { message: "Failed to load song" } });
    return;
  }

  // ADDED: Store the track ID
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

console.log("WebSocket server running on ws://localhost:8080");