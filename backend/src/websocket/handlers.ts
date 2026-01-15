import { WebSocket, WebSocketServer } from 'ws';
import type { Player, JoinLobbyPayload, StartGamePayload, SubmitGuessPayload } from '../types/index.js';
import { getRandomTrack } from '../services/spotify.js';
import { SCORE_POINTS, MAX_ROUNDS, MAX_PLAYERS } from '../constants.js';
import {
  getOrCreateLobby,
  getLobby,
  addPlayerToLobby,
  removePlayerFromLobby,
  resetPlayersForRound,
  areAllPlayersDone,
  getWinners,
} from './lobby.js';

function generatePlayerId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function broadcastToLobby(lobbyId: string, message: any): void {
  const lobby = getLobby(lobbyId);
  if (!lobby) return;

  const data = JSON.stringify(message);
  lobby.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

async function startNextRound(lobbyId: string): Promise<void> {
  const lobby = getLobby(lobbyId);
  if (!lobby) return;

  lobby.round++;

  if (lobby.round > lobby.maxRounds) {
    const winners = getWinners(lobbyId);
    broadcastToLobby(lobbyId, {
      type: 'gameOver',
      payload: { winners, players: lobby.players },
    });
    return;
  }

  resetPlayersForRound(lobbyId);

  let track;
  try {
    track = await getRandomTrack();
  } catch (err) {
    console.error('Failed to fetch track:', err);
    broadcastToLobby(lobbyId, {
      type: 'error',
      payload: { message: 'Failed to load song' },
    });
    return;
  }

  if (!track || !track.id) {
    console.error('Fetched track is missing an ID');
    broadcastToLobby(lobbyId, {
      type: 'error',
      payload: { message: 'Fetched song data is invalid' },
    });
    return;
  }

  lobby.currentTrack = track;
  lobby.usedTrackIds.push(track.id);

  broadcastToLobby(lobbyId, {
    type: 'startRound',
    payload: { track, players: lobby.players, round: lobby.round },
  });
}

function handleJoinLobby(ws: WebSocket, payload: JoinLobbyPayload): string {
  const { lobbyId, name, isHost } = payload;
  const playerId = generatePlayerId();

  const lobby = getOrCreateLobby(lobbyId);

  if (lobby.players.length >= MAX_PLAYERS) {
    ws.send(
      JSON.stringify({
        type: 'error',
        payload: { message: `Lobby is full (max ${MAX_PLAYERS} players)` },
      })
    );
    ws.close();
    return playerId;
  }

  const newPlayer: Player = {
    id: playerId,
    name,
    score: 0,
    isHost,
    currentAttempt: 0,
    isCorrect: false,
    guesses: [],
  };

  addPlayerToLobby(lobbyId, newPlayer, ws);

  ws.send(
    JSON.stringify({
      type: 'joinedLobby',
      payload: { yourId: playerId, players: lobby.players },
    })
  );

  broadcastToLobby(lobbyId, {
    type: 'updatePlayers',
    payload: { players: lobby.players },
  });

  return playerId;
}

async function handleStartGame(payload: StartGamePayload): Promise<void> {
  const { lobbyId } = payload;
  const lobby = getLobby(lobbyId);
  if (!lobby) return;

  lobby.round = 0;
  await startNextRound(lobbyId);
}

function handlePlayerGuess(payload: SubmitGuessPayload): void {
  const { lobbyId, playerId, correct } = payload;
  const lobby = getLobby(lobbyId);
  if (!lobby) return;

  const player = lobby.players.find((p) => p.id === playerId);
  if (!player) return;

  if (player.isCorrect || player.currentAttempt >= 5) return; 
  player.guesses.push(correct ? 'correct' : 'wrong');
  player.currentAttempt = player.guesses.length;

  if (correct) {
    player.isCorrect = true;
    const pointsIndex = player.currentAttempt - 1;
    player.score += SCORE_POINTS[pointsIndex] || 0;
  }

  if (areAllPlayersDone(lobbyId)) {
    if (lobby.round >= lobby.maxRounds) {
      const winners = getWinners(lobbyId);
      broadcastToLobby(lobbyId, {
        type: 'gameOver',
        payload: { winners, players: lobby.players },
      });
    } else {
      broadcastToLobby(lobbyId, {
        type: 'roundOver',
        payload: { players: lobby.players },
      });
    }
  }

  broadcastToLobby(lobbyId, {
    type: 'updatePlayers',
    payload: { players: lobby.players },
  });
}

async function handleNextSong(payload: { lobbyId: string }): Promise<void> {
  await startNextRound(payload.lobbyId);
}

export function initializeWebSocketServer(wss: WebSocketServer): void {
  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established');

    let currentLobbyId: string | null = null;
    let currentPlayerId: string | null = null;

    ws.on('message', async (message) => {
      try {
        const msg = JSON.parse(message.toString());

        switch (msg.type) {
          case 'joinLobby':
            currentPlayerId = handleJoinLobby(ws, msg.payload);
            currentLobbyId = msg.payload.lobbyId;
            break;

          case 'startGame':
            await handleStartGame(msg.payload);
            break;

          case 'playerGuess':
            handlePlayerGuess(msg.payload);
            break;

          case 'nextSong':
            await handleNextSong(msg.payload);
            break;

          default:
            console.warn('Unknown message type:', msg.type);
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      if (currentLobbyId && currentPlayerId) {
        removePlayerFromLobby(currentLobbyId, currentPlayerId, ws);

        const lobby = getLobby(currentLobbyId);
        if (lobby) {
          broadcastToLobby(currentLobbyId, {
            type: 'updatePlayers',
            payload: { players: lobby.players },
          });
        }
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
}
