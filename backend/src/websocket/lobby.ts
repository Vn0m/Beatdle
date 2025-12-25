import type { Player, LobbyState } from '../types/index.js';

export const lobbies: Record<string, LobbyState> = {};

export function getOrCreateLobby(lobbyId: string): LobbyState {
  if (!lobbies[lobbyId]) {
    lobbies[lobbyId] = {
      clients: [],
      players: [],
      round: 0,
      maxRounds: 5,
      usedTrackIds: [],
    };
  }
  return lobbies[lobbyId];
}

export function getLobby(lobbyId: string): LobbyState | undefined {
  return lobbies[lobbyId];
}

export function deleteLobby(lobbyId: string): void {
  delete lobbies[lobbyId];
}

export function addPlayerToLobby(
  lobbyId: string,
  player: Player,
  ws: any
): void {
  const lobby = lobbies[lobbyId];
  if (!lobby) return;

  if (!lobby.players.some((p) => p.id === player.id)) {
    lobby.players.push(player);
    lobby.clients.push(ws);
  }
}

export function removePlayerFromLobby(
  lobbyId: string,
  playerId: string,
  ws: any
): void {
  const lobby = lobbies[lobbyId];
  if (!lobby) return;

  lobby.clients = lobby.clients.filter((c) => c !== ws);
  lobby.players = lobby.players.filter((p) => p.id !== playerId);

  if (lobby.clients.length === 0) {
    deleteLobby(lobbyId);
    return;
  }

  if (lobby.players.length > 0 && !lobby.players.some((p) => p.isHost)) {
    const newHost = lobby.players[0];
    if (newHost) {
      newHost.isHost = true;
    }
  }
}

export function resetPlayersForRound(lobbyId: string): void {
  const lobby = lobbies[lobbyId];
  if (!lobby) return;

  lobby.players.forEach((p) => {
    p.currentAttempt = 0;
    p.isCorrect = false;
    p.guesses = [];
  });
}

export function areAllPlayersDone(lobbyId: string): boolean {
  const lobby = lobbies[lobbyId];
  if (!lobby) return false;

  return lobby.players.every((p) => p.isCorrect || p.currentAttempt >= 5);
}

export function getWinners(lobbyId: string): Player[] {
  const lobby = lobbies[lobbyId];
  if (!lobby) return [];

  const maxScore = Math.max(...lobby.players.map((p) => p.score));
  return lobby.players.filter((p) => p.score === maxScore);
}
