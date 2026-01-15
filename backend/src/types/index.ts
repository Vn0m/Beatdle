import { WebSocket } from 'ws';

export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  currentAttempt: number;
  isCorrect: boolean;
  guesses: string[];
}

export interface LobbyState {
  clients: WebSocket[];
  players: Player[];
  currentTrack?: SpotifyTrack;
  round: number;
  maxRounds: number;
  usedTrackIds: string[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: string[];
  album: {
    name: string;
    image: string;
  };
  previewUrl: string | null;
  duration: number;
  releaseDate: string;
}

export interface WebSocketMessage {
  type: string;
  payload: any;
}

export interface JoinLobbyPayload {
  lobbyId: string;
  name: string;
  isHost: boolean;
}

export interface StartGamePayload {
  lobbyId: string;
}

export interface SubmitGuessPayload {
  lobbyId: string;
  playerId: string;
  correct: boolean;
}
