import { useEffect, useState, useRef } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import Autocomplete from "../components/Autocomplete";
import type { SpotifyTrack } from "../components/types";
import { handleGuess } from "../components/handleGuess";
import type { TrackSuggestion } from "../api/spotify";

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  score: number;
  currentAttempt: number;
  isCorrect: boolean;
  guesses: string[];
}

type LobbyMessage =
  | { type: "joinedLobby"; payload: { yourId: string; players: Player[] } }
  | { type: "updatePlayers"; payload: { players: Player[] } }
  | { type: "startRound"; payload: { track: SpotifyTrack; players: Player[]; round: number } }
  | { type: "roundOver"; payload: { players: Player[] } }
  | { type: "gameOver"; payload: { winners: Player[]; players: Player[] } }
  | { type: "error"; payload: { message: string } };

const MAX_ATTEMPTS = 5;
const MAX_ROUNDS = 5;
const SNIPPET_DURATIONS = [3, 6, 9, 12, 15];
const ROUND_TIME_SECONDS = 90;

function isLobbyMessage(data: unknown): data is LobbyMessage {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return typeof d.type === "string" && "payload" in d;
}

export default function MultiplayerLobby() {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const location = useLocation();

  const wsRef = useRef<WebSocket | null>(null);
  const myIdRef = useRef<string | null>(null);

  const query = new URLSearchParams(location.search);
  const name = query.get("name") || "Anonymous";
  const isHost = query.get("host") === "true";

  const [myId, setMyId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [round, setRound] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [roundOver, setRoundOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  // const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(ROUND_TIME_SECONDS);

  const audioRef = useRef<HTMLAudioElement>(null);
  const me = players.find(p => p.id === myId);
  const won = me?.isCorrect ?? false;

  // Get WebSocket URL from environment or default to localhost
  const getWebSocketUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    // Convert http:// to ws:// and https:// to wss://
    return apiUrl.replace(/^http/, 'ws');
  };

  // ------------------ WEBSOCKET ------------------
  useEffect(() => {
    if (!("WebSocket" in window)) {
      setError("Your browser does not support WebSockets.");
      return;
    }

    const wsUrl = getWebSocketUrl();
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "joinLobby", payload: { lobbyId, name, isHost } }));
    };

    ws.onmessage = event => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(event.data);
      } catch { return; }
      if (!isLobbyMessage(parsed)) return;
      const msg = parsed;

      switch (msg.type) {
        case "joinedLobby":
          setMyId(msg.payload.yourId);
          myIdRef.current = msg.payload.yourId;
          setPlayers(msg.payload.players);
          break;

        case "updatePlayers":
          setPlayers(msg.payload.players);
          // Check if my state of `won` changed, and if so, stop playing snippet
          if (audioRef.current && msg.payload.players.find(p => p.id === myIdRef.current)?.isCorrect) {
              audioRef.current.pause();
          }
          break;

        case "startRound":
          setTrack(msg.payload.track);
          setRound(msg.payload.round);
          setGameStarted(true);
          setRoundOver(false);
          setGameOver(false); 
          setTimeLeft(ROUND_TIME_SECONDS);

          // Reset individual attempts on client to avoid a flicker
          setPlayers(prev =>
            prev.map(p => ({
              ...p,
              currentAttempt: 0,
              guesses: [],
              isCorrect: false
            }))
          );
          break;

        case "roundOver":
          setPlayers(msg.payload.players);
          setRoundOver(true);
          break;

        case "gameOver":
          setGameOver(true);
          setRoundOver(true); 
          setPlayers(msg.payload.players);
          break;

        case "error":
          setError(msg.payload.message || "Server error");
          break;
      }

      ws.onerror = () => setError("WebSocket connection failed.");
      ws.onclose = () => console.log("Disconnected from server");

    };
 
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
      }
    };
  }, [lobbyId, name, isHost]);

  // ------------------ TIMER ------------------
  useEffect(() => {
    if (!gameStarted || gameOver || roundOver) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setRoundOver(true); // End round if time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameStarted, gameOver, roundOver]);

  // ------------------ GAME FUNCTIONS ------------------
  function playSnippet() {
    if (!audioRef.current || !track || !me || won || me.currentAttempt >= MAX_ATTEMPTS) return; 
    const audio = audioRef.current;
    audio.currentTime = 0;
    const duration = SNIPPET_DURATIONS[me.currentAttempt] || 15;
    audio.play();
    setIsPlaying(true);

    const timeout = setTimeout(() => { audio.pause(); setIsPlaying(false); }, duration * 1000);
    audio.onpause = () => { clearTimeout(timeout); setIsPlaying(false); };
  }

  function onGuess(selected: TrackSuggestion) {
    if (!me || !track || roundOver) return;

    // Use handleGuess only to determine correctness, but do not update local state
    const correct = handleGuess(
      selected.name,
      track,
      me.guesses,
      () => {}, // Do not update state locally in multiplayer
      () => {}  // Do not set roundOver locally in multiplayer
    );

    wsRef.current?.send(JSON.stringify({ type: "playerGuess", payload: { lobbyId, playerId: myId, correct } }));
  }
  
  function startGame() {
    if (!isHost) return;
    wsRef.current?.send(JSON.stringify({ type: "startGame", payload: { lobbyId } }));
  }

  function nextSong() {
    if (!isHost || round >= MAX_ROUNDS) return; 
    wsRef.current?.send(JSON.stringify({ type: "nextSong", payload: { lobbyId } }));
  }

  // ------------------ RENDER HELPERS ------------------
  function renderScoreboard() {
    return (
      <div className="w-64 bg-gray-800 p-4 rounded-lg shadow-xl h-full sticky top-4">
        <h3 className="text-xl font-semibold mb-3 text-center text-blue-400">Players ({players.length})</h3>
        <ul className="space-y-3">
          {players.sort((a, b) => b.score - a.score).map(p => (
            <li 
              key={p.id} 
              className={`p-3 rounded-lg flex flex-col justify-between items-start text-sm ${p.id === myId ? "border-2 border-yellow-500 bg-gray-700/50" : "bg-gray-700"}`}
            >
              <div className="font-bold truncate w-full flex justify-between items-center">
                <span>{p.name} {p.isHost && "👑"}</span>
                <span className="text-lg text-green-400">{p.score}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                  {p.isCorrect ? "✅ Correct" : `Attempts: ${p.currentAttempt}/${MAX_ATTEMPTS}`}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  
  function renderLobby() {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-center">Waiting Room</h2>
        <p className="text-center text-lg mb-4">
          You are: <span className="font-bold text-blue-400">{name}</span> {isHost && "(Host)"}
        </p>
        {isHost && (
          <button onClick={startGame} className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-xl font-semibold mb-6">
            Start Game
          </button>
        )}
        <h3 className="text-xl font-semibold mb-3">Players ({players.length})</h3>
        <ul className="space-y-2">
          {players.map(p => (
            <li key={p.id} className={`bg-gray-700 p-3 rounded-lg flex justify-between items-center ${p.id === myId ? "border-2 border-blue-400" : ""}`}>
              <span className="font-medium">{p.name} {p.isHost && "👑"}</span>
              <span className="font-bold">Score: {p.score}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  function renderGame() {
      if (!track || !me) return <div>Loading...</div>;
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
  
      // Get the correct snippet duration for the waveform based on the player's current attempt
      const meAttempt = me.currentAttempt; // Alias for cleaner usage in waveform logic

      return (
        <div className="relative max-w-7xl mx-auto w-full p-4">
          
          {/* Main Game Grid Container */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_40rem_1fr] xl:grid-cols-[1fr_40rem_1fr] gap-8">
              
              {/* Left Spacer (1fr) */}
              <div className="hidden lg:block"></div>
  
              {/* Center Content (Guessing Interface) */}
              <div className="w-full max-w-2xl mx-auto flex flex-col items-center mt-4 lg:mt-16 order-2 lg:order-1">
                
                {/* Timer/Round */}
                <div className="w-full flex justify-between absolute top-0 lg:static mb-6 p-4 lg:p-0">
                    <div className="bg-gray-800 px-3 py-1 rounded text-white font-bold">
                        Timer: {minutes}:{seconds.toString().padStart(2, "0")}
                    </div>
                    <div className="bg-gray-800 px-3 py-1 rounded text-white font-bold">
                        Round: {round} / {MAX_ROUNDS}
                    </div>
                </div>
                
                {track.previewUrl && <audio ref={audioRef} src={track.previewUrl || undefined} />}
                <button
                  onClick={playSnippet}
                  disabled={isPlaying || won || roundOver || me.currentAttempt >= MAX_ATTEMPTS}
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-6 ${isPlaying || won || roundOver || me.currentAttempt >= MAX_ATTEMPTS ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  {isPlaying ? "⏸" : "▶️"}
                </button>
  
                {/* ADDED: Waveform visualization */}
                <div className="flex gap-1 mb-8 h-16 items-end">
                  {[...Array(30)].map((_, i) => {
                    // Check duration based on the number of attempts already made (meAttempt)
                    // The first attempt (meAttempt=0) uses duration at index 0 (3s)
                    const durationIndex = Math.min(meAttempt, SNIPPET_DURATIONS.length - 1);
                    const currentUnlockedDuration = SNIPPET_DURATIONS[durationIndex] || 0;
                    
                    const isUnlocked = i < (currentUnlockedDuration / 15) * 30; // 15s is max, 30 bars
                    
                    return (
                      <div
                        key={i}
                        className={`w-2 rounded-t ${
                          isUnlocked ? "bg-red-500" : "bg-gray-600"
                        }`}
                        style={{
                          height: `${20 + Math.random() * 80}%`,
                        }}
                      />
                    );
                  })}
                </div>

                {!won && !roundOver && (
                  <Autocomplete onSelect={onGuess} disabled={won || roundOver || me.currentAttempt >= MAX_ATTEMPTS} />
                )}
                
                {/* Display Track Info after round ends */}
                {roundOver && (
                  <div className="text-center mt-4">
                    <p className="text-xl font-bold text-green-400">Answer: {track.name}</p>
                    <p className="text-lg text-gray-300">Artist: {track.artists}</p> 
                  </div>
                )}
  
                {/* Attempt Boxes */}
                <div className="flex gap-3 mt-4">
                  {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
                    const guess = me.guesses[i];
                    let boxClass = "bg-gray-700 border-gray-600";
                    if (guess === "correct") boxClass = "bg-green-500 border-green-600";
                    else if (guess === "wrong") boxClass = "bg-red-500 border-red-600";
                    
                    // Highlight current attempt box
                    if (i === me.currentAttempt && !won && !roundOver) {
                      boxClass = "border-2 border-yellow-400 animate-pulse";
                    }
                    
                    return (
                      <div key={i} className={`w-16 h-16 border-2 rounded-lg flex items-center justify-center text-lg font-bold ${boxClass}`}>
                        {i + 1}
                      </div>
                    );
                  })}
                </div>
  
                {/* Next Song/Game Finished Button */}
                {(roundOver && round < MAX_ROUNDS && isHost) && (
                  <button
                    onClick={nextSong}
                    className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-white"
                  >
                    Next Song
                  </button>
                )}
  
                {/* Game finished */}
                {gameOver && (
                  <div className="mt-6 text-xl font-bold text-yellow-400 text-center">
                    Game Finished!
                    <div className="text-lg mt-2">
                      <h4 className="text-white font-semibold">Final Scores:</h4>
                      {players
                        .sort((a, b) => b.score - a.score)
                        .map((p) => (
                          <div key={p.id} className="text-gray-300">
                            {p.name}: {p.score} points
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
  
              {/* Right Scoreboard (Fixed Width) */}
              <div className="order-1 lg:order-2 hidden lg:block">
                  {renderScoreboard()}
              </div>
          </div>
        </div>
      );
    } 

  // ------------------ MAIN RENDER ------------------
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <header className="flex items-center p-4 bg-gray-800 shadow-lg relative">
        <Link to="/" className="p-2 rounded-full hover:bg-gray-700 absolute left-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="grow text-center">
          <div className="bg-gray-700 px-6 py-2 rounded text-xl font-bold">LOBBY: {lobbyId}</div>
        </div>
      </header>
      <main className="flex flex-col items-center p-4 grow">
        {error && <div className="bg-red-800 border border-red-600 text-red-100 px-4 py-3 rounded-lg mb-6">{error}</div>}
        {gameStarted ? renderGame() : renderLobby()}
      </main>
    </div>
  );
}