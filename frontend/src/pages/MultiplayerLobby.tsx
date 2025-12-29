import { Link, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Autocomplete from "../components/Autocomplete";
import { useWebSocket } from "../hooks/useWebSocket";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import type { TrackSuggestion } from "../types";
import { MAX_ATTEMPTS, MAX_ROUNDS, SNIPPET_DURATIONS } from "../constants";

export default function MultiplayerLobby() {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const name = query.get("name") || "Anonymous";
  const isHost = query.get("host") === "true";

  // Use custom hooks for WebSocket and audio
  const {
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
    nextRound
  } = useWebSocket({ lobbyId: lobbyId || "", name, isHost });

  const me = players.find(p => p.id === myId);
  const won = me?.isCorrect ?? false;
  const duration = me ? SNIPPET_DURATIONS[me.currentAttempt] || 15 : 3;

  const { audioRef, isPlaying, play } = useAudioPlayer({
    previewUrl: track?.previewUrl || null,
    duration
  });

  // ------------------ GAME FUNCTIONS ------------------
  function onGuess(selected: TrackSuggestion) {
    if (!me || !track || roundOver) return;
    const correct = selected.id === track.id;
    submitGuess(correct);
  }

  // ------------------ RENDER HELPERS ------------------
  function renderScoreboard() {
    return (
      <Card className="w-64 p-4 h-full sticky top-4 bg-zinc-900 border-zinc-800 text-white">
        <h3 className="text-xl font-semibold mb-3 text-center text-emerald-400">Players ({players.length})</h3>
        <ul className="space-y-3">
          {players.sort((a, b) => b.score - a.score).map(p => (
            <Card 
              key={p.id} 
              className={`p-3 flex flex-col justify-between items-start text-sm bg-black border-zinc-800 text-white ${p.id === myId ? "border-2 border-emerald-500" : ""}`}
            >
              <div className="font-bold truncate w-full flex justify-between items-center">
                <span>{p.name} {p.isHost && "👑"}</span>
                <span className="text-lg text-emerald-400">{p.score}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                  {p.isCorrect ? "✅ Correct" : `Attempts: ${p.currentAttempt}/${MAX_ATTEMPTS}`}
              </div>
            </Card>
          ))}
        </ul>
      </Card>
    );
  }
  
  function renderLobby() {
    return (
      <Card className="p-6 w-full max-w-2xl mx-auto bg-zinc-900 border-zinc-800 text-white">
        <h2 className="text-2xl font-semibold mb-4 text-center">Waiting Room</h2>
        <p className="text-center text-lg mb-4">
          You are: <span className="font-bold text-emerald-400">{name}</span> {isHost && "(Host)"}
        </p>
        {isHost && (
          <Button onClick={startGame} className="w-full h-12 text-xl font-semibold mb-6 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700">
            Start Game
          </Button>
        )}
        <h3 className="text-xl font-semibold mb-3">Players ({players.length})</h3>
        <ul className="space-y-2">
          {players.map(p => (
            <Card key={p.id} className={`p-3 flex justify-between items-center bg-black border-zinc-800 text-white ${p.id === myId ? "border-2 border-emerald-400" : ""}`}>
              <span className="font-medium">{p.name} {p.isHost && "👑"}</span>
              <span className="font-bold">Score: {p.score}</span>
            </Card>
          ))}
        </ul>
      </Card>
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
                    <div className="bg-zinc-900 border border-yellow-500/30 px-3 py-1 rounded text-yellow-400 font-bold">
                        Timer: {minutes}:{seconds.toString().padStart(2, "0")}
                    </div>
                    <div className="bg-zinc-900 border border-purple-500/30 px-3 py-1 rounded text-purple-400 font-bold">
                        Round: {round} / {MAX_ROUNDS}
                    </div>
                </div>
                
                {track.previewUrl && <audio ref={audioRef} src={track.previewUrl || undefined} />}
                <Button
                  onClick={play}
                  disabled={isPlaying || won || roundOver || me?.currentAttempt >= MAX_ATTEMPTS}
                  className="w-24 h-24 rounded-full text-4xl mb-6"
                >
                  {isPlaying ? "⏸" : "▶️"}
                </Button>
  
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
                          isUnlocked ? "bg-emerald-500" : "bg-zinc-800"
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
                    let boxClass = "bg-zinc-900 border-zinc-800";
                    if (guess === "correct") boxClass = "bg-emerald-600 border-emerald-500";
                    else if (guess === "wrong") boxClass = "bg-red-600 border-red-500";
                    
                    // Highlight current attempt box
                    if (i === me.currentAttempt && !won && !roundOver) {
                      boxClass = "border-2 border-emerald-400 bg-emerald-500/10";
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
                  <Button
                    onClick={nextRound}
                    className="mt-6 px-6 py-2 font-bold"
                  >
                    Next Song
                  </Button>
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
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="flex items-center p-4 bg-zinc-900 border-b border-zinc-800 relative">
        <Link to="/" className="p-2 rounded-full hover:bg-zinc-800 absolute left-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="grow text-center">
          <div className="bg-zinc-900 border border-zinc-800 px-6 py-2 rounded-lg text-xl font-bold">LOBBY: {lobbyId}</div>
        </div>
      </header>
      <main className="flex flex-col items-center p-4 grow">
        {error && <div className="bg-red-800 border border-red-600 text-red-100 px-4 py-3 rounded-lg mb-6">{error}</div>}
        {gameStarted ? renderGame() : renderLobby()}
      </main>
    </div>
  );
}