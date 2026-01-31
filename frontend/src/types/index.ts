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

export interface TrackSuggestion {
  id: string;
  name: string;
  artists: string[];
  album: {
    name: string;
    image: string | null;
  };
  previewUrl: string | null;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  guesses: string[];
  currentAttempt: number;
  isCorrect: boolean;
  isHost: boolean;
}

export interface LobbyState {
  players: Player[];
  currentTrack?: SpotifyTrack;
  round: number;
  maxRounds: number;
}

export interface WebSocketMessage {
  type: 'joinLobby' | 'updatePlayers' | 'startGame' | 'startRound' | 'roundOver' | 'gameOver' | 'playerGuess' | 'nextSong' | 'error';
  payload?: any;
}

export type HintType = 'year' | 'artist' | 'album';

export interface HintState {
  year: boolean;
  artist: boolean;
  album: boolean;
}

export interface GameFilters {
  genre?: string;
  artist?: string;
  decadeStart?: number;
  decadeEnd?: number;
}
