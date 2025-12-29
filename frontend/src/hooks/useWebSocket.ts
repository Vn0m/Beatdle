import { useEffect, useRef, useState } from 'react';
import type { Player, SpotifyTrack } from '../types';
import { WS_URL } from '../constants';

const ROUND_TIME_SECONDS = 90;

type LobbyMessage =
  | { type: 'joinedLobby'; payload: { yourId: string; players: Player[] } }
  | { type: 'updatePlayers'; payload: { players: Player[] } }
  | { type: 'startRound'; payload: { track: SpotifyTrack; players: Player[]; round: number } }
  | { type: 'roundOver'; payload: { players: Player[] } }
  | { type: 'gameOver'; payload: { winners: Player[]; players: Player[] } }
  | { type: 'error'; payload: { message: string } };

function isLobbyMessage(data: unknown): data is LobbyMessage {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return typeof d.type === 'string' && 'payload' in d;
}

interface UseWebSocketProps {
  lobbyId: string;
  name: string;
  isHost: boolean;
}

export function useWebSocket({ lobbyId, name, isHost }: UseWebSocketProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const myIdRef = useRef<string | null>(null);

  const [myId, setMyId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [round, setRound] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [roundOver, setRoundOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(ROUND_TIME_SECONDS);

  // WebSocket connection
  useEffect(() => {
    if (!('WebSocket' in window)) {
      setError('Your browser does not support WebSockets.');
      return;
    }

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    let hasConnected = false;

    ws.onopen = () => {
      hasConnected = true;
      setError(null); // Clear any previous errors
      ws.send(JSON.stringify({ type: 'joinLobby', payload: { lobbyId, name, isHost } }));
    };

    ws.onmessage = (event) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(event.data);
      } catch {
        return;
      }
      if (!isLobbyMessage(parsed)) return;
      const msg = parsed;

      switch (msg.type) {
        case 'joinedLobby':
          setMyId(msg.payload.yourId);
          myIdRef.current = msg.payload.yourId;
          setPlayers(msg.payload.players);
          break;

        case 'updatePlayers':
          setPlayers(msg.payload.players);
          break;

        case 'startRound':
          setTrack(msg.payload.track);
          setRound(msg.payload.round);
          setGameStarted(true);
          setRoundOver(false);
          setGameOver(false);
          setTimeLeft(ROUND_TIME_SECONDS);

          setPlayers((prev) =>
            prev.map((p) => ({
              ...p,
              currentAttempt: 0,
              guesses: [],
              isCorrect: false,
            }))
          );
          break;

        case 'roundOver':
          setPlayers(msg.payload.players);
          setRoundOver(true);
          break;

        case 'gameOver':
          setGameOver(true);
          setRoundOver(true);
          setPlayers(msg.payload.players);
          break;

        case 'error':
          setError(msg.payload.message || 'Server error');
          break;
      }
    };

    ws.onerror = () => {
      // Don't set error state - it fires too early and causes flashing
      console.log('WebSocket error event (connection may still succeed)');
    };
    
    ws.onclose = () => {
      console.log('Disconnected from server');
      // Only show error if we successfully connected before and then lost connection
      if (hasConnected && myIdRef.current) {
        setError('Lost connection to server');
      }
      // Don't show error during initial connection - it causes flashing
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [lobbyId, name, isHost]);

  // Timer
  useEffect(() => {
    if (!gameStarted || gameOver || roundOver) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setRoundOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameStarted, gameOver, roundOver]);

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const startGame = () => {
    sendMessage({ type: 'startGame', payload: { lobbyId } });
  };

  const submitGuess = (correct: boolean) => {
    sendMessage({ type: 'playerGuess', payload: { lobbyId, playerId: myId, correct } });
  };

  const nextRound = () => {
    sendMessage({ type: 'nextSong', payload: { lobbyId } });
  };

  return {
    myId,
    players,
    track,
    round,
    gameStarted,
    gameOver,
    roundOver,
    error,
    timeLeft,
    startGame,
    submitGuess,
    nextRound,
  };
}
